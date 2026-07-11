from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.driver import Driver
from models import db

drivers_bp = Blueprint("drivers", __name__, url_prefix="/api/drivers")


@drivers_bp.route("", methods=["GET"])
@jwt_required()
def get_drivers():
    drivers = Driver.query.order_by(Driver.name).all()
    return jsonify({"drivers": [d.to_dict() for d in drivers]}), 200


@drivers_bp.route("/<int:driver_id>", methods=["GET"])
@jwt_required()
def get_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    return jsonify({"driver": driver.to_dict()}), 200


@drivers_bp.route("", methods=["POST"])
@jwt_required()
def create_driver():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("phone"):
        return jsonify({"error": "name and phone are required"}), 400

    driver = Driver(
        name=data["name"],
        phone=data["phone"],
        email=data.get("email"),
        license_number=data.get("license_number", f"LIC-{data['phone']}"),
    )
    db.session.add(driver)
    db.session.commit()
    return jsonify({"driver": driver.to_dict()}), 201


@drivers_bp.route("/<int:driver_id>", methods=["PUT"])
@jwt_required()
def update_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "name" in data:
        driver.name = data["name"]
    if "phone" in data:
        driver.phone = data["phone"]
    if "email" in data:
        driver.email = data["email"]
    if "license_number" in data:
        driver.license_number = data["license_number"]

    db.session.commit()
    return jsonify({"driver": driver.to_dict()}), 200


@drivers_bp.route("/<int:driver_id>", methods=["DELETE"])
@jwt_required()
def delete_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)

    from models.truck import Truck
    from models.route import Route

    Truck.query.filter_by(driver_id=driver_id).update({"driver_id": None})
    Route.query.filter_by(driver_id=driver_id).update({"driver_id": None})

    db.session.delete(driver)
    db.session.commit()
    return jsonify({"message": "Driver deleted"}), 200
