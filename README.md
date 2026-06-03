# Studio Clau Miranda

Sistema de reservas y gestión para estudio de belleza. Incluye sitio público con agendamiento online y panel de administración para gestionar citas, servicios, estilistas y horarios.

## Stack

| Capa | Tecnología |
|------|-----------|
| Sitio público | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI |
| Panel admin | React 18, Vite, Tailwind CSS 3 |
| API | FastAPI, SQLAlchemy 2 async, Pydantic v2 |
| Base de datos | PostgreSQL (Supabase) — SQLite para desarrollo local |
| Auth | JWT con roles `admin` / `client` |
| Reseñas | Google Places vía SerpAPI |

## Estructura

```
studioclaumiranda/
├── v0/           # Sitio público (Next.js) → Vercel
├── frontend/     # Panel de administración (React + Vite)
└── backend/      # API REST (FastAPI) → Render
```

## Desarrollo local

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env          # completar variables
uvicorn app.main:app --reload
```

API disponible en `http://localhost:8000`  
Documentación interactiva en `http://localhost:8000/docs`

### Sitio público (v0)

```bash
cd v0
npm install
npm run dev
```

Disponible en `http://localhost:3000`

### Panel de administración

```bash
cd frontend
npm install
npm run dev
```

Disponible en `http://localhost:5173`

## Variables de entorno

Copiar `backend/.env.example` a `backend/.env` y completar:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de la base de datos (ver `.env.example` para formatos) |
| `SECRET_KEY` | Clave secreta para JWT (mínimo 32 caracteres) |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos, separados por coma |
| `SERPAPI_KEY` | API key de SerpAPI para reseñas de Google |

## Deploy

**Sitio público** → [Vercel](https://vercel.com)  
Root directory: `v0` — Next.js se auto-detecta.

**API** → [Render](https://render.com)  
El archivo `render.yaml` en la raíz configura el servicio automáticamente.  
Build: `pip install -r requirements.txt`  
Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Base de datos** → [Supabase](https://supabase.com)  
Configurar `DATABASE_URL` en Render con el formato:
```
postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

## Modelos principales

```
User ──────────┐
               ├── Appointment
Barber ────────┤       └── Service ── ServiceOption
               
BusinessHours  (horario por día de semana, 0=Lunes…6=Domingo)
```

**Estados de cita:** `pending` → `confirmed` → `completed` / `cancelled`

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/login` | Obtener token JWT |
| `GET` | `/services` | Listar servicios |
| `GET` | `/barbers` | Listar estilistas |
| `GET` | `/availability` | Disponibilidad por fecha y estilista |
| `POST` | `/appointments` | Crear cita |
| `GET` | `/appointments` | Listar citas (admin) |
| `GET` | `/reviews` | Reseñas de Google Places |
| `GET` | `/business-hours` | Horario del estudio |
| `GET` | `/health` | Health check |
