"""Promotes an existing user to admin, or creates them if they don't exist.

Usage:
    python promote_to_admin.py <email> [password]

The password is only required when the user doesn't exist yet.
"""
import asyncio
import sys

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.auth import get_password_hash
from app.config import settings
from app.database import _build_engine_url
from app.models import Base, User


async def promote(email: str, password: str = ""):
    url, connect_args = _build_engine_url(settings.DATABASE_URL)
    engine = create_async_engine(url, connect_args=connect_args)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with Session() as db:
        user = await db.scalar(select(User).where(User.email == email))
        if user:
            if user.role == "admin":
                print(f"{email} ya es administrador/a.")
            else:
                user.role = "admin"
                await db.commit()
                print(f"Rol actualizado a admin para: {email}")
        else:
            if not password:
                print("El usuario no existe. Proporciona una contraseña como segundo argumento para crearlo.")
                return
            new_user = User(
                name="Administrador",
                email=email,
                hashed_password=get_password_hash(password),
                role="admin",
            )
            db.add(new_user)
            await db.commit()
            print(f"Usuario admin creado: {email}")

    await engine.dispose()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python promote_to_admin.py <email> [password]")
        sys.exit(1)
    asyncio.run(promote(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else ""))
