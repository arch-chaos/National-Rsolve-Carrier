import secrets, string
from . import db
from datetime import datetime, timezone


def gen_code():
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))


class Driver(db.Model):
    __tablename__ = "drivers"

    id = db.Column(db.Integer, primary_key=True)
    access_code = db.Column(db.String(6), unique=True, nullable=False, default=gen_code)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "access_code": self.access_code,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "license_number": self.license_number,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
