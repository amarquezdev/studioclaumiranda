from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _build_engine_url(url: str):
    """Strip sslmode from URL (asyncpg ignores it) and return clean URL + connect_args."""
    parsed = urlparse(url)
    is_postgres = parsed.scheme.startswith("postgresql")
    params = {k: v[0] for k, v in parse_qs(parsed.query).items() if k != "sslmode"}
    clean_url = urlunparse(parsed._replace(query=urlencode(params)))
    connect_args = {"ssl": "require"} if is_postgres else {}
    return clean_url, connect_args


_db_url, _connect_args = _build_engine_url(settings.DATABASE_URL)

engine = create_async_engine(
    _db_url,
    echo=False,
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
