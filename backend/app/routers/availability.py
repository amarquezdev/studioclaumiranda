from datetime import date, datetime, time as time_t, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import Appointment, AppointmentStatus, Barber, BlockedDate, BusinessHours, Service
from app.schemas import AvailabilityResponse, TimeSlot

router = APIRouter()

SALON_TZ = ZoneInfo("America/Santiago")


@router.get("/", response_model=AvailabilityResponse)
async def get_availability(
    date: date = Query(..., description="Fecha a consultar, ej: 2025-07-15"),
    barber_id: int = Query(...),
    service_id: int | None = Query(None),
    service_ids: str | None = Query(None, description="IDs separados por coma: 1,2,3"),
    exclude_appointment_id: int | None = Query(None, description="ID de cita a excluir del chequeo de conflictos (usado al editar)"),
    show_all: bool = Query(False, description="Si es true, devuelve todos los slots marcando los ocupados con available=false"),
    debug: bool = Query(False, description="Si es true, incluye información de diagnóstico en la respuesta"),
    db: AsyncSession = Depends(get_db),
):
    # Resolve which service IDs to use
    ids: list[int] = []
    if service_ids:
        ids = [int(x.strip()) for x in service_ids.split(",") if x.strip()]
    elif service_id:
        ids = [service_id]
    else:
        raise HTTPException(status_code=422, detail="Se requiere service_id o service_ids")

    barber = await db.get(Barber, barber_id)
    if not barber or not barber.is_active:
        raise HTTPException(status_code=404, detail="Barbero no encontrado o inactivo")

    services_list: list[Service] = []
    for sid in ids:
        svc = await db.get(Service, sid)
        if not svc or not svc.is_active:
            raise HTTPException(status_code=404, detail=f"Servicio {sid} no encontrado o inactivo")
        services_list.append(svc)

    total_duration = sum(s.duration_minutes for s in services_list)
    primary_id = ids[0]

    # Verificar si la fecha está bloqueada
    blocked_result = await db.execute(
        select(BlockedDate).where(
            BlockedDate.is_active == True,  # noqa: E712
            BlockedDate.date_from <= date,
            BlockedDate.date_to   >= date,
        )
    )
    blocked_record = blocked_result.scalar_one_or_none()
    if blocked_record:
        debug_info = {"reason": "blocked_date", "blocked_date_id": blocked_record.id, "reason_text": blocked_record.reason} if debug else None
        return AvailabilityResponse(
            date=str(date), barber_id=barber_id,
            service_id=primary_id, duration_minutes=total_duration, slots=[],
            debug=debug_info,
        )

    if show_all:
        # Admin context: always use 09:00–18:00 regardless of business hours config.
        day_open  = datetime.combine(date, time_t(9, 0))
        day_close = datetime.combine(date, time_t(18, 0))
    else:
        day_of_week = date.weekday()
        bh_result = await db.execute(
            select(BusinessHours).where(BusinessHours.day_of_week == day_of_week)
        )
        bh = bh_result.scalar_one_or_none()
        if not bh or not bh.is_open:
            debug_info = {"reason": "business_hours_closed", "day_of_week": day_of_week, "bh_found": bh is not None, "is_open": bh.is_open if bh else None} if debug else None
            return AvailabilityResponse(
                date=str(date), barber_id=barber_id,
                service_id=primary_id, duration_minutes=total_duration, slots=[],
                debug=debug_info,
            )
        day_open  = datetime.combine(date, bh.open_time)
        day_close = datetime.combine(date, bh.close_time)
    duration  = timedelta(minutes=total_duration)

    # Use timezone-aware datetimes for the DB query so PostgreSQL (TIMESTAMPTZ) compares correctly.
    day_open_tz  = day_open.replace(tzinfo=SALON_TZ)
    day_close_tz = day_close.replace(tzinfo=SALON_TZ)

    conflict_filters = [
        Appointment.barber_id == barber_id,
        Appointment.status.not_in([AppointmentStatus.cancelled]),
        Appointment.start_datetime < day_close_tz,
        Appointment.end_datetime > day_open_tz,
    ]
    if exclude_appointment_id:
        conflict_filters.append(Appointment.id != exclude_appointment_id)

    existing_result = await db.execute(
        select(Appointment).where(*conflict_filters)
    )
    bookings = existing_result.scalars().all()

    def to_local_naive(dt: datetime) -> datetime:
        """Convert a timezone-aware UTC datetime to a naive local (salon) datetime."""
        return dt.astimezone(SALON_TZ).replace(tzinfo=None) if dt.tzinfo else dt

    booked_ranges = [(to_local_naive(a.start_datetime), to_local_naive(a.end_datetime)) for a in bookings]

    STEP   = timedelta(minutes=15)
    slots: list[TimeSlot] = []
    cursor = day_open
    # Use salon local time so slots are filtered correctly regardless of server timezone.
    now    = datetime.now(SALON_TZ).replace(tzinfo=None)

    while cursor <= day_close:
        slot_end = cursor + duration
        overlap = any(
            cursor < b_end and slot_end > b_start
            for b_start, b_end in booked_ranges
        )
        cursor_tz   = cursor.replace(tzinfo=SALON_TZ)
        slot_end_tz = slot_end.replace(tzinfo=SALON_TZ)
        if show_all:
            # Admin: show all slots for the day regardless of current time.
            slots.append(TimeSlot(start=cursor_tz, end=slot_end_tz, available=not overlap))
        elif cursor > now and not overlap:
            slots.append(TimeSlot(start=cursor_tz, end=slot_end_tz, available=True))
        cursor += STEP

    debug_info = None
    if debug:
        debug_info = {
            "day_open": str(day_open),
            "day_close": str(day_close),
            "duration_minutes": total_duration,
            "services": [{"id": s.id, "name": s.name, "duration_minutes": s.duration_minutes} for s in services_list],
            "appointments_found": [
                {
                    "id": a.id,
                    "start_utc": str(a.start_datetime),
                    "end_utc": str(a.end_datetime),
                    "start_local": str(to_local_naive(a.start_datetime)),
                    "end_local": str(to_local_naive(a.end_datetime)),
                    "status": str(a.status),
                }
                for a in bookings
            ],
            "booked_ranges_local": [
                {"start": str(b_start), "end": str(b_end)}
                for b_start, b_end in booked_ranges
            ],
            "slots_returned": len(slots),
        }

    return AvailabilityResponse(
        date=str(date), barber_id=barber_id,
        service_id=primary_id, duration_minutes=total_duration, slots=slots,
        debug=debug_info,
    )
