import json
import time

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import ReviewsCache

router = APIRouter()

SERPAPI   = "https://serpapi.com/search"
CACHE_TTL = 86400  # 24 horas

_data_id: str | None = None


# ── Schemas ───────────────────────────────────────────────────────────────────

class ReviewOut(BaseModel):
    author_name: str
    author_initial: str
    rating: int
    relative_time_description: str
    text: str
    profile_photo_url: str | None = None


class ReviewsResponse(BaseModel):
    overall_rating: float
    total_ratings: int
    reviews: list[ReviewOut]


# ── Caché en base de datos ────────────────────────────────────────────────────

async def _load_cache_db(db: AsyncSession) -> ReviewsResponse | None:
    row = await db.scalar(select(ReviewsCache).where(ReviewsCache.id == 1))
    if row is None:
        return None
    if time.time() - row.fetched_at > CACHE_TTL:
        return None
    return ReviewsResponse(**json.loads(row.data))


async def _save_cache_db(db: AsyncSession, result: ReviewsResponse) -> None:
    row = await db.scalar(select(ReviewsCache).where(ReviewsCache.id == 1))
    if row:
        row.fetched_at = time.time()
        row.data = json.dumps(result.model_dump(), ensure_ascii=False)
    else:
        db.add(ReviewsCache(
            id=1,
            fetched_at=time.time(),
            data=json.dumps(result.model_dump(), ensure_ascii=False),
        ))
    await db.commit()


# ── Helpers de SerpAPI ────────────────────────────────────────────────────────

async def _resolve_data_id(client: httpx.AsyncClient) -> str:
    r = await client.get(SERPAPI, params={
        "engine":   "google_maps",
        "place_id": settings.PLACE_ID,
        "api_key":  settings.SERPAPI_KEY,
        "hl":       "es",
    })
    if r.status_code != 200:
        raise HTTPException(502, f"SerpAPI error al buscar lugar: {r.status_code}")
    place = r.json().get("place_results", {})
    if place.get("data_id"):
        return place["data_id"]
    raise HTTPException(502, "No se encontró el lugar. Verifica el PLACE_ID.")


async def _fetch_from_serpapi() -> ReviewsResponse:
    global _data_id
    async with httpx.AsyncClient(timeout=15.0) as client:
        if not _data_id:
            _data_id = await _resolve_data_id(client)

        r = await client.get(SERPAPI, params={
            "engine":  "google_maps_reviews",
            "data_id": _data_id,
            "api_key": settings.SERPAPI_KEY,
            "hl":      "es",
            "sort_by": "newestFirst",
        })

    if r.status_code != 200:
        raise HTTPException(502, f"SerpAPI error al obtener reseñas: {r.status_code}")

    data       = r.json()
    place_info = data.get("place_info", {})

    reviews: list[ReviewOut] = []
    for rev in data.get("reviews", []):
        text = rev.get("snippet", "").strip()
        if not text:
            continue
        user = rev.get("user", {})
        name = user.get("name", "Anónimo")
        reviews.append(ReviewOut(
            author_name=name,
            author_initial=name[0].upper() if name else "A",
            rating=round(float(rev.get("rating", 5))),
            relative_time_description=rev.get("date", ""),
            text=text,
            profile_photo_url=user.get("thumbnail"),
        ))

    return ReviewsResponse(
        overall_rating=float(place_info.get("rating", 5.0)),
        total_ratings=int(place_info.get("reviews", 0)),
        reviews=reviews[:4],
    )


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=ReviewsResponse)
async def get_reviews(db: AsyncSession = Depends(get_db)):
    if not settings.SERPAPI_KEY:
        raise HTTPException(503, "SERPAPI_KEY no configurado en .env")

    cached = await _load_cache_db(db)
    if cached:
        return cached

    result = await _fetch_from_serpapi()
    await _save_cache_db(db, result)
    return result
