from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies import get_current_active_user, require_admin
from app.models import User
from app.schemas import UserAdminUpdate, UserRead, UserUpdate

router = APIRouter()


@router.get("/", response_model=list[UserRead], dependencies=[Depends(require_admin)])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/me", response_model=UserRead)
async def get_own_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/{user_id}", response_model=UserRead, dependencies=[Depends(require_admin)])
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.patch("/me", response_model=UserRead)
async def update_own_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(current_user, field, value)
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.patch("/{user_id}", response_model=UserRead, dependencies=[Depends(require_admin)])
async def admin_update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await db.delete(user)
