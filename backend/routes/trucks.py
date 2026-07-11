from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.truck import Truck
from models.location_log import LocationLog
from models import db

trucks_bp = Blueprint("trucks", __name__, url_prefix="/api/trucks")


@trucks_bp.route("", methods=["GET"])
@jwt_required()
def get_trucks():
    status = request.args.get("status")
    query = Truck.query
    if status:
        query = query.filter_by(status=status)
    trucks = query.order_by(Truck.plate_number).all()
    return jsonify({"trucks": [t.to_dict_with_driver() for t in trucks]}), 200


@trucks_bp.route("/live", methods=["GET"])
@jwt_required()
def get_live_trucks():
    trucks = Truck.query.filter(Truck.status.in_(["on_route", "active"])).all()
    result = []
    for truck in trucks:
        latest = (
            LocationLog.query.filter_by(truck_id=truck.id)
            .order_by(LocationLog.recorded_at.desc())
            .first()
        )
        t = truck.to_dict_with_driver()
        t["last_location"] = latest.to_dict() if latest else None
        result.append(t)
    return jsonify({"trucks": result}), 200


@trucks_bp.route("/<int:truck_id>", methods=["GET"])
@jwt_required()
def get_truck(truck_id):
    truck = Truck.query.get_or_404(truck_id)
    return jsonify({"truck": truck.to_dict_with_driver()}), 200


@trucks_bp.route("", methods=["POST"])
@jwt_required()
def create_truck():
    data = request.get_json()
    if not data or not data.get("plate_number"):
        return jsonify({"error": "plate_number is required"}), 400

    if Truck.query.filter_by(plate_number=data["plate_number"]).first():
        return jsonify({"error": "Truck with this plate number already exists"}), 409

    truck = Truck(
        plate_number=data["plate_number"],
        status=data.get("status", "idle"),
        driver_id=data.get("driver_id"),
    )
    db.session.add(truck)
    db.session.commit()
    return jsonify({"truck": truck.to_dict_with_driver()}), 201


@trucks_bp.route("/<int:truck_id>", methods=["PUT"])
@jwt_required()
def update_truck(truck_id):
    truck = Truck.query.get_or_404(truck_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "plate_number" in data:
        truck.plate_number = data["plate_number"]
    if "status" in data:
        truck.status = data["status"]
    if "driver_id" in data:
        truck.driver_id = data["driver_id"]

    db.session.commit()
    return jsonify({"truck": truck.to_dict_with_driver()}), 200


@trucks_bp.route("/<int:truck_id>", methods=["DELETE"])
@jwt_required()
def delete_truck(truck_id):
    truck = Truck.query.get_or_404(truck_id)

    from models.route import Route
    from models.location_log import LocationLog

    Route.query.filter_by(truck_id=truck_id).update({"truck_id": None})
    LocationLog.query.filter_by(truck_id=truck_id).delete()

    db.session.delete(truck)
    db.session.commit()
    return jsonify({"message": "Truck deleted"}), 200
