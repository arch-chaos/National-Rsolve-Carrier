from app import create_app
from models import db
from models.user import User
from models.driver import Driver
from models.truck import Truck
from models.route import Route
from models.location_log import LocationLog
from datetime import datetime, timedelta, timezone
import bcrypt


def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        user = User(
            username="admin",
            password_hash=bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8"),
            role="admin",
        )
        db.session.add(user)
        db.session.add(User(username="dispatcher1", password_hash=bcrypt.hashpw(b"dispatch123", bcrypt.gensalt()).decode("utf-8"), role="dispatcher"))
        db.session.commit()

        drivers = [
            Driver(name="M. Khan", phone="+1-555-0101", email="mkhan@nrc.com", license_number="LIC-001"),
            Driver(name="S. Ali", phone="+1-555-0102", email="sali@nrc.com", license_number="LIC-002"),
            Driver(name="R. Thomas", phone="+1-555-0103", email="rthomas@nrc.com", license_number="LIC-003"),
        ]
        db.session.add_all(drivers)
        db.session.commit()

        trucks = [
            Truck(plate_number="TR-04", status="on_route", driver_id=drivers[0].id),
            Truck(plate_number="TR-11", status="paused", driver_id=drivers[1].id),
            Truck(plate_number="TR-18", status="idle", driver_id=drivers[2].id),
            Truck(plate_number="TR-07", status="on_route", driver_id=None),
            Truck(plate_number="TR-22", status="maintenance", driver_id=None),
        ]
        db.session.add_all(trucks)
        db.session.commit()

        routes_data = [
            Route(name="North Corridor", origin="North Hub", destination="City Center", status="in_progress", truck_id=trucks[0].id, driver_id=drivers[0].id),
            Route(name="Coastal Run", origin="West Gate", destination="East Terminal", status="in_progress", truck_id=trucks[1].id, driver_id=drivers[1].id),
            Route(name="Central Hub", origin="Central Yard", destination="South Depot", status="pending", truck_id=trucks[2].id, driver_id=drivers[2].id),
        ]
        db.session.add_all(routes_data)
        db.session.commit()

        locations = [
            LocationLog(truck_id=trucks[0].id, latitude=40.7128, longitude=-74.0060, speed=65.0, recorded_at=datetime.now(timezone.utc) - timedelta(minutes=5)),
            LocationLog(truck_id=trucks[0].id, latitude=40.7282, longitude=-73.7949, speed=70.0, recorded_at=datetime.now(timezone.utc) - timedelta(minutes=2)),
            LocationLog(truck_id=trucks[0].id, latitude=40.7484, longitude=-73.9857, speed=68.0, recorded_at=datetime.now(timezone.utc)),
            LocationLog(truck_id=trucks[1].id, latitude=40.6892, longitude=-74.0445, speed=0.0, recorded_at=datetime.now(timezone.utc) - timedelta(minutes=3)),
            LocationLog(truck_id=trucks[1].id, latitude=40.6892, longitude=-74.0445, speed=0.0, recorded_at=datetime.now(timezone.utc)),
            LocationLog(truck_id=trucks[3].id, latitude=40.7580, longitude=-73.9855, speed=55.0, recorded_at=datetime.now(timezone.utc) - timedelta(minutes=1)),
            LocationLog(truck_id=trucks[3].id, latitude=40.7484, longitude=-73.9857, speed=60.0, recorded_at=datetime.now(timezone.utc)),
        ]
        db.session.add_all(locations)
        db.session.commit()

        print("Database seeded successfully!")
        print("Admin credentials: admin / admin123")
        print("Dispatcher credentials: dispatcher1 / dispatch123")


if __name__ == "__main__":
    seed()
