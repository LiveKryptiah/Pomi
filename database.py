"""
MyPet Database Management & SQLite ORM Layer
Handles database schema initialization, password hashing with PBKDF2,
and seeding of default demo account.
"""

import sqlite3
import os
import hashlib
import secrets
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mypet.db')

def get_db():
    """Connect to SQLite database with Row factory and foreign keys enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

def hash_password(password, salt=None):
    """Hash a password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return salt, hashed

def verify_password(password, salt, stored_hash):
    """Verify password against stored salt and hash."""
    _, check_hash = hash_password(password, salt)
    return secrets.compare_digest(check_hash, stored_hash)

def init_db():
    """Create database tables if they do not already exist."""
    conn = get_db()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Pets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT UNIQUE NOT NULL COLLATE NOCASE,
        name TEXT NOT NULL,
        species TEXT NOT NULL DEFAULT 'cat',
        breed TEXT NOT NULL DEFAULT 'Mixed',
        sex TEXT NOT NULL DEFAULT 'Female',
        age TEXT NOT NULL DEFAULT '1 year old',
        color TEXT NOT NULL DEFAULT 'Mixed',
        avatar_key TEXT DEFAULT 'catDefault',
        photo_url TEXT,
        distinguishing_features TEXT,
        medical_notes TEXT,
        is_lost INTEGER DEFAULT 0,
        last_seen_location TEXT,
        last_seen_date TEXT,
        last_seen_time TEXT,
        last_seen_notes TEXT,
        show_phone INTEGER DEFAULT 1,
        show_email INTEGER DEFAULT 0,
        allow_sms_relay INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Activities Table (Scans & Finder Recovery reports)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL, -- 'scan' or 'found'
        title TEXT NOT NULL,
        details TEXT,
        finder_name TEXT,
        finder_phone TEXT,
        finder_location TEXT,
        finder_message TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()

def seed_db_if_empty():
    """Seed default demo user (Sarah Miller) and pets (Luna & Milo) if users table is empty."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]

    if count == 0:
        # Create Demo User: Sarah Miller
        salt, pwd_hash = hash_password("password123")
        cursor.execute("""
        INSERT INTO users (email, password_hash, salt, name, phone)
        VALUES (?, ?, ?, ?, ?)
        """, ("sarah@example.com", pwd_hash, salt, "Sarah Miller", "(555) 234-5678"))
        user_id = cursor.lastrowid

        # Insert Luna
        cursor.execute("""
        INSERT INTO pets (
            user_id, code, name, species, breed, sex, age, color,
            avatar_key, photo_url, distinguishing_features, medical_notes,
            is_lost, last_seen_location, last_seen_date, last_seen_time,
            show_phone, show_email, allow_sms_relay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, "luna-7x29", "Luna", "cat", "Domestic Shorthair", "Female", "3 years old", "Gray and white",
            "luna", None, "Friendly temperament, green eyes, wearing a pink collar",
            "Microchipped, up to date on vaccinations. Indoor cat.",
            0, "Oakland Ave & 4th St", "September 21", "6:30 PM",
            1, 0, 1
        ))
        luna_id = cursor.lastrowid

        # Insert Milo
        cursor.execute("""
        INSERT INTO pets (
            user_id, code, name, species, breed, sex, age, color,
            avatar_key, photo_url, distinguishing_features, medical_notes,
            is_lost, last_seen_location, last_seen_date, last_seen_time,
            show_phone, show_email, allow_sms_relay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, "milo-9k42", "Milo", "dog", "Golden Retriever", "Male", "2 years old", "Golden blonde",
            "milo", None, "Big floppy ears, energetic and gentle, loves tennis balls",
            "Microchipped. Healthy.",
            0, None, None, None,
            1, 1, 1
        ))
        milo_id = cursor.lastrowid

        # Initial Activity
        cursor.execute("""
        INSERT INTO activities (
            pet_id, activity_type, title, details, finder_name, finder_phone, finder_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            luna_id, "scan", "QR Tag Scanned", "Collar tag scanned near Riverside Park",
            None, None, "Riverside Park"
        ))

        conn.commit()
        print(f"[DB] Initialized database with demo user: sarah@example.com / password123")

    conn.close()

if __name__ == '__main__':
    init_db()
    seed_db_if_empty()
    print("Database ready at:", DB_PATH)
