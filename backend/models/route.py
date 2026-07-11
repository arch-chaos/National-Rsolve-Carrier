from . import db
from datetime import datetime, timezone


class Route(db.Model):
    __tablename__ = "routes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    origin = db.Column(db.String(200), nullable=False)
    destination = db.Column(db.String(200), nullable=False)
    status = db.Column(
        db.String(20), nullable=False, default="pending"
    )
    truck_id = db.Column(db.Integer, db.ForeignKey("trucks.id"), nullable=True)
    driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    truck = db.relationship("Truck", backref="routes", lazy=True)
    driver = db.relationship("Driver", backref="routes", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "origin": self.origin,
            "destination": self.destination,
            "status": self.status,
            "truck_id": self.truck_id,
            "driver_id": self.driver_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def to_dict_with_relations(self):
        d = self.to_dict()
        if self.truck:
            d["truck"] = self.truck.to_dict()
        if self.driver:
            d["driver"] = self.driver.to_dict()
        return d
