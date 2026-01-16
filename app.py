from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# UŻYTKOWNICY
users = {
    "admin1": {"id": 1, "name": "Admin One", "role": "admin", "password": "1111"},
    "driver1": {"id": 2, "name": "Driver One", "role": "driver", "password": "1111"},
    "driver2": {"id": 3, "name": "Driver Two", "role": "driver", "password": "1111"},
}

# POJAZDY
vehicles = [
    {"id": 1, "name": "Bus 1", "plate": "SK 12345", "mileage": 120000, "driver_id": 2},
    {"id": 2, "name": "Bus 2", "plate": "SK 54321", "mileage": 80000, "driver_id": 3},
]
next_vehicle_id = 3

# RAPORTY KIEROWCY (foto + notatki + licznik)
reports = []
next_report_id = 1

@app.route('/api/health')
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    user = users.get(username)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid credentials"}), 401
    
    return jsonify({
        "token": username,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "role": user["role"]
        }
    }), 200

def get_user_from_token():
    token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    if not token:
        return None
    return users.get(token)

@app.route('/api/vehicles')
def get_vehicles():
    user = get_user_from_token()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    if user["role"] == "admin":
        return jsonify(vehicles), 200
    
    filtered = [v for v in vehicles if v.get("driver_id") == user["id"]]
    return jsonify(filtered), 200

# RAPORT - NOWY WPIS (start lub koniec dnia)
@app.route('/api/reports', methods=['POST'])
def create_report():
    global next_report_id
    user = get_user_from_token()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json or {}
    report = {
        "id": next_report_id,
        "driver_id": user["id"],
        "vehicle_id": data.get("vehicle_id"),
        "type": data.get("type"),  # "start" lub "end"
        "odometer": data.get("odometer"),
        "note": data.get("note", ""),
        "photo_url": data.get("photo_url", ""),  # URL z Cloudinary
        "created_at": datetime.utcnow().isoformat()
    }
    next_report_id += 1
    reports.append(report)
    return jsonify(report), 201

# POBRANIE RAPORTÓW
@app.route('/api/reports')
def get_reports():
    user = get_user_from_token()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    if user["role"] == "admin":
        return jsonify(reports), 200
    
    filtered = [r for r in reports if r.get("driver_id") == user["id"]]
    return jsonify(filtered), 200

# USUWANIE RAPORTU
@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    user = get_user_from_token()
    if not user or user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    
    global reports
    reports = [r for r in reports if r["id"] != report_id]
    return jsonify({"success": True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
