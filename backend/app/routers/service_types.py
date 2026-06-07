from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies import require_admin
from app.models import ServiceType
from app.schemas import ServiceTypeCreate, ServiceTypeRead, ServiceTypeUpdate

router = APIRouter()


@router.get("/", response_model=list[ServiceTypeRead])
async def list_service_types(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServiceType).order_by(ServiceType.name))
    return result.scalars().all()


@router.post("/", response_model=ServiceTypeRead, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
async def create_service_type(payload: ServiceTypeCreate, db: AsyncSession = Depends(get_db)):
    st = ServiceType(**payload.model_dump())
    db.add(st)
    await db.flush()
    await db.refresh(st)
    return st


@router.patch("/{type_id}", response_model=ServiceTypeRead, dependencies=[Depends(require_admin)])
async def update_service_type(
    type_id: int,
    payload: ServiceTypeUpdate,
    db: AsyncSession = Depends(get_db),
):
    st = await db.get(ServiceType, type_id)
    if not st:
        raise HTTPException(status_code=404, detail="Tipo de servicio no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(st, field, value)
    await db.flush()
    await db.refresh(st)
    return st


@router.delete("/{type_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_service_type(type_id: int, db: AsyncSession = Depends(get_db)):
    st = await db.get(ServiceType, type_id)
    if not st:
        raise HTTPException(status_code=404, detail="Tipo de servicio no encontrado")
    await db.delete(st)
