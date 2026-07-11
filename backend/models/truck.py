from . import db
from datetime import datetime, timezone


class Truck(db.Model):
    __tablename__ = "trucks"

    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    status = db.Column(
        db.String(20), nullable=False, default="idle"
    )
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

    driver = db.relationship("Driver", backref="trucks", lazy=True)
    location_logs = db.relationship(
        "LocationLog", backref="truck", lazy=True, order_by="LocationLog.recorded_at.desc()"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "plate_number": self.plate_number,
            "status": self.status,
            "driver_id": self.driver_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def to_dict_with_driver(self):
        d = self.to_dict()
        if self.driver:
            d["driver"] = self.driver.to_dict()
        return d
