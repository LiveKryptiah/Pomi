"""
MyPet SQLite Database Manager
Provides persistent relational storage for users, pets, health records,
activity scans, and physical tag orders.
"""

import sqlite3
import os
import json
import hashlib
import secrets
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mypet.db')

def get_connection():
    """Returns a SQLite connection with dict-like row access."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password, salt=None):
    """Generates a secure SHA-256 hash with salt."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return hashed, salt

def verify_password(password, salt, hashed):
    """Verifies a plain password against the stored hash and salt."""
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest() == hashed

def init_db():
    """Initializes schema and seeds default records if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Pets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT,
        sex TEXT,
        age TEXT,
        color TEXT,
        avatar_key TEXT,
        avatar_custom TEXT,
        distinguishing_features TEXT,
        medical_notes TEXT,
        is_lost INTEGER DEFAULT 0,
        lost_info TEXT,
        owner_data TEXT,
        health_vault TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # 3. Activities / Tag Scans Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL,
        user_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        details TEXT NOT NULL,
        time_str TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
    """)

    # 4. Physical Tag Orders Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        pet_name TEXT NOT NULL,
        shape TEXT NOT NULL,
        material TEXT NOT NULL,
        hardware TEXT NOT NULL,
        collar TEXT NOT NULL,
        engraving_line1 TEXT,
        engraving_line2 TEXT,
        engraving_phrase TEXT,
        total_price TEXT NOT NULL,
        status TEXT NOT NULL,
        tracking_number TEXT NOT NULL,
        order_date TEXT NOT NULL,
        estimated_delivery TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
    """)

    # 5. GPS Scan Locations & Breadcrumbs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scan_locations (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        accuracy REAL DEFAULT 15.0,
        address TEXT,
        device_info TEXT,
        time_str TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
    """)

    # 6. Chat Threads Table (Anonymous Finder <-> Owner Sessions)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_threads (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL,
        finder_session_id TEXT NOT NULL,
        finder_name TEXT DEFAULT 'Kind Finder',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_message_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
    """)

    # 7. Chat Messages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        text TEXT NOT NULL,
        photo_url TEXT,
        is_read INTEGER DEFAULT 0,
        time_str TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (thread_id) REFERENCES chat_threads(id)
    )
    """)

    conn.commit()

    # Seed Default Records if users table is empty
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()['count'] == 0:
        seed_default_data(cursor)
        conn.commit()

    # Seed Default GPS Locations if scan_locations table is empty
    cursor.execute("SELECT COUNT(*) as count FROM scan_locations")
    if cursor.fetchone()['count'] == 0:
        seed_scan_locations(cursor)
        conn.commit()

    # Seed Default Chat Conversation if chat_threads table is empty
    cursor.execute("SELECT COUNT(*) as count FROM chat_threads")
    if cursor.fetchone()['count'] == 0:
        seed_chat_data(cursor)
        conn.commit()

    conn.close()

def seed_default_data(cursor):
    """Seeds initial demo data (Sarah Miller, Luna, Milo, activities, orders)."""
    # 1. Default User
    h_pass, salt = hash_password("password123")
    user_id = "usr-sarah"
    cursor.execute("""
    INSERT INTO users (id, email, password_hash, salt, name, phone)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, "sarah@example.com", h_pass, salt, "Sarah Miller", "(555) 234-5678"))

    # 2. Luna (Cat)
    luna_health_vault = {
        "showPublicMedical": True,
        "microchip": {
            "number": "985-141-002-384-912",
            "registry": "HomeAgain Pet Recovery",
            "implantedDate": "2024-04-15",
            "verified": True
        },
        "vetClinic": {
            "name": "Oakland Pet Hospital & Urgent Care",
            "doctor": "Dr. Emily Hayes, DVM",
            "phone": "(555) 892-3401",
            "address": "742 Evergreen Blvd, Oakland, CA 94611",
            "emergencyHours": "24/7 Urgent Care Available"
        },
        "allergies": ["Chicken byproduct", "Flea bite sensitivity"],
        "medications": "Thyroid supplement (0.1mg daily at breakfast)",
        "dietNotes": "Purina Pro Plan Sensitive Skin & Stomach (Wet & Dry only). Do not feed poultry scraps.",
        "vaccines": [
            {
                "id": "vac-1",
                "name": "Rabies (1-Year Core)",
                "dateAdministered": "2026-01-15",
                "dueDate": "2027-01-15",
                "batchLot": "RB-84920",
                "clinic": "Oakland Pet Hospital",
                "doctor": "Dr. Emily Hayes"
            },
            {
                "id": "vac-2",
                "name": "FVRCP (Feline Viral Rhinotracheitis)",
                "dateAdministered": "2025-10-10",
                "dueDate": "2026-10-10",
                "batchLot": "FV-30911",
                "clinic": "Oakland Pet Hospital",
                "doctor": "Dr. Emily Hayes"
            },
            {
                "id": "vac-3",
                "name": "FeLV (Feline Leukemia)",
                "dateAdministered": "2025-08-14",
                "dueDate": "2026-08-14",
                "batchLot": "FL-11029",
                "clinic": "Oakland Pet Hospital",
                "doctor": "Dr. Emily Hayes"
            }
        ]
    }

    luna_owner = {
        "name": "Sarah Miller",
        "phone": "(555) 234-5678",
        "email": "sarah@example.com",
        "showPhone": True,
        "showEmail": False,
        "allowSmsRelay": True
    }

    luna_lost_info = {
        "lastSeenLocation": "Oakland Ave & 4th St",
        "lastSeenDate": "September 21",
        "lastSeenTime": "6:30 PM",
        "note": "May be shy around loud noises."
    }

    cursor.execute("""
    INSERT INTO pets (
        id, user_id, code, name, species, breed, sex, age, color,
        avatar_key, avatar_custom, distinguishing_features, medical_notes,
        is_lost, lost_info, owner_data, health_vault, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pet-1", user_id, "luna-7x29", "Luna", "cat", "Domestic Shorthair", "Female", "3 years old", "Gray and white",
        "luna", "images/pet-luna.png", "Friendly temperament, green eyes, wearing a pink collar",
        "Microchipped, up to date on vaccinations. Indoor cat.",
        0, json.dumps(luna_lost_info), json.dumps(luna_owner), json.dumps(luna_health_vault), "2026-09-01"
    ))

    # 3. Milo (Dog)
    milo_health_vault = {
        "showPublicMedical": True,
        "microchip": {
            "number": "985-224-819-001-443",
            "registry": "AKC Reunite",
            "implantedDate": "2024-06-20",
            "verified": True
        },
        "vetClinic": {
            "name": "Golden Gate Veterinary Clinic",
            "doctor": "Dr. Marcus Vance, DVM",
            "phone": "(555) 392-1084",
            "address": "1200 Bay St, San Francisco, CA 94123",
            "emergencyHours": "Mon-Sat 8am-8pm"
        },
        "allergies": ["Grain sensitivites", "Beef protein"],
        "medications": "Simparica Trio (Monthly chewable on 1st)",
        "dietNotes": "Grain-Free Salmon & Sweet Potato. Loves carrot sticks for treats.",
        "vaccines": [
            {
                "id": "vac-4",
                "name": "Rabies (3-Year Core)",
                "dateAdministered": "2025-05-12",
                "dueDate": "2028-05-12",
                "batchLot": "RB-99410",
                "clinic": "Golden Gate Veterinary",
                "doctor": "Dr. Marcus Vance"
            },
            {
                "id": "vac-5",
                "name": "DHPP (Distemper, Parvo)",
                "dateAdministered": "2025-05-12",
                "dueDate": "2026-05-12",
                "batchLot": "DH-12009",
                "clinic": "Golden Gate Veterinary",
                "doctor": "Dr. Marcus Vance"
            },
            {
                "id": "vac-6",
                "name": "Bordetella (Kennel Cough)",
                "dateAdministered": "2026-04-01",
                "dueDate": "2026-10-01",
                "batchLot": "BD-45122",
                "clinic": "Golden Gate Veterinary",
                "doctor": "Dr. Marcus Vance"
            }
        ]
    }

    milo_owner = {
        "name": "Sarah Miller",
        "phone": "(555) 234-5678",
        "email": "sarah@example.com",
        "showPhone": True,
        "showEmail": True,
        "allowSmsRelay": True
    }

    cursor.execute("""
    INSERT INTO pets (
        id, user_id, code, name, species, breed, sex, age, color,
        avatar_key, avatar_custom, distinguishing_features, medical_notes,
        is_lost, lost_info, owner_data, health_vault, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pet-2", user_id, "milo-9k42", "Milo", "dog", "Golden Retriever", "Male", "2 years old", "Golden blonde",
        "milo", None, "Playful, wears a brown leather collar with bell",
        "Allergic to grain. microchipped and vaccinated.",
        0, json.dumps({}), json.dumps(milo_owner), json.dumps(milo_health_vault), "2026-09-10"
    ))

    # 4. Default Activity
    cursor.execute("""
    INSERT INTO activities (id, pet_id, user_id, type, title, details, time_str)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        "act-1", "pet-1", user_id, "scan",
        "QR Tag Scanned",
        "Collar tag scanned near Riverside Park",
        "Yesterday at 4:15 PM"
    ))

    # 5. Default Order
    cursor.execute("""
    INSERT INTO orders (
        id, pet_id, user_id, pet_name, shape, material, hardware, collar,
        engraving_line1, engraving_line2, engraving_phrase, total_price,
        status, tracking_number, order_date, estimated_delivery, shipping_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "ord-8492", "pet-1", user_id, "Luna", "round", "enamel", "brass", "pink",
        "LUNA", "(555) 234-5678", "I'm microchipped & loved", "$16.00",
        "in_production", "MP-USPS-89240192", "September 24, 2026", "September 28, 2026",
        "742 Evergreen Terrace, Springfield, OR"
    ))

    # 6. Default GPS Scan Locations
    seed_scan_locations(cursor)

def seed_scan_locations(cursor):
    """Seeds realistic GPS collar scan breadcrumbs for Luna and Milo."""
    cursor.execute("""
    INSERT INTO scan_locations (id, pet_id, lat, lng, accuracy, address, device_info, time_str)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "loc-luna-1", "pet-1", 37.8094, -122.2536, 8.5,
        "Grand Ave & Perkins St (Near Lakeside Park), Oakland, CA",
        "Apple iPhone 15 · Safari Mobile",
        "12 minutes ago"
    ))
    cursor.execute("""
    INSERT INTO scan_locations (id, pet_id, lat, lng, accuracy, address, device_info, time_str)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "loc-luna-2", "pet-1", 37.8048, -122.2582, 12.0,
        "Bellevue Ave (Lake Merritt Walking Trail), Oakland, CA",
        "Samsung Galaxy S24 · Chrome Mobile",
        "2 hours ago"
    ))
    cursor.execute("""
    INSERT INTO scan_locations (id, pet_id, lat, lng, accuracy, address, device_info, time_str)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "loc-milo-1", "pet-2", 37.8052, -122.4412, 9.0,
        "Marina Blvd & Scott St (Marina Green), San Francisco, CA",
        "Google Pixel 8 · Chrome Mobile",
        "Yesterday at 3:45 PM"
    ))

def seed_chat_data(cursor):
    """Seeds initial demo finder-to-owner conversation for Luna."""
    thread_id = "th-luna-demo"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO chat_threads (id, pet_id, finder_session_id, finder_name, created_at, last_message_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (
        thread_id,
        "pet-1",
        "sess-alex-finder",
        "Alex R. (Finder)",
        now_str,
        now_str
    ))

    messages = [
        (
            "msg-seed-1",
            thread_id,
            "finder",
            "Alex R. (Finder)",
            "Hi Sarah! I scanned Luna's collar tag near Lakeside Park by Grand Ave. She is alert, gentle, and resting right by our bench under a shaded tree.",
            "images/pet-luna.png",
            1,
            "18m ago",
            now_str
        ),
        (
            "msg-seed-2",
            thread_id,
            "owner",
            "Sarah Miller",
            "Alex, thank goodness! We were so worried! Is she near the coffee shop on Perkins? I am getting in my car right now to pick her up!",
            None,
            1,
            "12m ago",
            now_str
        ),
        (
            "msg-seed-3",
            thread_id,
            "finder",
            "Alex R. (Finder)",
            "Yes, exactly! Sitting on the bench right across from Peet's Coffee. Take your time, I'll stay right here with her!",
            None,
            0,
            "3m ago",
            now_str
        )
    ]

    for m in messages:
        cursor.execute("""
        INSERT INTO chat_messages (id, thread_id, sender, sender_name, text, photo_url, is_read, time_str, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, m)

def get_table_counts():
    """Returns row counts of all core database tables."""
    conn = get_connection()
    c = conn.cursor()
    counts = {}
    for table in ['users', 'pets', 'activities', 'orders', 'scan_locations', 'chat_threads', 'chat_messages']:
        try:
            c.execute(f"SELECT COUNT(*) as count FROM {table}")
            counts[table] = c.fetchone()['count']
        except Exception:
            counts[table] = 0
    conn.close()
    return counts

# ==============================================================================
# USER FUNCTIONS
# ==============================================================================
def find_user_by_email(email):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    user = c.fetchone()
    conn.close()
    return dict(user) if user else None

def create_user(name, email, password, phone=""):
    conn = get_connection()
    c = conn.cursor()
    h_pass, salt = hash_password(password)
    user_id = "usr-" + secrets.token_hex(4)
    c.execute("""
    INSERT INTO users (id, email, password_hash, salt, name, phone)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, email.strip().lower(), h_pass, salt, name.strip(), phone.strip()))
    conn.commit()
    conn.close()
    return {
        "id": user_id,
        "name": name,
        "email": email.strip().lower(),
        "phone": phone
    }

# ==============================================================================
# PET FUNCTIONS
# ==============================================================================
def get_all_pets(user_id=None):
    conn = get_connection()
    c = conn.cursor()
    if user_id:
        c.execute("SELECT * FROM pets WHERE user_id = ? ORDER BY created_at ASC", (user_id,))
    else:
        c.execute("SELECT * FROM pets ORDER BY created_at ASC")
    rows = c.fetchall()
    conn.close()
    return [format_pet_row(r) for r in rows]

def get_pet_by_id_or_code(id_or_code):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM pets WHERE id = ? OR LOWER(code) = LOWER(?)", (id_or_code, id_or_code))
    row = c.fetchone()
    conn.close()
    return format_pet_row(row) if row else None

def create_pet(pet_data, user_id="usr-sarah"):
    conn = get_connection()
    c = conn.cursor()
    pet_id = pet_data.get("id") or ("pet-" + secrets.token_hex(3))
    code = pet_data.get("code") or (pet_data.get("name", "pet").lower().replace(" ", "") + "-" + secrets.token_hex(2))

    lost_info = pet_data.get("lostInfo") or {}
    owner_data = pet_data.get("owner") or {}
    health_vault = pet_data.get("healthVault") or {}

    c.execute("""
    INSERT INTO pets (
        id, user_id, code, name, species, breed, sex, age, color,
        avatar_key, avatar_custom, distinguishing_features, medical_notes,
        is_lost, lost_info, owner_data, health_vault, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pet_id,
        user_id,
        code,
        pet_data.get("name", "Unnamed Pet"),
        pet_data.get("species", "other"),
        pet_data.get("breed", ""),
        pet_data.get("sex", "Unknown"),
        pet_data.get("age", ""),
        pet_data.get("color", ""),
        pet_data.get("avatarKey", "otherDefault"),
        pet_data.get("avatarCustom"),
        pet_data.get("distinguishingFeatures", ""),
        pet_data.get("medicalNotes", ""),
        1 if pet_data.get("isLost") else 0,
        json.dumps(lost_info),
        json.dumps(owner_data),
        json.dumps(health_vault),
        datetime.now().strftime("%Y-%m-%d")
    ))
    conn.commit()
    conn.close()
    return get_pet_by_id_or_code(pet_id)

def update_pet(pet_id, patch):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM pets WHERE id = ?", (pet_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return None

    current = format_pet_row(row)
    
    # Merge patch fields
    name = patch.get("name", current["name"])
    species = patch.get("species", current["species"])
    breed = patch.get("breed", current["breed"])
    sex = patch.get("sex", current["sex"])
    age = patch.get("age", current["age"])
    color = patch.get("color", current["color"])
    features = patch.get("distinguishingFeatures", current.get("distinguishingFeatures", ""))
    med_notes = patch.get("medicalNotes", current.get("medicalNotes", ""))
    is_lost = 1 if patch.get("isLost", current.get("isLost", False)) else 0
    
    lost_info = patch.get("lostInfo", current.get("lostInfo", {}))
    owner_data = patch.get("owner", current.get("owner", {}))
    health_vault = patch.get("healthVault", current.get("healthVault", {}))
    avatar_custom = patch.get("avatarCustom", current.get("avatarCustom"))

    c.execute("""
    UPDATE pets SET
        name = ?, species = ?, breed = ?, sex = ?, age = ?, color = ?,
        distinguishing_features = ?, medical_notes = ?, is_lost = ?,
        lost_info = ?, owner_data = ?, health_vault = ?, avatar_custom = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (
        name, species, breed, sex, age, color, features, med_notes, is_lost,
        json.dumps(lost_info), json.dumps(owner_data), json.dumps(health_vault),
        avatar_custom, pet_id
    ))
    conn.commit()
    conn.close()
    return get_pet_by_id_or_code(pet_id)

def delete_pet(pet_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM pets WHERE id = ?", (pet_id,))
    deleted = c.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def format_pet_row(row):
    """Parses JSON columns back into native dictionaries."""
    d = dict(row)
    try:
        d["lostInfo"] = json.loads(d.get("lost_info") or "{}")
    except Exception:
        d["lostInfo"] = {}
    try:
        d["owner"] = json.loads(d.get("owner_data") or "{}")
    except Exception:
        d["owner"] = {}
    try:
        d["healthVault"] = json.loads(d.get("health_vault") or "{}")
    except Exception:
        d["healthVault"] = {}
    
    d["isLost"] = bool(d.get("is_lost", 0))
    d["distinguishingFeatures"] = d.get("distinguishing_features", "")
    d["medicalNotes"] = d.get("medical_notes", "")
    d["avatarKey"] = d.get("avatar_key", "")
    d["avatarCustom"] = d.get("avatar_custom")
    d["createdAt"] = d.get("created_at")

    # Clean internal database columns
    for key in ['lost_info', 'owner_data', 'health_vault', 'distinguishing_features', 'medical_notes', 'is_lost', 'avatar_key', 'avatar_custom', 'user_id']:
        d.pop(key, None)

    return d

# ==============================================================================
# ACTIVITIES FUNCTIONS
# ==============================================================================
def get_activities(limit=25):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT a.*, p.name as pet_name FROM activities a LEFT JOIN pets p ON a.pet_id = p.id ORDER BY a.created_at DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    acts = []
    for r in rows:
        acts.append({
            "id": r["id"],
            "petId": r["pet_id"],
            "petName": r["pet_name"] or "Pet",
            "type": r["type"],
            "title": r["title"],
            "details": r["details"],
            "time": r["time_str"],
            "createdAt": r["created_at"]
        })
    return acts

def add_activity(pet_id, act_type, title, details, time_str="Just now", user_id="usr-sarah"):
    conn = get_connection()
    c = conn.cursor()
    act_id = "act-" + secrets.token_hex(4)
    c.execute("""
    INSERT INTO activities (id, pet_id, user_id, type, title, details, time_str)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (act_id, pet_id, user_id, act_type, title, details, time_str))
    conn.commit()
    conn.close()
    return {
        "id": act_id,
        "petId": pet_id,
        "type": act_type,
        "title": title,
        "details": details,
        "time": time_str
    }

# ==============================================================================
# ORDERS FUNCTIONS
# ==============================================================================
def get_orders():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    orders = []
    for r in rows:
        orders.append({
            "id": r["id"],
            "petId": r["pet_id"],
            "petName": r["pet_name"],
            "shape": r["shape"],
            "material": r["material"],
            "hardware": r["hardware"],
            "collar": r["collar"],
            "engravingLine1": r["engraving_line1"],
            "engravingLine2": r["engraving_line2"],
            "engravingPhrase": r["engraving_phrase"],
            "totalPrice": r["total_price"],
            "status": r["status"],
            "trackingNumber": r["tracking_number"],
            "orderDate": r["order_date"],
            "estimatedDelivery": r["estimated_delivery"],
            "shippingAddress": r["shipping_address"],
            "createdAt": r["created_at"]
        })
    return orders

def create_order(order_data, user_id="usr-sarah"):
    conn = get_connection()
    c = conn.cursor()
    order_id = order_data.get("id") or ("ord-" + secrets.token_hex(3))
    c.execute("""
    INSERT INTO orders (
        id, pet_id, user_id, pet_name, shape, material, hardware, collar,
        engraving_line1, engraving_line2, engraving_phrase, total_price,
        status, tracking_number, order_date, estimated_delivery, shipping_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_id,
        order_data.get("petId", "pet-1"),
        user_id,
        order_data.get("petName", "Luna"),
        order_data.get("shape", "round"),
        order_data.get("material", "enamel"),
        order_data.get("hardware", "brass"),
        order_data.get("collar", "pink"),
        order_data.get("engravingLine1", ""),
        order_data.get("engravingLine2", ""),
        order_data.get("engravingPhrase", ""),
        order_data.get("totalPrice", "$16.00"),
        order_data.get("status", "in_production"),
        order_data.get("trackingNumber") or ("MP-USPS-" + secrets.token_hex(4).upper()),
        order_data.get("orderDate") or datetime.now().strftime("%B %d, %Y"),
        order_data.get("estimatedDelivery") or "In 4 business days",
        order_data.get("shippingAddress", "")
    ))
    conn.commit()
    conn.close()
    
    # Also log an activity for the new tag order
    add_activity(
        order_data.get("petId", "pet-1"),
        "order",
        f"Custom Tag Ordered — {order_data.get('petName')}",
        f"{order_data.get('shape', '').capitalize()} {order_data.get('material', '').capitalize()} Medallion queued for precision laser engraving."
    )

    return order_id

# ==============================================================================
# GPS SCAN & RADAR FUNCTIONS
# ==============================================================================
def add_scan_location(pet_id, lat, lng, accuracy=15.0, address="", device_info="Mobile Camera", time_str=None):
    if not time_str:
        time_str = datetime.now().strftime("Today at %I:%M %p")
    conn = get_connection()
    c = conn.cursor()
    loc_id = "loc-" + secrets.token_hex(4)
    c.execute("""
    INSERT INTO scan_locations (id, pet_id, lat, lng, accuracy, address, device_info, time_str)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (loc_id, pet_id, float(lat), float(lng), float(accuracy), address, device_info, time_str))
    conn.commit()
    conn.close()

    # Also log into activities feed
    add_activity(
        pet_id,
        "scan",
        "GPS Location Captured",
        f"Collar tag scanned near {address or 'GPS coordinates'}. Accuracy: ±{round(float(accuracy))}m",
        time_str
    )

    return loc_id

def get_pet_scan_locations(pet_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM scan_locations WHERE pet_id = ? ORDER BY created_at DESC", (pet_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_radar_data(pet_id):
    pet = get_pet_by_id_or_code(pet_id)
    if not pet:
        return None

    locations = get_pet_scan_locations(pet['id'])
    
    # Fallback default location if none yet
    if not locations:
        default_lat = 37.8094 if pet.get('species') == 'cat' else 37.8052
        default_lng = -122.2536 if pet.get('species') == 'cat' else -122.4412
        default_addr = "Grand Ave & Perkins St, Oakland, CA" if pet.get('species') == 'cat' else "Marina Blvd, San Francisco, CA"
        add_scan_location(pet['id'], default_lat, default_lng, 8.5, default_addr, "Native Viewfinder Scanner", "Just now")
        locations = get_pet_scan_locations(pet['id'])

    latest_scan = locations[0] if locations else None
    
    # Calculate species-aware search zones (meters)
    is_cat = (pet.get('species') == 'cat')
    if is_cat:
        zones = [
            {
                "id": "zone-1",
                "radiusMeters": 480,
                "radiusMiles": "0.3 mi",
                "label": "Sprint & Hiding Zone (0-1 hr)",
                "description": "Frightened felines typically hide under decks, sheds, or thick shrubbery within 500 meters of last sighting.",
                "color": "#10b981",
                "fillOpacity": 0.20
            },
            {
                "id": "zone-2",
                "radiusMeters": 1200,
                "radiusMiles": "0.75 mi",
                "label": "Displaced Roaming Radius (1-12 hrs)",
                "description": "Exploration zone across neighboring residential blocks and quiet alleyways.",
                "color": "#f59e0b",
                "fillOpacity": 0.14
            },
            {
                "id": "zone-3",
                "radiusMeters": 2400,
                "radiusMiles": "1.5 mi",
                "label": "Max 48-Hour Search Perimeter",
                "description": "Recommended flyer distribution boundary and shelter check perimeter.",
                "color": "#ef4444",
                "fillOpacity": 0.09
            }
        ]
    else:
        zones = [
            {
                "id": "zone-1",
                "radiusMeters": 1200,
                "radiusMiles": "0.75 mi",
                "label": "Sprint Distance (0-30 mins)",
                "description": "Initial burst distance. Dogs frequently follow familiar sidewalk scent trails and open parks.",
                "color": "#10b981",
                "fillOpacity": 0.20
            },
            {
                "id": "zone-2",
                "radiusMeters": 3200,
                "radiusMiles": "2.0 mi",
                "label": "Canine Roaming Area (2-6 hrs)",
                "description": "Active territory radius. Check local dog parks, school grounds, and neighborhood greenbelts.",
                "color": "#f59e0b",
                "fillOpacity": 0.14
            },
            {
                "id": "zone-3",
                "radiusMeters": 6400,
                "radiusMiles": "4.0 mi",
                "label": "Regional Search Perimeter (24 hrs)",
                "description": "Extended radius for Animal Control dispatch and microchip shelter alerts.",
                "color": "#ef4444",
                "fillOpacity": 0.09
            }
        ]

    clat = latest_scan['lat']
    clng = latest_scan['lng']
    
    emergency_points = [
        {
            "id": "em-1",
            "name": "Oakland Pet Hospital & Urgent Care",
            "type": "24/7 Vet Hospital",
            "phone": "(555) 892-3401",
            "address": "742 Evergreen Blvd, Oakland",
            "lat": clat + 0.0055,
            "lng": clng + 0.0042,
            "icon": "🏥"
        },
        {
            "id": "em-2",
            "name": "East Bay SPCA Animal Shelter",
            "type": "Adoption & Lost Pets",
            "phone": "(555) 569-0702",
            "address": "8300 Baldwin St, Oakland",
            "lat": clat - 0.0078,
            "lng": clng - 0.0065,
            "icon": "🛡️"
        },
        {
            "id": "em-3",
            "name": "Oakland Animal Services (Intake)",
            "type": "Municipal Shelter",
            "phone": "(555) 535-5602",
            "address": "1101 29th Ave, Oakland",
            "lat": clat - 0.0035,
            "lng": clng + 0.0072,
            "icon": "🐾"
        }
    ]

    return {
        "pet": pet,
        "latestScan": latest_scan,
        "history": locations,
        "zones": zones,
        "emergencyPoints": emergency_points,
        "totalScans": len(locations)
    }

# ==============================================================================
# CHAT & DIRECT MESSAGING FUNCTIONS
# ==============================================================================
def create_or_get_chat_thread(pet_id_or_code, finder_session_id, finder_name="Kind Finder"):
    """Finds existing active chat thread for session & pet, or creates a new one."""
    pet = get_pet_by_id_or_code(pet_id_or_code)
    if not pet:
        return None
    
    pet_id = pet['id']
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT * FROM chat_threads 
    WHERE pet_id = ? AND finder_session_id = ? AND is_active = 1
    ORDER BY last_message_at DESC LIMIT 1
    """, (pet_id, finder_session_id))
    row = c.fetchone()
    
    if row:
        thread = dict(row)
        conn.close()
        thread["pet"] = pet
        return thread

    # Create new thread
    thread_id = f"th-{secrets.token_hex(6)}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c.execute("""
    INSERT INTO chat_threads (id, pet_id, finder_session_id, finder_name, created_at, last_message_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (thread_id, pet_id, finder_session_id, finder_name or "Kind Finder", now_str, now_str))
    conn.commit()

    c.execute("SELECT * FROM chat_threads WHERE id = ?", (thread_id,))
    new_thread = dict(c.fetchone())
    conn.close()
    new_thread["pet"] = pet
    return new_thread

def get_chat_thread_by_id(thread_id):
    """Retrieves a thread with pet info."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM chat_threads WHERE id = ?", (thread_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return None
    thread = dict(row)
    pet = get_pet_by_id_or_code(thread['pet_id'])
    conn.close()
    thread["pet"] = pet
    return thread

def get_thread_messages(thread_id):
    """Fetches all messages for a thread ordered chronologically."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT * FROM chat_messages 
    WHERE thread_id = ? 
    ORDER BY created_at ASC
    """, (thread_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_chat_message(thread_id, sender, sender_name, text, photo_url=None, time_str="Just now"):
    """Appends a message to the thread, updates last_message_at, and logs an activity if from finder."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT * FROM chat_threads WHERE id = ?", (thread_id,))
    thread_row = c.fetchone()
    if not thread_row:
        conn.close()
        return None
    
    msg_id = f"msg-{secrets.token_hex(6)}"
    now_dt = datetime.now()
    now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
    
    c.execute("""
    INSERT INTO chat_messages (id, thread_id, sender, sender_name, text, photo_url, is_read, time_str, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    """, (msg_id, thread_id, sender, sender_name, text.strip(), photo_url, time_str, now_str))
    
    # Update thread's last message time
    c.execute("UPDATE chat_threads SET last_message_at = ? WHERE id = ?", (now_str, thread_id))
    conn.commit()

    c.execute("SELECT * FROM chat_messages WHERE id = ?", (msg_id,))
    msg_row = dict(c.fetchone())
    conn.close()
    
    # If sent by finder, record an activity notification for owner
    if sender == 'finder':
        pet = get_pet_by_id_or_code(thread_row['pet_id'])
        if pet:
            preview = text[:50] + ("..." if len(text) > 50 else "")
            add_activity(
                pet_id=pet['id'],
                act_type="message",
                title=f"💬 New Finder Message — {pet['name']}",
                details=f"{sender_name}: \"{preview}\"",
                time_str="Just now"
            )

    return msg_row

def mark_thread_read(thread_id, reader_role="owner"):
    """Marks messages as read depending on who is viewing."""
    conn = get_connection()
    c = conn.cursor()
    target_sender = 'finder' if reader_role == 'owner' else 'owner'
    c.execute("""
    UPDATE chat_messages 
    SET is_read = 1 
    WHERE thread_id = ? AND sender = ? AND is_read = 0
    """, (thread_id, target_sender))
    marked = c.rowcount
    conn.commit()
    conn.close()
    return marked

def get_owner_chat_threads(user_id=None):
    """Retrieves all chat threads for the owner's pets with latest message preview and unread count."""
    conn = get_connection()
    c = conn.cursor()
    
    if user_id:
        c.execute("SELECT id, name, code, species, avatar_custom FROM pets WHERE user_id = ?", (user_id,))
    else:
        c.execute("SELECT id, name, code, species, avatar_custom FROM pets")
    pets_map = {p['id']: dict(p) for p in c.fetchall()}

    if not pets_map:
        conn.close()
        return []

    placeholders = ','.join(['?'] * len(pets_map))
    c.execute(f"""
    SELECT t.* FROM chat_threads t
    WHERE t.pet_id IN ({placeholders}) AND t.is_active = 1
    ORDER BY t.last_message_at DESC
    """, list(pets_map.keys()))
    threads = [dict(t) for t in c.fetchall()]

    for t in threads:
        pet = pets_map.get(t['pet_id'], {})
        t['petName'] = pet.get('name', 'Pet')
        t['petCode'] = pet.get('code', '')
        t['petSpecies'] = pet.get('species', 'dog')
        t['petAvatar'] = pet.get('avatar_custom')
        
        # Get latest message
        c.execute("""
        SELECT * FROM chat_messages 
        WHERE thread_id = ? 
        ORDER BY created_at DESC LIMIT 1
        """, (t['id'],))
        latest = c.fetchone()
        t['latestMessage'] = dict(latest) if latest else None
        
        # Count unread messages sent by finder
        c.execute("""
        SELECT COUNT(*) as count FROM chat_messages 
        WHERE thread_id = ? AND sender = 'finder' AND is_read = 0
        """, (t['id'],))
        t['unreadCount'] = c.fetchone()['count']

    conn.close()
    return threads

def get_unread_message_count(user_id=None):
    """Returns total unread finder messages across all pets for owner."""
    conn = get_connection()
    c = conn.cursor()
    if user_id:
        c.execute("""
        SELECT COUNT(m.id) as count 
        FROM chat_messages m
        JOIN chat_threads t ON m.thread_id = t.id
        JOIN pets p ON t.pet_id = p.id
        WHERE p.user_id = ? AND m.sender = 'finder' AND m.is_read = 0
        """, (user_id,))
    else:
        c.execute("""
        SELECT COUNT(*) as count 
        FROM chat_messages 
        WHERE sender = 'finder' AND is_read = 0
        """)
    count = c.fetchone()['count']
    conn.close()
    return count

# ==============================================================================
# OFFICIAL PET PASSPORT & VACCINATION CERTIFICATE FUNCTIONS
# ==============================================================================
def get_pet_passport_data(pet_id_or_code):
    """Retrieves comprehensive official passport, health vault, and vaccine cert records."""
    pet = get_pet_by_id_or_code(pet_id_or_code)
    if not pet:
        return None

    hv = pet.get('healthVault') or {}
    microchip = hv.get('microchip') or {}
    vet = hv.get('vetClinic') or {}
    vaccines = hv.get('vaccines') or []
    owner = pet.get('owner') or {}

    # Deterministic official passport document ID based on pet code
    code_suffix = pet['code'].split('-')[-1].upper() if '-' in pet['code'] else pet['code'][:4].upper()
    passport_number = f"US-PET-{code_suffix}-CA"
    
    # Calculate passport issue and expiration
    issue_year = 2025 if pet['name'] == 'Luna' else 2026
    issue_date = f"{issue_year}-01-15"
    expiry_date = f"{issue_year + 3}-01-15"

    # Evaluate vaccine statuses with days remaining
    today = datetime.now()
    formatted_vaccines = []
    rabies_certified = False
    
    for vac in vaccines:
        v_copy = dict(vac)
        due_str = vac.get('dueDate')
        if due_str:
            try:
                due_dt = datetime.strptime(due_str, "%Y-%m-%d")
                diff_days = (due_dt - today).days
                if diff_days < 0:
                    v_copy['status'] = 'expired'
                    v_copy['statusLabel'] = f"Overdue by {abs(diff_days)}d"
                elif diff_days <= 30:
                    v_copy['status'] = 'due_soon'
                    v_copy['statusLabel'] = f"Due in {diff_days}d"
                else:
                    v_copy['status'] = 'valid'
                    v_copy['statusLabel'] = "Active & Verified"
            except Exception:
                v_copy['status'] = 'valid'
                v_copy['statusLabel'] = "Active"
        else:
            v_copy['status'] = 'valid'
            v_copy['statusLabel'] = "Active"

        if "rabies" in vac.get('name', '').lower() and v_copy['status'] != 'expired':
            rabies_certified = True

        formatted_vaccines.append(v_copy)

    # Official verification hash
    verification_hash = hashlib.sha256(f"{pet['id']}:{pet['code']}:{microchip.get('number', '')}".encode('utf-8')).hexdigest()[:12].upper()

    return {
        "pet": pet,
        "passportNumber": passport_number,
        "issueDate": issue_date,
        "expiryDate": expiry_date,
        "countryOfOrigin": "United States of America",
        "issuingAuthority": "MyPet Certified Veterinary Registry",
        "rabiesCertified": rabies_certified,
        "verificationCode": f"VER-{verification_hash}",
        "microchip": {
            "number": microchip.get('number', '985-141-002-384-912'),
            "registry": microchip.get('registry', 'HomeAgain National Pet Database'),
            "implantDate": microchip.get('implantedDate', '2024-04-15'),
            "status": "Verified Active"
        },
        "veterinaryClinic": {
            "name": vet.get('name', 'Oakland Pet Hospital & Urgent Care'),
            "doctor": vet.get('doctor', 'Dr. Emily Hayes, DVM'),
            "license": "CA-VET-48921-DVM",
            "phone": vet.get('phone', '(555) 892-3401'),
            "address": vet.get('address', '742 Evergreen Blvd, Oakland, CA 94611'),
            "emergencyHours": vet.get('emergencyHours', '24/7 Urgent Care Available')
        },
        "custodian": {
            "name": owner.get('name', 'Sarah Miller'),
            "phone": owner.get('phone', '(555) 234-5678'),
            "email": owner.get('email', 'sarah@example.com'),
            "address": "Oakland, California, USA"
        },
        "vaccines": formatted_vaccines,
        "allergies": hv.get('allergies', []),
        "medications": hv.get('medications', ''),
        "dietNotes": hv.get('dietNotes', '')
    }

if __name__ == "__main__":
    init_db()
    print("MyPet SQLite Database initialized successfully!")
    print("Table counts:", get_table_counts())
