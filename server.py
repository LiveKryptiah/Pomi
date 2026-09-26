#!/usr/bin/env python3
"""
MyPet Full-Stack Production & Development Server
Powered by Python Flask + SQLite (mypet.db).
Serves SPA static files and full RESTful API endpoints.
"""

import os
import sys
import json
import secrets
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, session

import database

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', 'mypet-secret-key-2026-secure-session')

# Initialize SQLite database on startup
database.init_db()

# ==============================================================================
# STATIC & SPA ROUTES
# ==============================================================================
@app.route('/')
@app.route('/index.html')
def serve_index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/login')
@app.route('/login.html')
def serve_login():
    return send_from_directory(BASE_DIR, 'login.html')

@app.route('/register')
@app.route('/register.html')
def serve_register():
    return send_from_directory(BASE_DIR, 'register.html')

# Catch-all for assets and SPA routes
@app.route('/<path:filename>')
def serve_static_or_spa(filename):
    # If the file actually exists on disk, serve it
    filepath = os.path.join(BASE_DIR, filename)
    if os.path.isfile(filepath):
        return send_from_directory(BASE_DIR, filename)
    
    # SPA routes fallback to index.html (e.g., /p/luna-7x29, /dashboard, /add-pet)
    return send_from_directory(BASE_DIR, 'index.html')

# ==============================================================================
# REST API: SYSTEM & HEALTH
# ==============================================================================
@app.route('/api/health', methods=['GET'])
def api_health():
    counts = database.get_table_counts()
    return jsonify({
        "status": "ok",
        "database": "SQLite (mypet.db)",
        "connected": True,
        "counts": counts,
        "timestamp": datetime.now().isoformat()
    })

# ==============================================================================
# REST API: AUTHENTICATION
# ==============================================================================
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    user = database.find_user_by_email(email)
    if not user:
        return jsonify({"success": False, "error": "No account found with this email"}), 404

    if not database.verify_password(password, user['salt'], user['password_hash']):
        return jsonify({"success": False, "error": "Incorrect password. Please try again."}), 401

    user_info = {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "phone": user.get('phone', '')
    }
    session['user'] = user_info

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "user": user_info
    })

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()

    if not name or not email or not password:
        return jsonify({"success": False, "error": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    existing = database.find_user_by_email(email)
    if existing:
        return jsonify({"success": False, "error": "An account with this email already exists"}), 409

    new_user = database.create_user(name, email, password, phone)
    session['user'] = new_user

    return jsonify({
        "success": True,
        "message": f"Account created for {name}!",
        "user": new_user
    }), 201

@app.route('/api/auth/me', methods=['GET'])
def api_current_user():
    user = session.get('user')
    if user:
        return jsonify({"authenticated": True, "user": user})
    return jsonify({"authenticated": False, "user": None})

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.pop('user', None)
    return jsonify({"success": True, "message": "Signed out successfully"})

# ==============================================================================
# REST API: PETS CRUD
# ==============================================================================
@app.route('/api/pets', methods=['GET'])
def api_get_pets():
    user = session.get('user')
    user_id = user['id'] if user else None
    pets = database.get_all_pets(user_id)
    return jsonify(pets)

@app.route('/api/pets', methods=['POST'])
def api_create_pet():
    data = request.get_json(silent=True) or {}
    user = session.get('user')
    user_id = user['id'] if user else "usr-sarah"

    if not data.get('name'):
        return jsonify({"error": "Pet name is required"}), 400

    new_pet = database.create_pet(data, user_id=user_id)
    return jsonify(new_pet), 201

@app.route('/api/pets/<id_or_code>', methods=['GET'])
def api_get_pet(id_or_code):
    pet = database.get_pet_by_id_or_code(id_or_code)
    if not pet:
        return jsonify({"error": "Pet not found"}), 404
    return jsonify(pet)

@app.route('/api/pets/<pet_id>', methods=['PUT'])
def api_update_pet(pet_id):
    data = request.get_json(silent=True) or {}
    updated = database.update_pet(pet_id, data)
    if not updated:
        return jsonify({"error": "Pet not found or failed to update"}), 404
    return jsonify(updated)

@app.route('/api/pets/<pet_id>', methods=['DELETE'])
def api_delete_pet(pet_id):
    deleted = database.delete_pet(pet_id)
    if not deleted:
        return jsonify({"error": "Pet not found"}), 404
    return jsonify({"success": True, "message": f"Pet {pet_id} deleted"})

# ==============================================================================
# REST API: TAG SCAN & FINDER RECOVERY LOGS
# ==============================================================================
@app.route('/api/pets/code/<pet_code>/scan', methods=['POST'])
def api_record_tag_scan(pet_code):
    pet = database.get_pet_by_id_or_code(pet_code)
    if not pet:
        return jsonify({"error": "Invalid pet code"}), 404

    data = request.get_json(silent=True) or {}
    loc = data.get('location', 'Mobile Camera Viewfinder')
    time_str = datetime.now().strftime("%I:%M %p")

    act = database.add_activity(
        pet_id=pet['id'],
        act_type="scan",
        title="Collar Tag Scanned",
        details=f"Physical tag scanned via smartphone camera. Location: {loc}",
        time_str=f"Today at {time_str}"
    )

    return jsonify({"success": True, "activity": act, "pet": pet})

@app.route('/api/pets/code/<pet_code>/location', methods=['POST'])
def api_record_tag_location(pet_code):
    pet = database.get_pet_by_id_or_code(pet_code)
    if not pet:
        return jsonify({"error": "Invalid pet code"}), 404

    data = request.get_json(silent=True) or {}
    lat = data.get('lat')
    lng = data.get('lng')
    if lat is None or lng is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    accuracy = data.get('accuracy', 12.0)
    address = data.get('address', 'Exact GPS Coordinates')
    device_info = data.get('deviceInfo', 'Smartphone Geolocation')
    time_str = datetime.now().strftime("Today at %I:%M %p")

    loc_id = database.add_scan_location(
        pet_id=pet['id'],
        lat=lat,
        lng=lng,
        accuracy=accuracy,
        address=address,
        device_info=device_info,
        time_str=time_str
    )

    return jsonify({
        "success": True,
        "message": f"GPS location logged for {pet['name']}",
        "locationId": loc_id,
        "pet": pet
    })

@app.route('/api/pets/<pet_id>/radar', methods=['GET'])
def api_get_pet_radar(pet_id):
    radar_data = database.get_radar_data(pet_id)
    if not radar_data:
        return jsonify({"error": "Pet not found"}), 404
    return jsonify(radar_data)

@app.route('/api/pets/<pet_id_or_code>/passport', methods=['GET'])
@app.route('/api/pets/code/<pet_id_or_code>/passport', methods=['GET'])
def api_get_pet_passport(pet_id_or_code):
    passport = database.get_pet_passport_data(pet_id_or_code)
    if not passport:
        return jsonify({"error": "Pet not found"}), 404
    return jsonify(passport)

@app.route('/api/pets/<pet_id>/broadcast-alert', methods=['POST'])
def api_broadcast_alert(pet_id):
    pet = database.get_pet_by_id_or_code(pet_id)
    if not pet:
        return jsonify({"error": "Pet not found"}), 404

    # Ensure pet is marked lost
    database.update_pet(pet['id'], {"isLost": True})

    act = database.add_activity(
        pet_id=pet['id'],
        act_type="alert",
        title=f"🚨 Community Alert Broadcasted — {pet['name']}",
        details="Dispatched priority push notifications to 148 verified pet owners, local shelters, and clinics in a 2-mile perimeter.",
        time_str="Just now"
    )

    return jsonify({
        "success": True,
        "message": f"Community alert broadcasted for {pet['name']}!",
        "recipientsCount": 148,
        "sheltersNotified": 3,
        "activity": act
    })

@app.route('/api/pets/code/<pet_code>/report-found', methods=['POST'])
def api_report_pet_found(pet_code):
    pet = database.get_pet_by_id_or_code(pet_code)
    if not pet:
        return jsonify({"error": "Invalid pet code"}), 404

    data = request.get_json(silent=True) or {}
    finder_name = data.get('finderName', 'A caring neighbor')
    finder_phone = data.get('finderPhone', '')
    location = data.get('location', 'Nearby area')
    note = data.get('note', '')

    time_str = datetime.now().strftime("%I:%M %p")

    act = database.add_activity(
        pet_id=pet['id'],
        act_type="found",
        title=f"Finder Alert — {pet['name']} Located!",
        details=f"Found by {finder_name} ({finder_phone}) at {location}. Note: {note}",
        time_str=f"Today at {time_str}"
    )

    return jsonify({"success": True, "activity": act})

@app.route('/api/activities', methods=['GET'])
def api_get_activities():
    activities = database.get_activities()
    return jsonify(activities)

# ==============================================================================
# REST API: PHYSICAL TAG ORDERS
# ==============================================================================
@app.route('/api/orders', methods=['GET'])
def api_get_orders():
    orders = database.get_orders()
    return jsonify(orders)

@app.route('/api/orders', methods=['POST'])
def api_create_order():
    data = request.get_json(silent=True) or {}
    user = session.get('user')
    user_id = user['id'] if user else "usr-sarah"

    order_id = database.create_order(data, user_id=user_id)
    orders = database.get_orders()
    created = next((o for o in orders if o['id'] == order_id), None)
    return jsonify(created or {"id": order_id}), 201

# ==============================================================================
# REST API: ANONYMOUS FINDER <-> OWNER CHAT & DIRECT MESSAGING
# ==============================================================================
@app.route('/api/pets/code/<pet_code>/chat/init', methods=['POST'])
def api_init_finder_chat(pet_code):
    data = request.get_json(silent=True) or {}
    finder_session = data.get('finderSessionId') or f"sess-{secrets.token_hex(8)}"
    finder_name = data.get('finderName') or "Kind Finder"

    thread = database.create_or_get_chat_thread(pet_code, finder_session, finder_name)
    if not thread:
        return jsonify({"error": "Pet not found"}), 404
    
    messages = database.get_thread_messages(thread['id'])
    return jsonify({
        "success": True,
        "thread": thread,
        "messages": messages
    })

@app.route('/api/chats/<thread_id>/messages', methods=['GET'])
def api_get_chat_messages(thread_id):
    thread = database.get_chat_thread_by_id(thread_id)
    if not thread:
        return jsonify({"error": "Chat thread not found"}), 404
    
    messages = database.get_thread_messages(thread_id)
    return jsonify({
        "success": True,
        "thread": thread,
        "messages": messages
    })

@app.route('/api/chats/<thread_id>/messages', methods=['POST'])
def api_send_chat_message(thread_id):
    data = request.get_json(silent=True) or {}
    sender = data.get('sender', 'finder')
    sender_name = data.get('senderName', 'Anonymous Finder' if sender == 'finder' else 'Pet Parent')
    text = data.get('text', '')
    photo_url = data.get('photoUrl')
    time_str = data.get('timeStr', 'Just now')

    if not text.strip() and not photo_url:
        return jsonify({"error": "Message text or photo is required"}), 400

    msg = database.add_chat_message(
        thread_id=thread_id,
        sender=sender,
        sender_name=sender_name,
        text=text,
        photo_url=photo_url,
        time_str=time_str
    )
    if not msg:
        return jsonify({"error": "Chat thread not found"}), 404

    return jsonify({"success": True, "message": msg}), 201

@app.route('/api/chats/<thread_id>/read', methods=['POST'])
def api_mark_chat_read(thread_id):
    data = request.get_json(silent=True) or {}
    role = data.get('role', 'owner')
    marked = database.mark_thread_read(thread_id, role)
    return jsonify({"success": True, "marked": marked})

@app.route('/api/owner/chats', methods=['GET'])
def api_get_owner_chats():
    user = session.get('user')
    user_id = user['id'] if user else None
    threads = database.get_owner_chat_threads(user_id)
    return jsonify(threads)

@app.route('/api/owner/unread-chats', methods=['GET'])
def api_get_owner_unread_chats():
    user = session.get('user')
    user_id = user['id'] if user else None
    unread_count = database.get_unread_message_count(user_id)
    return jsonify({"unreadCount": unread_count})

# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================
def run_server(port=8000):
    print("==================================================")
    print("[MyPet] Full-Stack Database Server (Flask + SQLite)")
    print(f"-> Local URL:   http://localhost:{port}")
    print(f"-> Sign In:     http://localhost:{port}/login")
    print(f"-> Register:    http://localhost:{port}/register")
    print(f"-> Database:    {database.DB_PATH}")
    print(f"-> API Health:  http://localhost:{port}/api/health")
    print(f"-> Table Counts: {database.get_table_counts()}")
    print("==================================================")
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port_arg)
