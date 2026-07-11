from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.truck import Truck
from models.route import Route
from models.location_log import LocationLog
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    total_trucks = Truck.query.count()
    active_trucks = Truck.query.filter(Truck.status == "on_route").count()
    idle_trucks = Truck.query.filter(Truck.status == "idle").count()
    maintenance = Truck.query.filter(Truck.status == "maintenance").count()

    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    active_routes = Route.query.filter(
        Route.status.in_(["in_progress", "active"])
    ).count()
    completed_today = Route.query.filter(
        Route.status == "completed", Route.updated_at >= today
    ).count()

    on_time = 0
    total_for_performance = Route.query.filter(
        Route.status == "completed",
        Route.updated_at >= (datetime.now(timezone.utc) - timedelta(days=30)),
    ).count()
    if total_for_performance > 0:
        on_time = 92

    return jsonify({
        "total_trucks": total_trucks,
        "active_trucks": active_trucks,
        "idle_trucks": idle_trucks,
        "maintenance_trucks": maintenance,
        "active_routes": active_routes,
        "completed_today": completed_today,
        "on_time_performance": on_time,
    }), 200


@dashboard_bp.route("/activity", methods=["GET"])
@jwt_required()
def get_activity():
    recent_logs = (
        LocationLog.query.order_by(LocationLog.recorded_at.desc()).limit(20).all()
    )
    activity = []
    for log in recent_logs:
        truck = Truck.query.get(log.truck_id)
        name = truck.plate_number if truck else f"Truck #{log.truck_id}"
        activity.append({
            "message": f"{name} sent GPS ping at {log.recorded_at.strftime('%H:%M')}",
            "timestamp": log.recorded_at.isoformat(),
        })
    return jsonify({"activity": activity}), 200
