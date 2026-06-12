"""Ensures admin users exist on every deploy. Safe to run multiple times.

Environment variables:
  ADMIN_EMAIL      — first admin email (default: admin@studioclaumiranda.cl)
  ADMIN_PASSWORD   — first admin password (required to create if none exists)
  ADMIN_EMAIL_2    — second admin email to promote/create (optional)
  ADMIN_PASSWORD_2 — password for second admin if they need to be created (optional)
"""
import asyncio
import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.auth import get_password_hash
from app.config import settings
from app.database import _build_engine_url
from app.models import Base, User


async def _ensure_admin(db: AsyncSession, email: str, password: str, name: str = "Administrador"):
    """Promotes user to admin if exists, creates them if not. Returns True if any change was made."""
    user = await db.scalar(select(User).where(User.email == email))
    if user:
        if user.role != "admin":
            user.role = "admin"
            await db.commit()
            print(f"Promoted to admin: {email}")
            return True
        print(f"Already admin: {email}")
        return False
    if not password:
        print(f"User {email} not found and no password provided — skipping")
        return False
    user = User(
        name=name,
        email=email,
        hashed_password=get_password_hash(password),
        role="admin",
    )
    db.add(user)
    await db.commit()
    print(f"Admin created: {email}")
    return True


async def seed():
    url, connect_args = _build_engine_url(settings.DATABASE_URL)
    engine = create_async_engine(url, connect_args=connect_args)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with Session() as db:
        # First admin — only create if no admin exists yet
        email_1    = os.getenv("ADMIN_EMAIL", "admin@studioclaumiranda.cl")
        password_1 = os.getenv("ADMIN_PASSWORD", "")
        existing   = await db.scalar(select(User).where(User.role == "admin"))
        if not existing:
            if password_1:
                await _ensure_admin(db, email_1, password_1)
            else:
                print("No admin exists and ADMIN_PASSWORD not set — skipping first admin")

        # Second admin — always promote/create if env var is set
        email_2    = os.getenv("ADMIN_EMAIL_2", "")
        password_2 = os.getenv("ADMIN_PASSWORD_2", "")
        if email_2:
            await _ensure_admin(db, email_2, password_2, name="Administrador")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
