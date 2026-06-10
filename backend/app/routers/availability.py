from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import Appointment, AppointmentStatus, Barber, BlockedDate, BusinessHours, Service
from app.schemas import AvailabilityResponse, TimeSlot

router = APIRouter()


@router.get("/", response_model=AvailabilityResponse)
async def get_availability(
    date: date = Query(..., description="Fecha a consultar, ej: 2025-07-15"),
    barber_id: int = Query(...),
    service_id: int | None = Query(None),
    service_ids: str | None = Query(None, description="IDs separados por coma: 1,2,3"),
    exclude_appointment_id: int | None = Query(None, description="ID de cita a excluir del chequeo de conflictos (usado al editar)"),
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
    if blocked_result.scalar_one_or_none():
        return AvailabilityResponse(
            date=str(date), barber_id=barber_id,
            service_id=primary_id, duration_minutes=total_duration, slots=[],
        )

    day_of_week = date.weekday()
    bh_result = await db.execute(
        select(BusinessHours).where(BusinessHours.day_of_week == day_of_week)
    )
    bh = bh_result.scalar_one_or_none()
    if not bh or not bh.is_open:
        return AvailabilityResponse(
            date=str(date), barber_id=barber_id,
            service_id=primary_id, duration_minutes=total_duration, slots=[],
        )

    day_open  = datetime.combine(date, bh.open_time)
    day_close = datetime.combine(date, bh.close_time)
    duration  = timedelta(minutes=total_duration)

    conflict_filters = [
        Appointment.barber_id == barber_id,
        Appointment.status.not_in([AppointmentStatus.cancelled]),
        Appointment.start_datetime >= day_open,
        Appointment.start_datetime <= day_close,
    ]
    if exclude_appointment_id:
        conflict_filters.append(Appointment.id != exclude_appointment_id)

    existing_result = await db.execute(
        select(Appointment).where(*conflict_filters)
    )
    bookings = existing_result.scalars().all()

    def naive(dt: datetime) -> datetime:
        return dt.replace(tzinfo=None) if dt.tzinfo else dt

    booked_ranges = [(naive(a.start_datetime), naive(a.end_datetime)) for a in bookings]

    STEP   = timedelta(minutes=30)
    slots: list[TimeSlot] = []
    cursor = day_open
    now    = datetime.now()

    # Slots are valid as long as they START within the booking window (close_time = last start time).
    # A service may extend past close_time; only the start must fall within 09:00–18:00.
    while cursor <= day_close:
        slot_end = cursor + duration
        if slot_end > now:
            overlap = any(
                cursor < b_end and slot_end > b_start
                for b_start, b_end in booked_ranges
            )
            if not overlap:
                slots.append(TimeSlot(start=cursor, end=slot_end))
        cursor += STEP

    return AvailabilityResponse(
        date=str(date), barber_id=barber_id,
        service_id=primary_id, duration_minutes=total_duration, slots=slots,
    )
