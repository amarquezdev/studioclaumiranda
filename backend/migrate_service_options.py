"""
Migration: add has_options to services + create service_options table.
Run from backend/ with: python migrate_service_options.py
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "barbershop.db"

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

# ── services table ──────────────────────────────────────────────────────────
cur.execute("PRAGMA table_info(services)")
svc_cols = [row[1] for row in cur.fetchall()]

if "has_options" not in svc_cols:
    cur.execute("ALTER TABLE services ADD COLUMN has_options BOOLEAN NOT NULL DEFAULT 0")
    print("OK: Added column services.has_options")
else:
    print("-- services.has_options already exists")

if "price_from" not in svc_cols:
    cur.execute("ALTER TABLE services ADD COLUMN price_from BOOLEAN NOT NULL DEFAULT 0")
    print("OK: Added column services.price_from")
else:
    print("-- services.price_from already exists")

# ── service_options table ───────────────────────────────────────────────────
cur.execute("""
CREATE TABLE IF NOT EXISTS service_options (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    price      REAL    NOT NULL,
    is_active  BOOLEAN NOT NULL DEFAULT 1,
    price_from BOOLEAN NOT NULL DEFAULT 0
)
""")
cur.execute("CREATE INDEX IF NOT EXISTS ix_service_options_service_id ON service_options(service_id)")
print("OK: Table service_options ready")

# Add price_from to existing service_options table if missing
cur.execute("PRAGMA table_info(service_options)")
opt_cols = [row[1] for row in cur.fetchall()]
if "price_from" not in opt_cols:
    cur.execute("ALTER TABLE service_options ADD COLUMN price_from BOOLEAN NOT NULL DEFAULT 0")
    print("OK: Added column service_options.price_from")
else:
    print("-- service_options.price_from already exists")

conn.commit()
conn.close()
print("Migration complete.")
