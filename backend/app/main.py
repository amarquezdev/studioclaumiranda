from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import appointments, auth, availability, barbers, blocked_dates, business_hours, reminders, reviews, service_types, services, users


async def _run_migrations(conn):
    await conn.run_sync(Base.metadata.create_all)
    from sqlalchemy import text
    from app.database import _db_url
    if _db_url.startswith("postgresql"):
        # Add service_type_id to services if missing
        await conn.execute(text(
            "ALTER TABLE services ADD COLUMN IF NOT EXISTS "
            "service_type_id INTEGER REFERENCES service_types(id) ON DELETE SET NULL"
        ))
        # Ensure appointment_services junction table exists (create_all covers new tables,
        # but belt-and-suspenders for older deployments)
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS appointment_services (
                id SERIAL PRIMARY KEY,
                appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE
            )
        """))
    else:
        # SQLite: check via pragma then alter
        result = await conn.execute(text("PRAGMA table_info(services)"))
        cols = [row[1] for row in result.fetchall()]
        if "service_type_id" not in cols:
            await conn.execute(text(
                "ALTER TABLE services ADD COLUMN service_type_id INTEGER "
                "REFERENCES service_types(id) ON DELETE SET NULL"
            ))


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await _run_migrations(conn)
    yield
    await engine.dispose()


app = FastAPI(
    title="Barbershop Scheduler API",
    version="1.0.0",
    description="API REST para agendar citas en una peluquería",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",")],
    allow_origin_regex=r"https://(studioclaumiranda\.cl|www\.studioclaumiranda\.cl|studioclaumiranda.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,           prefix="/auth",           tags=["Auth"])
app.include_router(users.router,          prefix="/users",          tags=["Usuarios"])
app.include_router(barbers.router,        prefix="/barbers",        tags=["Barberos"])
app.include_router(services.router,       prefix="/services",       tags=["Servicios"])
app.include_router(service_types.router,  prefix="/service-types",  tags=["Tipos de Servicio"])
app.include_router(business_hours.router, prefix="/business-hours", tags=["Horarios"])
app.include_router(appointments.router,   prefix="/appointments",   tags=["Citas"])
app.include_router(availability.router,   prefix="/availability",   tags=["Disponibilidad"])
app.include_router(reviews.router,        prefix="/reviews",        tags=["Reseñas"])
app.include_router(reminders.router,      prefix="/reminders",      tags=["Recordatorios"])
app.include_router(blocked_dates.router,  prefix="/blocked-dates",  tags=["Bloqueos"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
