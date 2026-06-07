"""
Migration: create service_types table + add service_type_id to services.
Run from backend/ with: python migrate_service_types.py
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "barbershop.db"

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

# ── service_types table ─────────────────────────────────────────────────────
cur.execute("""
CREATE TABLE IF NOT EXISTS service_types (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT 1
)
""")
cur.execute("CREATE INDEX IF NOT EXISTS ix_service_types_id ON service_types(id)")
print("OK: Table service_types ready")

# ── services.service_type_id column ─────────────────────────────────────────
cur.execute("PRAGMA table_info(services)")
svc_cols = [row[1] for row in cur.fetchall()]

if "service_type_id" not in svc_cols:
    cur.execute("ALTER TABLE services ADD COLUMN service_type_id INTEGER REFERENCES service_types(id) ON DELETE SET NULL")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_services_service_type_id ON services(service_type_id)")
    print("OK: Added column services.service_type_id")
else:
    print("-- services.service_type_id already exists")

conn.commit()
conn.close()
print("Migration complete.")
