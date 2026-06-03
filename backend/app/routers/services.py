from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_admin
from app.models import Service, ServiceOption
from app.schemas import (
    ServiceCreate, ServiceRead, ServiceUpdate,
    ServiceOptionCreate, ServiceOptionRead, ServiceOptionUpdate,
)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _service_query():
    """SELECT with options eagerly loaded."""
    return select(Service).options(selectinload(Service.options))


# ── Services ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[ServiceRead])
async def list_services(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = _service_query()
    if active_only:
        query = query.where(Service.is_active == True)  # noqa: E712
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{service_id}", response_model=ServiceRead)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(_service_query().where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return service


@router.post("/", response_model=ServiceRead, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
async def create_service(payload: ServiceCreate, db: AsyncSession = Depends(get_db)):
    service = Service(**payload.model_dump())
    db.add(service)
    await db.flush()
    result = await db.execute(_service_query().where(Service.id == service.id))
    return result.scalar_one()


@router.patch("/{service_id}", response_model=ServiceRead, dependencies=[Depends(require_admin)])
async def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(_service_query().where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    await db.flush()
    result = await db.execute(_service_query().where(Service.id == service_id))
    return result.scalar_one()


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_service(service_id: int, db: AsyncSession = Depends(get_db)):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    await db.delete(service)


# ── Service Options ───────────────────────────────────────────────────────────

@router.post("/{service_id}/options", response_model=ServiceOptionRead,
             status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_option(
    service_id: int,
    payload: ServiceOptionCreate,
    db: AsyncSession = Depends(get_db),
):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    option = ServiceOption(service_id=service_id, **payload.model_dump())
    db.add(option)
    await db.flush()
    await db.refresh(option)
    return option


@router.patch("/{service_id}/options/{option_id}", response_model=ServiceOptionRead,
              dependencies=[Depends(require_admin)])
async def update_option(
    service_id: int,
    option_id: int,
    payload: ServiceOptionUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServiceOption).where(
            ServiceOption.id == option_id,
            ServiceOption.service_id == service_id,
        )
    )
    option = result.scalar_one_or_none()
    if not option:
        raise HTTPException(status_code=404, detail="Opción no encontrada")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(option, field, value)
    await db.flush()
    await db.refresh(option)
    return option


@router.delete("/{service_id}/options/{option_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_option(
    service_id: int,
    option_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServiceOption).where(
            ServiceOption.id == option_id,
            ServiceOption.service_id == service_id,
        )
    )
    option = result.scalar_one_or_none()
    if not option:
        raise HTTPException(status_code=404, detail="Opción no encontrada")
    await db.delete(option)
