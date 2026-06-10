from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_active_user, require_admin
from app.models import Appointment, AppointmentService, AppointmentStatus, Barber, Service, ServiceOption, User
from app.auth import get_password_hash
from app.schemas import AppointmentCreate, AppointmentRead, AppointmentStatusUpdate, AppointmentUpdate, GuestAppointmentCreate
from app.email import send_confirmation_email, send_stylist_notification_email

router = APIRouter()


async def _load_appointment(db: AsyncSession, appointment_id: int) -> Appointment:
    result = await db.execute(
        select(Appointment)
        .options(
            selectinload(Appointment.user),
            selectinload(Appointment.barber),
            selectinload(Appointment.service).selectinload(Service.options),
            selectinload(Appointment.service).selectinload(Service.service_type),
            selectinload(Appointment.appointment_services)
                .selectinload(AppointmentService.service)
                .selectinload(Service.options),
            selectinload(Appointment.appointment_services)
                .selectinload(AppointmentService.service)
                .selectinload(Service.service_type),
        )
        .where(Appointment.id == appointment_id)
    )
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return appt


@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    barber = await db.get(Barber, payload.barber_id)
    if not barber or not barber.is_active:
        raise HTTPException(status_code=404, detail="Barbero no encontrado o inactivo")

    services_list: list[Service] = []
    for sid in payload.service_ids:
        svc = await db.get(Service, sid)
        if not svc or not svc.is_active:
            raise HTTPException(status_code=404, detail=f"Servicio {sid} no encontrado o inactivo")
        services_list.append(svc)

    total_duration = sum(s.duration_minutes for s in services_list)
    end_dt = payload.start_datetime + timedelta(minutes=total_duration)

    conflict = await db.execute(
        select(Appointment).where(
            Appointment.barber_id == payload.barber_id,
            Appointment.status.not_in([AppointmentStatus.cancelled]),
            Appointment.start_datetime < end_dt,
            Appointment.end_datetime > payload.start_datetime,
        )
    )
    if conflict.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="El horario ya está reservado")

    appt = Appointment(
        user_id=current_user.id,
        barber_id=payload.barber_id,
        service_id=services_list[0].id,
        start_datetime=payload.start_datetime,
        end_datetime=end_dt,
        notes=payload.notes,
    )
    db.add(appt)
    await db.flush()
    for svc in services_list:
        db.add(AppointmentService(appointment_id=appt.id, service_id=svc.id))
    await db.flush()
    loaded = await _load_appointment(db, appt.id)
    background_tasks.add_task(send_confirmation_email, loaded)
    background_tasks.add_task(send_stylist_notification_email, loaded)
    return loaded


@router.post("/guest", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
async def create_guest_appointment(
    payload: GuestAppointmentCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Crea una cita sin requerir autenticación. Crea el usuario si no existe."""
    # Buscar o crear usuario por email
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user:
        import secrets
        user = User(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            hashed_password=get_password_hash(secrets.token_hex(16)),
        )
        db.add(user)
        await db.flush()
    else:
        # Actualizar nombre/teléfono si el usuario ya existe
        if payload.name:
            user.name = payload.name
        if payload.phone:
            user.phone = payload.phone

    barber = await db.get(Barber, payload.barber_id)
    if not barber or not barber.is_active:
        raise HTTPException(status_code=404, detail="Barbero no encontrado o inactivo")

    services_list: list[Service] = []
    for sid in payload.service_ids:
        svc = await db.get(Service, sid)
        if not svc or not svc.is_active:
            raise HTTPException(status_code=404, detail=f"Servicio {sid} no encontrado o inactivo")
        services_list.append(svc)

    total_duration = sum(s.duration_minutes for s in services_list)
    end_dt = payload.start_datetime + timedelta(minutes=total_duration)

    conflict = await db.execute(
        select(Appointment).where(
            Appointment.barber_id == payload.barber_id,
            Appointment.status.not_in([AppointmentStatus.cancelled]),
            Appointment.start_datetime < end_dt,
            Appointment.end_datetime > payload.start_datetime,
        )
    )
    if conflict.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="El horario ya está reservado")

    appt = Appointment(
        user_id=user.id,
        barber_id=payload.barber_id,
        service_id=services_list[0].id,
        start_datetime=payload.start_datetime,
        end_datetime=end_dt,
        notes=payload.notes,
    )
    db.add(appt)
    await db.flush()
    for svc in services_list:
        db.add(AppointmentService(appointment_id=appt.id, service_id=svc.id))
    await db.flush()
    loaded = await _load_appointment(db, appt.id)
    background_tasks.add_task(send_confirmation_email, loaded)
    background_tasks.add_task(send_stylist_notification_email, loaded)
    return loaded


@router.get("/me", response_model=list[AppointmentRead])
async def get_my_appointments(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment)
        .options(
            selectinload(Appointment.barber),
            selectinload(Appointment.service).selectinload(Service.options),
            selectinload(Appointment.service).selectinload(Service.service_type),
            selectinload(Appointment.appointment_services)
                .selectinload(AppointmentService.service)
                .selectinload(Service.options),
            selectinload(Appointment.appointment_services)
                .selectinload(AppointmentService.service)
                .selectinload(Service.service_type),
        )
        .where(Appointment.user_id == current_user.id)
        .order_by(Appointment.start_datetime.desc())
    )
    return result.scalars().all()


@router.get("/", response_model=list[AppointmentRead], dependencies=[Depends(require_admin)])
async def list_all_appointments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment)
        .options(
            selectinload(Appointment.user),
            selectinload(Appointment.barber),
            selectinload(Appointment.service).selectinload(Service.options),
            selectinload(Appointment.service).selectinload(Service.service_type),
            selectinload(Appointment.appointment_services)
                .selectinload(AppointmentService.service)
                .selectinload(Service.options),
            selectinload(Appointment.appointment_services)
                .selectinload(AppointmentService.service)
                .selectinload(Service.service_type),
        )
        .offset(skip)
        .limit(limit)
        .order_by(Appointment.start_datetime.desc())
    )
    return result.scalars().all()


@router.get("/{appointment_id}", response_model=AppointmentRead)
async def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    appt = await _load_appointment(db, appointment_id)
    if current_user.role != "admin" and appt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    return appt


@router.patch("/{appointment_id}/status", response_model=AppointmentRead)
async def update_appointment_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    appt = await _load_appointment(db, appointment_id)

    if current_user.role != "admin":
        if appt.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="No autorizado")
        if payload.status != AppointmentStatus.cancelled:
            raise HTTPException(status_code=403, detail="Los clientes solo pueden cancelar citas")

    appt.status = payload.status
    await db.flush()
    await db.refresh(appt)
    return appt


@router.patch("/{appointment_id}", response_model=AppointmentRead, dependencies=[Depends(require_admin)])
async def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
):
    appt = await _load_appointment(db, appointment_id)

    barber_id = payload.barber_id or appt.barber_id
    start_dt  = payload.start_datetime or appt.start_datetime

    if payload.barber_id:
        barber = await db.get(Barber, payload.barber_id)
        if not barber or not barber.is_active:
            raise HTTPException(status_code=404, detail="Barbero no encontrado o inactivo")

    services_list = None
    if payload.service_ids:
        services_list = []
        for sid in payload.service_ids:
            svc = await db.get(Service, sid)
            if not svc or not svc.is_active:
                raise HTTPException(status_code=404, detail=f"Servicio {sid} no encontrado o inactivo")
            services_list.append(svc)

    if services_list:
        total_duration = sum(s.duration_minutes for s in services_list)
        end_dt = start_dt + timedelta(minutes=total_duration)
    else:
        duration = appt.end_datetime - appt.start_datetime
        end_dt = start_dt + duration

    conflict = await db.execute(
        select(Appointment).where(
            Appointment.id != appointment_id,
            Appointment.barber_id == barber_id,
            Appointment.status.not_in([AppointmentStatus.cancelled]),
            Appointment.start_datetime < end_dt,
            Appointment.end_datetime > start_dt,
        )
    )
    if conflict.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="El horario ya está reservado")

    appt.barber_id     = barber_id
    appt.start_datetime = start_dt
    appt.end_datetime   = end_dt
    if payload.notes is not None:
        appt.notes = payload.notes

    if services_list:
        appt.service_id = services_list[0].id
        existing = await db.execute(
            select(AppointmentService).where(AppointmentService.appointment_id == appointment_id)
        )
        for rel in existing.scalars().all():
            await db.delete(rel)
        await db.flush()
        for svc in services_list:
            db.add(AppointmentService(appointment_id=appt.id, service_id=svc.id))

    await db.flush()
    return await _load_appointment(db, appointment_id)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    appt = await db.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if current_user.role != "admin" and appt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    await db.delete(appt)
