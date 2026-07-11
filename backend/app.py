from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

from config import Config
from models import init_db, db
from routes.auth import auth_bp
from routes.trucks import trucks_bp
from routes.drivers import drivers_bp
from routes.routes_bp import routes_bp
from routes.locations import locations_bp
from routes.dashboard import dashboard_bp
from routes.reports import reports_bp

socketio = SocketIO(cors_allowed_origins="*")


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    origins = "*"
    CORS(app, resources={r"/*": {"origins": origins}})
    JWTManager(app)

    init_db(app)

    socketio.init_app(app, cors_allowed_origins="*")

    app.register_blueprint(auth_bp)
    app.register_blueprint(trucks_bp)
    app.register_blueprint(drivers_bp)
    app.register_blueprint(routes_bp)
    app.register_blueprint(locations_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(reports_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "NRC TMS API"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
