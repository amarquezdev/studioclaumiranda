"""
Seed business hours:
  Mon–Fri  (0–4): 10:00 – 19:00
  Saturday (5):   11:00 – 16:00
  Sunday   (6):   closed
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "barbershop.db"

HOURS = [
    # (day_of_week, open_time, close_time, is_open)
    (0, "10:00:00", "19:00:00", 1),  # Monday
    (1, "10:00:00", "19:00:00", 1),  # Tuesday
    (2, "10:00:00", "19:00:00", 1),  # Wednesday
    (3, "10:00:00", "19:00:00", 1),  # Thursday
    (4, "10:00:00", "19:00:00", 1),  # Friday
    (5, "11:00:00", "16:00:00", 1),  # Saturday
    (6, "00:00:00", "00:00:00", 0),  # Sunday (closed)
]

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

for day, open_t, close_t, is_open in HOURS:
    cur.execute(
        """
        INSERT INTO business_hours (day_of_week, open_time, close_time, is_open)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(day_of_week) DO UPDATE SET
            open_time  = excluded.open_time,
            close_time = excluded.close_time,
            is_open    = excluded.is_open
        """,
        (day, open_t, close_t, is_open),
    )

conn.commit()
conn.close()
print("Business hours seeded:")
for day, open_t, close_t, is_open in HOURS:
    day_name = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"][day]
    status   = f"{open_t[:5]} – {close_t[:5]}" if is_open else "Cerrado"
    print(f"  {day_name}: {status}")
