from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.route import Route
from models.location_log import LocationLog
from models.truck import Truck
from datetime import datetime, timezone

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.route("/trips", methods=["GET"])
@jwt_required()
def get_trip_reports():
    days = request.args.get("days", 7, type=int)
    since = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    try:
        from datetime import timedelta
        since -= timedelta(days=days)
    except ImportError:
        pass

    routes = (
        Route.query.filter(Route.created_at >= since)
        .order_by(Route.created_at.desc())
        .all()
    )
    return jsonify({
        "report": {
            "period_days": days,
            "total_trips": len(routes),
            "routes": [r.to_dict_with_relations() for r in routes],
        }
    }), 200


@reports_bp.route("/truck/<int:truck_id>", methods=["GET"])
@jwt_required()
def get_truck_report(truck_id):
    truck = Truck.query.get_or_404(truck_id)
    days = request.args.get("days", 7, type=int)

    from datetime import timedelta
    since = datetime.now(timezone.utc) - timedelta(days=days)

    locations = (
        LocationLog.query.filter(
            LocationLog.truck_id == truck_id,
            LocationLog.recorded_at >= since,
        )
        .order_by(LocationLog.recorded_at.asc())
        .all()
    )

    routes = (
        Route.query.filter(
            Route.truck_id == truck_id,
            Route.created_at >= since,
        )
        .order_by(Route.created_at.desc())
        .all()
    )

    total_distance = 0
    for i in range(1, len(locations)):
        from math import radians, sin, cos, sqrt, atan2
        lat1, lon1 = radians(locations[i - 1].latitude), radians(locations[i - 1].longitude)
        lat2, lon2 = radians(locations[i].latitude), radians(locations[i].longitude)
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        total_distance += 6371 * c

    return jsonify({
        "report": {
            "truck": truck.to_dict_with_driver(),
            "period_days": days,
            "total_distance_km": round(total_distance, 2),
            "location_points": len(locations),
            "routes_completed": len(routes),
            "routes": [r.to_dict() for r in routes],
        }
    }), 200
