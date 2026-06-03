import enum
from datetime import datetime, time

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    client = "client"
    admin = "admin"


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.client, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="user")


class Barber(Base):
    __tablename__ = "barbers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="barber")


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    has_options: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    price_from: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="service")
    options: Mapped[list["ServiceOption"]] = relationship(
        "ServiceOption", back_populates="service", cascade="all, delete-orphan"
    )


class ServiceOption(Base):
    __tablename__ = "service_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    price_from: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    service: Mapped["Service"] = relationship("Service", back_populates="options")


class BusinessHours(Base):
    __tablename__ = "business_hours"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    day_of_week: Mapped[int] = mapped_column(SmallInteger, unique=True, nullable=False)  # 0=Lun … 6=Dom
    open_time: Mapped[time] = mapped_column(Time, nullable=False)
    close_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    barber_id: Mapped[int] = mapped_column(ForeignKey("barbers.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id", ondelete="SET NULL"), nullable=True, index=True)
    start_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus), default=AppointmentStatus.pending, nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="appointments")
    barber: Mapped["Barber"] = relationship("Barber", back_populates="appointments")
    service: Mapped["Service"] = relationship("Service", back_populates="appointments")
