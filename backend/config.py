import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(64).hex())
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.urandom(64).hex())
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    _db_url = os.getenv("DATABASE_URL", "sqlite:///nrc_tms.db")
    if _db_url and _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 86400
