from . import db
from datetime import datetime, timezone


class LocationLog(db.Model):
    __tablename__ = "location_logs"

    id = db.Column(db.Integer, primary_key=True)
    truck_id = db.Column(
        db.Integer, db.ForeignKey("trucks.id"), nullable=False, index=True
    )
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed = db.Column(db.Float, nullable=True, default=0.0)
    recorded_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.Index("idx_truck_recorded", "truck_id", "recorded_at"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "truck_id": self.truck_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "speed": self.speed,
            "recorded_at": self.recorded_at.isoformat(),
        }
