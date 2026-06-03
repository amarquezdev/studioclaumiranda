from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies import require_admin
from app.models import Barber
from app.schemas import BarberCreate, BarberRead, BarberUpdate

router = APIRouter()


@router.get("/", response_model=list[BarberRead])
async def list_barbers(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = select(Barber)
    if active_only:
        query = query.where(Barber.is_active == True)  # noqa: E712
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{barber_id}", response_model=BarberRead)
async def get_barber(barber_id: int, db: AsyncSession = Depends(get_db)):
    barber = await db.get(Barber, barber_id)
    if not barber:
        raise HTTPException(status_code=404, detail="Barbero no encontrado")
    return barber


@router.post("/", response_model=BarberRead, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
async def create_barber(payload: BarberCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Barber).where(Barber.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya en uso")
    barber = Barber(**payload.model_dump())
    db.add(barber)
    await db.flush()
    await db.refresh(barber)
    return barber


@router.patch("/{barber_id}", response_model=BarberRead, dependencies=[Depends(require_admin)])
async def update_barber(
    barber_id: int,
    payload: BarberUpdate,
    db: AsyncSession = Depends(get_db),
):
    barber = await db.get(Barber, barber_id)
    if not barber:
        raise HTTPException(status_code=404, detail="Barbero no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(barber, field, value)
    await db.flush()
    await db.refresh(barber)
    return barber


@router.delete("/{barber_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_barber(barber_id: int, db: AsyncSession = Depends(get_db)):
    barber = await db.get(Barber, barber_id)
    if not barber:
        raise HTTPException(status_code=404, detail="Barbero no encontrado")
    await db.delete(barber)
