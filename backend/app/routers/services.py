from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_admin
from app.models import Service, ServiceOption, ServicePromotion, ServiceType
from app.schemas import (
    ServiceCreate, ServiceRead, ServiceUpdate,
    ServiceOptionCreate, ServiceOptionRead, ServiceOptionUpdate,
    ServicePromotionAdminRead, ServicePromotionCreate, ServicePromotionUpdate,
    ServicePromotionPublic,
)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _service_query():
    """SELECT with options, service_type and promotions eagerly loaded."""
    return select(Service).options(
        selectinload(Service.options),
        selectinload(Service.service_type),
        selectinload(Service.promotions),
    )


def _active_promotion(service: Service) -> ServicePromotionPublic | None:
    today = date.today()
    for p in service.promotions:
        if p.is_active and p.date_from <= today <= p.date_to:
            if p.promo_price is not None:
                effective = p.promo_price
            else:
                effective = round(service.price * (1 - p.discount_percent / 100))
            return ServicePromotionPublic(
                id=p.id,
                promo_price=effective,
                discount_percent=p.discount_percent,
                label=p.label,
                date_from=p.date_from,
                date_to=p.date_to,
            )
    return None


def _to_read(service: Service) -> ServiceRead:
    result = ServiceRead.model_validate(service)
    result.promotion = _active_promotion(service)
    return result


# ── Services ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[ServiceRead])
async def list_services(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = _service_query()
    if active_only:
        query = query.where(Service.is_active == True)  # noqa: E712
    result = await db.execute(query)
    return [_to_read(s) for s in result.scalars().all()]


@router.get("/{service_id}", response_model=ServiceRead)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(_service_query().where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return _to_read(service)


@router.post("/", response_model=ServiceRead, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
async def create_service(payload: ServiceCreate, db: AsyncSession = Depends(get_db)):
    service = Service(**payload.model_dump())
    db.add(service)
    await db.flush()
    result = await db.execute(_service_query().where(Service.id == service.id))
    return _to_read(result.scalar_one())


@router.patch("/{service_id}", response_model=ServiceRead, dependencies=[Depends(require_admin)])
async def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(_service_query().where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    await db.flush()
    result = await db.execute(_service_query().where(Service.id == service_id))
    return _to_read(result.scalar_one())


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_service(service_id: int, db: AsyncSession = Depends(get_db)):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    await db.delete(service)


# ── Service Options ───────────────────────────────────────────────────────────

@router.post("/{service_id}/options", response_model=ServiceOptionRead,
             status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_option(
    service_id: int,
    payload: ServiceOptionCreate,
    db: AsyncSession = Depends(get_db),
):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    option = ServiceOption(service_id=service_id, **payload.model_dump())
    db.add(option)
    await db.flush()
    await db.refresh(option)
    return option


@router.patch("/{service_id}/options/{option_id}", response_model=ServiceOptionRead,
              dependencies=[Depends(require_admin)])
async def update_option(
    service_id: int,
    option_id: int,
    payload: ServiceOptionUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServiceOption).where(
            ServiceOption.id == option_id,
            ServiceOption.service_id == service_id,
        )
    )
    option = result.scalar_one_or_none()
    if not option:
        raise HTTPException(status_code=404, detail="Opción no encontrada")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(option, field, value)
    await db.flush()
    await db.refresh(option)
    return option


@router.delete("/{service_id}/options/{option_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_option(
    service_id: int,
    option_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServiceOption).where(
            ServiceOption.id == option_id,
            ServiceOption.service_id == service_id,
        )
    )
    option = result.scalar_one_or_none()
    if not option:
        raise HTTPException(status_code=404, detail="Opción no encontrada")
    await db.delete(option)


# ── Service Promotions ────────────────────────────────────────────────────────

@router.get("/{service_id}/promotions", response_model=list[ServicePromotionAdminRead],
            dependencies=[Depends(require_admin)])
async def list_promotions(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ServicePromotion)
        .where(ServicePromotion.service_id == service_id)
        .order_by(ServicePromotion.date_from.desc())
    )
    return result.scalars().all()


@router.post("/{service_id}/promotions", response_model=ServicePromotionAdminRead,
             status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_promotion(
    service_id: int,
    payload: ServicePromotionCreate,
    db: AsyncSession = Depends(get_db),
):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    promo = ServicePromotion(service_id=service_id, **payload.model_dump())
    db.add(promo)
    await db.flush()
    await db.refresh(promo)
    return promo


@router.patch("/{service_id}/promotions/{promo_id}", response_model=ServicePromotionAdminRead,
              dependencies=[Depends(require_admin)])
async def update_promotion(
    service_id: int,
    promo_id: int,
    payload: ServicePromotionUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServicePromotion).where(
            ServicePromotion.id == promo_id,
            ServicePromotion.service_id == service_id,
        )
    )
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(promo, field, value)
    await db.flush()
    await db.refresh(promo)
    return promo


@router.delete("/{service_id}/promotions/{promo_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
async def delete_promotion(
    service_id: int,
    promo_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServicePromotion).where(
            ServicePromotion.id == promo_id,
            ServicePromotion.service_id == service_id,
        )
    )
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    await db.delete(promo)
