from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.route import Route
from models import db

routes_bp = Blueprint("routes", __name__, url_prefix="/api/routes")


@routes_bp.route("", methods=["GET"])
@jwt_required()
def get_routes():
    status = request.args.get("status")
    query = Route.query
    if status:
        query = query.filter_by(status=status)
    routes = query.order_by(Route.created_at.desc()).all()
    return jsonify({"routes": [r.to_dict_with_relations() for r in routes]}), 200


@routes_bp.route("/<int:route_id>", methods=["GET"])
@jwt_required()
def get_route(route_id):
    route = Route.query.get_or_404(route_id)
    return jsonify({"route": route.to_dict_with_relations()}), 200


@routes_bp.route("", methods=["POST"])
@jwt_required()
def create_route():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("origin") or not data.get("destination"):
        return jsonify({"error": "name, origin, and destination are required"}), 400

    route = Route(
        name=data["name"],
        origin=data["origin"],
        destination=data["destination"],
        status=data.get("status", "pending"),
        truck_id=data.get("truck_id"),
        driver_id=data.get("driver_id"),
    )
    db.session.add(route)
    db.session.commit()
    return jsonify({"route": route.to_dict_with_relations()}), 201


@routes_bp.route("/<int:route_id>", methods=["PUT"])
@jwt_required()
def update_route(route_id):
    route = Route.query.get_or_404(route_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    for field in ("name", "origin", "destination", "status", "truck_id", "driver_id"):
        if field in data:
            setattr(route, field, data[field])

    db.session.commit()
    return jsonify({"route": route.to_dict_with_relations()}), 200


@routes_bp.route("/<int:route_id>", methods=["DELETE"])
@jwt_required()
def delete_route(route_id):
    route = Route.query.get_or_404(route_id)
    db.session.delete(route)
    db.session.commit()
    return jsonify({"message": "Route deleted"}), 200
