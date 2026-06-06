from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies import require_admin
from app.models import BlockedDate
from app.schemas import BlockedDateCreate, BlockedDateRead

router = APIRouter()


@router.get("/", response_model=list[BlockedDateRead])
async def list_blocked_dates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BlockedDate)
        .where(BlockedDate.is_active == True)
        .order_by(BlockedDate.date_from)
    )
    return result.scalars().all()


@router.post("/", response_model=BlockedDateRead, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
async def create_blocked_date(payload: BlockedDateCreate, db: AsyncSession = Depends(get_db)):
    block = BlockedDate(**payload.model_dump())
    db.add(block)
    await db.flush()
    await db.refresh(block)
    return block


@router.delete("/{block_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_blocked_date(block_id: int, db: AsyncSession = Depends(get_db)):
    block = await db.get(BlockedDate, block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Bloqueo no encontrado")
    await db.delete(block)
