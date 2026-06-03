from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import Appointment, AppointmentStatus, Barber, BusinessHours, Service
from app.schemas import AvailabilityResponse, TimeSlot

router = APIRouter()


@router.get("/", response_model=AvailabilityResponse)
async def get_availability(
    date: date = Query(..., description="Fecha a consultar, ej: 2025-07-15"),
    barber_id: int = Query(...),
    service_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    barber = await db.get(Barber, barber_id)
    if not barber or not barber.is_active:
        raise HTTPException(status_code=404, detail="Barbero no encontrado o inactivo")

    service = await db.get(Service, service_id)
    if not service or not service.is_active:
        raise HTTPException(status_code=404, detail="Servicio no encontrado o inactivo")

    # Horario del día de la semana (0=Lun … 6=Dom)
    day_of_week = date.weekday()
    bh_result = await db.execute(
        select(BusinessHours).where(BusinessHours.day_of_week == day_of_week)
    )
    bh = bh_result.scalar_one_or_none()
    if not bh or not bh.is_open:
        return AvailabilityResponse(
            date=str(date),
            barber_id=barber_id,
            service_id=service_id,
            duration_minutes=service.duration_minutes,
            slots=[],
        )

    # Use naive datetimes — stored times and generated slots are all local (no timezone)
    day_open  = datetime.combine(date, bh.open_time)
    day_close = datetime.combine(date, bh.close_time)
    duration  = timedelta(minutes=service.duration_minutes)

    # Citas existentes del barbero ese día (naive comparison)
    existing_result = await db.execute(
        select(Appointment).where(
            Appointment.barber_id == barber_id,
            Appointment.status.not_in([AppointmentStatus.cancelled]),
            Appointment.start_datetime >= day_open,
            Appointment.start_datetime < day_close,
        )
    )
    bookings = existing_result.scalars().all()

    # Strip timezone info from stored datetimes if present, for consistent comparison
    def naive(dt: datetime) -> datetime:
        return dt.replace(tzinfo=None) if dt.tzinfo else dt

    booked_ranges = [(naive(a.start_datetime), naive(a.end_datetime)) for a in bookings]

    # Generar slots libres en intervalos de 30 min
    # Para cada slot se verifica que el servicio cabe completo y no hay conflicto
    STEP   = timedelta(minutes=30)
    slots: list[TimeSlot] = []
    cursor = day_open
    now    = datetime.now()  # naive local time

    while cursor + duration <= day_close:
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
        date=str(date),
        barber_id=barber_id,
        service_id=service_id,
        duration_minutes=service.duration_minutes,
        slots=slots,
    )
