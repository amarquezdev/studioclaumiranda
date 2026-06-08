"""Cron endpoint — sends 3h reminder emails for upcoming appointments."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.email import send_reminder_email
from app.models import Appointment, AppointmentStatus, ReminderLog, Service

router = APIRouter()


@router.post("/send")
async def send_reminders(
    x_cron_secret: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
):
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="No autorizado")

    now   = datetime.now(timezone.utc)
    start = now + timedelta(minutes=150)
    end   = now + timedelta(minutes=210)

    # Appointments starting in the next 2.5–3.5h window, not cancelled
    result = await db.execute(
        select(Appointment)
        .options(
            selectinload(Appointment.user),
            selectinload(Appointment.service).selectinload(Service.options),
        )
        .where(
            Appointment.start_datetime >= start,
            Appointment.start_datetime <= end,
            Appointment.status != AppointmentStatus.cancelled,
        )
    )
    appointments = result.scalars().all()

    sent = 0
    for appt in appointments:
        # Skip if reminder already sent
        already = await db.scalar(
            select(ReminderLog).where(ReminderLog.appointment_id == appt.id)
        )
        if already:
            continue

        await send_reminder_email(appt)
        db.add(ReminderLog(appointment_id=appt.id))
        sent += 1

    await db.commit()
    return {"sent": sent}
