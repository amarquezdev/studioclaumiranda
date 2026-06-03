from datetime import datetime, time

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import AppointmentStatus, UserRole


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Token / Auth
# ---------------------------------------------------------------------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(None, max_length=30)
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=120)
    phone: str | None = Field(None, max_length=30)


class UserAdminUpdate(UserUpdate):
    role: UserRole | None = None


class UserRead(OrmBase):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    role: UserRole
    created_at: datetime


# ---------------------------------------------------------------------------
# Barber
# ---------------------------------------------------------------------------

class BarberCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(None, max_length=30)
    bio: str | None = None


class BarberUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)
    bio: str | None = None
    is_active: bool | None = None


class BarberRead(OrmBase):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    bio: str | None
    is_active: bool


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class ServiceOptionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    price: float = Field(..., ge=0)
    price_from: bool = False


class ServiceOptionUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=120)
    price: float | None = Field(None, ge=0)
    is_active: bool | None = None
    price_from: bool | None = None


class ServiceOptionRead(OrmBase):
    id: int
    service_id: int
    name: str
    price: float
    is_active: bool
    price_from: bool


class ServiceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    description: str | None = None
    duration_minutes: int = Field(..., ge=5, le=480)
    price: float = Field(..., ge=0)
    has_options: bool = False
    price_from: bool = False


class ServiceUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=120)
    description: str | None = None
    duration_minutes: int | None = Field(None, ge=5, le=480)
    price: float | None = Field(None, ge=0)
    is_active: bool | None = None
    has_options: bool | None = None
    price_from: bool | None = None


class ServiceRead(OrmBase):
    id: int
    name: str
    description: str | None
    duration_minutes: int
    price: float
    is_active: bool
    has_options: bool
    price_from: bool
    options: list[ServiceOptionRead] = []


# ---------------------------------------------------------------------------
# BusinessHours
# ---------------------------------------------------------------------------

class BusinessHoursUpdate(BaseModel):
    open_time: time | None = None
    close_time: time | None = None
    is_open: bool | None = None

    @field_validator("close_time", mode="after")
    @classmethod
    def close_after_open(cls, v, info):
        open_time = info.data.get("open_time")
        if v and open_time and v <= open_time:
            raise ValueError("close_time debe ser posterior a open_time")
        return v


class BusinessHoursRead(OrmBase):
    id: int
    day_of_week: int
    open_time: time
    close_time: time
    is_open: bool


# ---------------------------------------------------------------------------
# Appointment
# ---------------------------------------------------------------------------

class AppointmentCreate(BaseModel):
    barber_id: int
    service_id: int
    start_datetime: datetime
    notes: str | None = None


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class GuestAppointmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(None, max_length=30)
    barber_id: int
    service_id: int
    start_datetime: datetime
    notes: str | None = None


class AppointmentRead(OrmBase):
    id: int
    user_id: int
    barber_id: int
    service_id: int | None
    start_datetime: datetime
    end_datetime: datetime
    status: AppointmentStatus
    notes: str | None
    created_at: datetime
    user: UserRead | None = None
    barber: BarberRead | None = None
    service: ServiceRead | None = None


# ---------------------------------------------------------------------------
# Availability
# ---------------------------------------------------------------------------

class TimeSlot(BaseModel):
    start: datetime
    end: datetime


class AvailabilityResponse(BaseModel):
    date: str
    barber_id: int
    service_id: int
    duration_minutes: int
    slots: list[TimeSlot]
