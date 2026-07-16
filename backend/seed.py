from app import create_app
from models import db
from models.user import User
import bcrypt


def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        db.session.add(User(
            username="admin",
            password_hash=bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8"),
            role="admin",
        ))
        db.session.add(User(
            username="dispatcher1",
            password_hash=bcrypt.hashpw(b"dispatch123", bcrypt.gensalt()).decode("utf-8"),
            role="dispatcher",
        ))
        db.session.commit()

        print("Database seeded successfully!")
        print("Admin: admin / admin123")
        print("Dispatcher: dispatcher1 / dispatch123")


if __name__ == "__main__":
    seed()
