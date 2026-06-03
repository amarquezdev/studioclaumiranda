from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies import require_admin
from app.models import BusinessHours
from app.schemas import BusinessHoursRead, BusinessHoursUpdate

router = APIRouter()

DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]


@router.get("/", response_model=list[BusinessHoursRead])
async def list_business_hours(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BusinessHours).order_by(BusinessHours.day_of_week))
    return result.scalars().all()


@router.get("/{day_of_week}", response_model=BusinessHoursRead)
async def get_day_hours(day_of_week: int, db: AsyncSession = Depends(get_db)):
    if day_of_week not in range(7):
        raise HTTPException(status_code=400, detail="day_of_week debe ser 0 (Lun) – 6 (Dom)")
    result = await db.execute(
        select(BusinessHours).where(BusinessHours.day_of_week == day_of_week)
    )
    bh = result.scalar_one_or_none()
    if not bh:
        raise HTTPException(status_code=404, detail=f"Sin horario configurado para {DAY_NAMES[day_of_week]}")
    return bh


@router.put("/{day_of_week}", response_model=BusinessHoursRead, dependencies=[Depends(require_admin)])
async def upsert_business_hours(
    day_of_week: int,
    payload: BusinessHoursUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Crea o actualiza el horario de atención para un día (0=Lun … 6=Dom)."""
    if day_of_week not in range(7):
        raise HTTPException(status_code=400, detail="day_of_week debe ser 0 (Lun) – 6 (Dom)")

    result = await db.execute(
        select(BusinessHours).where(BusinessHours.day_of_week == day_of_week)
    )
    bh = result.scalar_one_or_none()
    data = payload.model_dump(exclude_unset=True)

    if bh is None:
        if "open_time" not in data or "close_time" not in data:
            raise HTTPException(
                status_code=400,
                detail="open_time y close_time son obligatorios al crear un nuevo horario",
            )
        bh = BusinessHours(day_of_week=day_of_week, **data)
        db.add(bh)
    else:
        for field, value in data.items():
            setattr(bh, field, value)

    await db.flush()
    await db.refresh(bh)
    return bh
