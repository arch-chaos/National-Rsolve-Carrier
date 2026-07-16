from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.location_log import LocationLog
from models.truck import Truck
from models import db
from datetime import datetime, timezone

locations_bp = Blueprint("locations", __name__, url_prefix="/api/location")


@locations_bp.route("", methods=["POST"])
def receive_location():
    data = request.get_json()
    if not data or not data.get("truck_id") or data.get("latitude") is None or data.get("longitude") is None:
        return jsonify({"error": "truck_id, latitude, and longitude are required"}), 400

    truck = Truck.query.get(data["truck_id"])
    if not truck:
        return jsonify({"error": "Truck not found"}), 404

    recorded_at = None
    if data.get("timestamp"):
        try:
            recorded_at = datetime.fromisoformat(data["timestamp"])
        except (ValueError, TypeError):
            recorded_at = datetime.now(timezone.utc)

    log = LocationLog(
        truck_id=data["truck_id"],
        latitude=data["latitude"],
        longitude=data["longitude"],
        speed=data.get("speed", 0.0),
        recorded_at=recorded_at or datetime.now(timezone.utc),
    )
    db.session.add(log)

    if truck.status == "idle":
        truck.status = "on_route"
    db.session.commit()

    try:
        from app import socketio
        socketio.emit(
            "location_update",
            {"truck_id": truck.id, "latitude": log.latitude, "longitude": log.longitude,
             "speed": log.speed, "recorded_at": log.recorded_at.isoformat()},
        )
    except Exception:
        pass

    return jsonify({"location": log.to_dict()}), 201


@locations_bp.route("/<int:truck_id>", methods=["GET"])
@jwt_required()
def get_location_history(truck_id):
    truck = Truck.query.get_or_404(truck_id)
    limit = request.args.get("limit", 50, type=int)
    logs = (
        LocationLog.query.filter_by(truck_id=truck_id)
        .order_by(LocationLog.recorded_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify({"truck_id": truck.id, "locations": [l.to_dict() for l in logs]}), 200
