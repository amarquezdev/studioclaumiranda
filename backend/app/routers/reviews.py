import json
import time
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings

router = APIRouter()

SERPAPI   = "https://serpapi.com/search"
CACHE_TTL = 86400  # 24 horas
CACHE_FILE = Path(__file__).parent.parent.parent / "reviews_cache.json"

# data_id no cambia nunca — lo guardamos hardcoded tras resolverlo la primera vez
_data_id: str | None = None


# ── Schemas ──────────────────────────────────────────────────────────────────

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


# ── Caché en archivo ──────────────────────────────────────────────────────────

def _load_cache() -> ReviewsResponse | None:
    """Lee el caché del disco. Retorna None si no existe o expiró."""
    if not CACHE_FILE.exists():
        return None
    try:
        raw = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        if time.time() - raw.get("fetched_at", 0) > CACHE_TTL:
            return None
        return ReviewsResponse(**raw["data"])
    except Exception:
        return None


def _save_cache(result: ReviewsResponse) -> None:
    payload = {"fetched_at": time.time(), "data": result.model_dump()}
    CACHE_FILE.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


# ── Helpers de SerpAPI ────────────────────────────────────────────────────────

async def _resolve_data_id(client: httpx.AsyncClient) -> str:
    """Convierte el Place ID de Google → data_id que necesita SerpAPI (1 request)."""
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


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=ReviewsResponse)
async def get_reviews():
    if not settings.SERPAPI_KEY:
        raise HTTPException(503, "SERPAPI_KEY no configurado en .env")

    cached = _load_cache()
    if cached:
        return cached

    result = await _fetch_from_serpapi()
    _save_cache(result)
    return result
