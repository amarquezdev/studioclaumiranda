import bcrypt
import sqlite3
import datetime

hashed = bcrypt.hashpw("Admin1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

con = sqlite3.connect("barbershop.db")
cur = con.cursor()

cur.execute("SELECT id FROM users WHERE email = ?", ("alejandro78248@gmail.com",))
existing = cur.fetchone()

if existing:
    cur.execute("UPDATE users SET hashed_password=?, role='admin' WHERE email=?",
                (hashed, "alejandro78248@gmail.com"))
    print("Usuario actualizado a admin correctamente.")
else:
    cur.execute(
        "INSERT INTO users (name, email, hashed_password, role, created_at) VALUES (?, ?, ?, 'admin', ?)",
        ("Alejandro", "alejandro78248@gmail.com", hashed, datetime.datetime.utcnow().isoformat())
    )
    print(f"Usuario admin creado con id: {cur.lastrowid}")

con.commit()
con.close()
print("Listo. Puedes iniciar sesion con alejandro78248@gmail.com / Admin1234")
