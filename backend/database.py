import sqlite3


conn = sqlite3.connect(database='pcs.db' , check_same_thread=False)


cursor = conn.cursor()

# 🔌 DB dependency (per request)
def get_db():
    conn = sqlite3.connect('pcs.db', check_same_thread=False)
    try:
        yield conn
    finally:
        conn.close()

cursor.execute("PRAGMA foreign_keys = ON;")


cursor.execute('''
CREATE TABLE IF NOT EXISTS pcs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    pc_type TEXT,
    is_available INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

conn.commit()