#!/usr/bin/env python3
"""
MyPet Full-Stack Flask Web Server & REST API
Integrates SQLite database, user authentication (login/register/logout),
pets CRUD, activity logs, and public QR recovery pages.
"""

import os
import sys
import secrets
from datetime import datetime
from functools import wraps

from flask import (
    Flask, request, jsonify, session, send_from_directory,
    abort, redirect, url_for
)

import database

# Ensure UTF-8 console output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)

# Configure Secret Key for Sessions
app.secret_key = os.environ.get('MYPET_SECRET_KEY', 'mypet-family-storybook-secret-key-2026')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400 * 30  # 30 days

# Initialize database
database.init_db()
database.seed_db_if_empty()

# =============================================================================
# AUTH HELPERS
# =============================================================================
def get_current_user():
    """Retrieve logged-in user record from database using session."""
    user_id = session.get('user_id')
    if not user_id:
        return None
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name, phone, created_at FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not get_current_user():
            return jsonify({"success": False, "error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def format_pet_dict(row, owner_row=None):
    """Convert SQLite row to frontend-friendly pet structure."""
    pet = dict(row)
    # Reconstruct nested owner info
    owner_info = {
        "name": owner_row["name"] if owner_row else "Sarah Miller",
        "phone": owner_row["phone"] if owner_row else "(555) 234-5678",
        "email": owner_row["email"] if owner_row else "sarah@example.com",
        "showPhone": bool(pet.get("show_phone", 1)),
        "showEmail": bool(pet.get("show_email", 0)),
        "allowSmsRelay": bool(pet.get("allow_sms_relay", 1))
    }
    
    lost_info = None
    if pet.get("is_lost"):
        lost_info = {
            "lastSeenLocation": pet.get("last_seen_location") or "Unknown spot",
            "lastSeenDate": pet.get("last_seen_date") or "Recently",
            "lastSeenTime": pet.get("last_seen_time") or "",
            "note": pet.get("last_seen_notes") or ""
        }

    return {
        "id": f"pet-{pet['id']}",
        "rawId": pet["id"],
        "code": pet["code"],
        "name": pet["name"],
        "species": pet["species"],
        "breed": pet["breed"],
        "sex": pet["sex"],
        "age": pet["age"],
        "color": pet["color"],
        "avatarKey": pet["avatar_key"],
        "avatarCustom": pet["photo_url"],
        "distinguishingFeatures": pet["distinguishing_features"] or "",
        "medicalNotes": pet["medical_notes"] or "",
        "isLost": bool(pet["is_lost"]),
        "lostInfo": lost_info,
        "owner": owner_info,
        "createdAt": pet.get("created_at", "")
    }

# =============================================================================
# AUTH API ENDPOINTS
# =============================================================================
@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()

    if not email or '@' not in email:
        return jsonify({"success": False, "error": "Please enter a valid email address."}), 400
    if not password or len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters."}), 400
    if not name:
        return jsonify({"success": False, "error": "Please enter your name."}), 400

    conn = database.get_db()
    cursor = conn.cursor()

    # Check if email exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": "An account with this email already exists. Please log in."}), 409

    salt, pwd_hash = database.hash_password(password)
    cursor.execute("""
    INSERT INTO users (email, password_hash, salt, name, phone)
    VALUES (?, ?, ?, ?, ?)
    """, (email, pwd_hash, salt, name, phone))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    session['user_id'] = user_id
    session.permanent = True

    return jsonify({
        "success": True,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "phone": phone
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required."}), 400

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password_hash, salt, name, phone FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not database.verify_password(password, user['salt'], user['password_hash']):
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    session['user_id'] = user['id']
    session.permanent = True

    return jsonify({
        "success": True,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "phone": user['phone']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"success": True})

@app.route('/api/auth/me', methods=['GET'])
def api_me():
    user = get_current_user()
    if user:
        return jsonify({"authenticated": True, "user": user})
    return jsonify({"authenticated": False})

# =============================================================================
# PETS CRUD API (AUTHENTICATED)
# =============================================================================
@app.route('/api/pets', methods=['GET'])
@login_required
def api_get_pets():
    user = get_current_user()
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pets WHERE user_id = ? ORDER BY id ASC", (user['id'],))
    rows = cursor.fetchall()
    conn.close()

    pets = [format_pet_dict(r, user) for r in rows]
    return jsonify({"success": True, "pets": pets})

@app.route('/api/pets', methods=['POST'])
@login_required
def api_create_pet():
    user = get_current_user()
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    if not name:
        return jsonify({"success": False, "error": "Pet name is required."}), 400

    species = data.get('species', 'cat').lower()
    breed = data.get('breed', 'Mixed').strip() or 'Mixed'
    sex = data.get('sex', 'Female')
    age = data.get('age', '1 year old').strip() or '1 year old'
    color = data.get('color', 'Mixed').strip() or 'Mixed'
    avatar_key = data.get('avatarKey', 'catDefault')
    photo_url = data.get('avatarCustom')
    features = data.get('features', '').strip()
    phone = data.get('phone', user['phone']).strip() or user['phone']
    email = data.get('email', user['email']).strip() or user['email']
    show_phone = 1 if data.get('showPhone', True) else 0
    show_email = 1 if data.get('showEmail', False) else 0
    allow_sms_relay = 1 if data.get('allowSmsRelay', True) else 0

    # Generate unique URL safe pet code
    safe_name = "".join(c for c in name.lower() if c.isalnum()) or "pet"
    code = f"{safe_name}-{secrets.token_hex(2)}"

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO pets (
        user_id, code, name, species, breed, sex, age, color,
        avatar_key, photo_url, distinguishing_features, medical_notes,
        is_lost, show_phone, show_email, allow_sms_relay
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    """, (
        user['id'], code, name, species, breed, sex, age, color,
        avatar_key, photo_url, features, "Up to date on vaccinations.",
        show_phone, show_email, allow_sms_relay
    ))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM pets WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    conn.close()

    formatted = format_pet_dict(row, user)
    return jsonify({"success": True, "pet": formatted}), 201

@app.route('/api/pets/<int:pet_id>', methods=['GET'])
@login_required
def api_get_single_pet(pet_id):
    user = get_current_user()
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pets WHERE id = ? AND user_id = ?", (pet_id, user['id']))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "Pet not found."}), 404

    return jsonify({"success": True, "pet": format_pet_dict(row, user)})

@app.route('/api/pets/<int:pet_id>', methods=['PUT'])
@login_required
def api_update_pet(pet_id):
    user = get_current_user()
    data = request.get_json() or {}

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM pets WHERE id = ? AND user_id = ?", (pet_id, user['id']))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": "Pet not found."}), 404

    name = data.get('name')
    breed = data.get('breed')
    age = data.get('age')
    features = data.get('distinguishingFeatures')
    medical = data.get('medicalNotes')
    show_phone = 1 if data.get('showPhone', True) else 0

    cursor.execute("""
    UPDATE pets SET
        name = COALESCE(?, name),
        breed = COALESCE(?, breed),
        age = COALESCE(?, age),
        distinguishing_features = COALESCE(?, distinguishing_features),
        medical_notes = COALESCE(?, medical_notes),
        show_phone = ?
    WHERE id = ? AND user_id = ?
    """, (name, breed, age, features, medical, show_phone, pet_id, user['id']))
    conn.commit()

    cursor.execute("SELECT * FROM pets WHERE id = ?", (pet_id,))
    row = cursor.fetchone()
    conn.close()

    return jsonify({"success": True, "pet": format_pet_dict(row, user)})

@app.route('/api/pets/<int:pet_id>/lost', methods=['POST'])
@login_required
def api_toggle_lost(pet_id):
    user = get_current_user()
    data = request.get_json() or {}
    is_lost = 1 if data.get('is_lost', True) else 0
    location = data.get('last_seen_location')
    date = data.get('last_seen_date')
    time = data.get('last_seen_time')
    note = data.get('note')

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM pets WHERE id = ? AND user_id = ?", (pet_id, user['id']))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": "Pet not found."}), 404

    cursor.execute("""
    UPDATE pets SET
        is_lost = ?,
        last_seen_location = ?,
        last_seen_date = ?,
        last_seen_time = ?,
        last_seen_notes = ?
    WHERE id = ? AND user_id = ?
    """, (is_lost, location, date, time, note, pet_id, user['id']))
    conn.commit()

    cursor.execute("SELECT * FROM pets WHERE id = ?", (pet_id,))
    row = cursor.fetchone()
    conn.close()

    return jsonify({"success": True, "pet": format_pet_dict(row, user)})

@app.route('/api/pets/<int:pet_id>', methods=['DELETE'])
@login_required
def api_delete_pet(pet_id):
    user = get_current_user()
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM pets WHERE id = ? AND user_id = ?", (pet_id, user['id']))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# =============================================================================
# ACTIVITIES & SCANS API (AUTHENTICATED)
# =============================================================================
@app.route('/api/activities', methods=['GET'])
@login_required
def api_get_activities():
    user = get_current_user()
    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT a.*, p.name as pet_name
    FROM activities a
    JOIN pets p ON a.pet_id = p.id
    WHERE p.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT 40
    """, (user['id'],))
    rows = cursor.fetchall()
    conn.close()

    activities = []
    for r in rows:
        created_dt = r["created_at"]
        activities.append({
            "id": f"act-{r['id']}",
            "petId": f"pet-{r['pet_id']}",
            "petName": r["pet_name"],
            "type": r["activity_type"],
            "title": r["title"],
            "details": r["details"] or (f"{r['finder_name']} ({r['finder_phone']}): {r['finder_message']}" if r["finder_name"] else ""),
            "time": created_dt or "Recently"
        })

    return jsonify({"success": True, "activities": activities})

# =============================================================================
# PUBLIC RECOVERY API (ZERO LOGIN REQUIRED FOR FINDERS)
# =============================================================================
@app.route('/api/public/pet/<string:code>', methods=['GET'])
def api_public_pet_profile(code):
    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
    FROM pets p
    JOIN users u ON p.user_id = u.id
    WHERE p.code = ? COLLATE NOCASE
    """, (code,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return jsonify({"success": False, "error": "Pet profile not found."}), 404

    pet_id = row['id']
    pet_name = row['name']
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)

    # Automatically log a 'scan' activity in the database!
    cursor.execute("""
    INSERT INTO activities (pet_id, activity_type, title, details, ip_address)
    VALUES (?, 'scan', 'QR Tag Scanned', ?, ?)
    """, (pet_id, f"Someone scanned {pet_name}'s collar tag", client_ip))
    conn.commit()
    conn.close()

    owner_dict = {
        "name": row["owner_name"],
        "phone": row["owner_phone"] if bool(row["show_phone"]) else None,
        "email": row["owner_email"] if bool(row["show_email"]) else None,
        "showPhone": bool(row["show_phone"]),
        "showEmail": bool(row["show_email"]),
        "allowSmsRelay": bool(row["allow_sms_relay"])
    }

    pet_data = format_pet_dict(row, owner_dict)
    # Ensure owner privacy on public response
    pet_data["owner"] = owner_dict

    return jsonify({"success": True, "pet": pet_data})

@app.route('/api/public/pet/<string:code>/found', methods=['POST'])
def api_public_submit_found(code):
    data = request.get_json() or {}
    finder_name = data.get('name', 'Good Samaritan').strip() or 'Good Samaritan'
    finder_phone = data.get('phone', 'Not provided').strip()
    finder_location = data.get('location', 'Shared current location').strip()
    finder_message = data.get('message', 'I am safe with your pet.').strip()

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM pets WHERE code = ? COLLATE NOCASE", (code,))
    pet = cursor.fetchone()

    if not pet:
        conn.close()
        return jsonify({"success": False, "error": "Pet not found."}), 404

    pet_id = pet['id']
    pet_name = pet['name']

    # Insert 'found' activity log into database
    cursor.execute("""
    INSERT INTO activities (
        pet_id, activity_type, title, details, finder_name, finder_phone,
        finder_location, finder_message
    ) VALUES (?, 'found', ?, ?, ?, ?, ?, ?)
    """, (
        pet_id,
        f"Someone found {pet_name}!",
        f"{finder_name} ({finder_phone}) says: \"{finder_message}\" near {finder_location}",
        finder_name, finder_phone, finder_location, finder_message
    ))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Alert successfully dispatched to {pet_name}'s owner!"
    })

# =============================================================================
# STATIC FILE & SPA ROUTING
# =============================================================================
@app.route('/login')
def login_page():
    return send_from_directory(BASE_DIR, 'login.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Check if a static file physically exists
    full_path = os.path.join(BASE_DIR, path)
    if path and os.path.isfile(full_path):
        return send_from_directory(BASE_DIR, path)

    # For subdirectories like css/, js/, images/
    if path.startswith(('css/', 'js/', 'images/')):
        file_path = os.path.join(BASE_DIR, path)
        if os.path.isfile(file_path):
            dir_name = os.path.dirname(file_path)
            base_name = os.path.basename(file_path)
            return send_from_directory(dir_name, base_name)

    # Fallback to index.html for all SPA routes (/dashboard, /p/..., etc.)
    return send_from_directory(BASE_DIR, 'index.html')

if __name__ == '__main__':
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            port = 8000

    print("==================================================")
    print("🐾 [MyPet] Full-Stack Database Server Running!")
    print(f"👉 Web App URL:    http://localhost:{port}")
    print(f"👉 Database:       {database.DB_PATH}")
    print(f"👉 Demo Account:   sarah@example.com / password123")
    print("==================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
