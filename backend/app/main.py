from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import appointments, auth, availability, barbers, blocked_dates, business_hours, reminders, reviews, service_types, services, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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
