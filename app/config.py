import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
EXPORTS_DIR = DATA_DIR / "exports"

DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)
EXPORTS_DIR.mkdir(exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "mystic_secret_key_default_super_secret_2026_dev")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

ROLES = ["User", "Tarot Reader", "Spiritual Consultant", "Administrator"]
SPREAD_TYPES = [
    "Single Card Reading",
    "Three Card Reading",
    "Relationship Spread",
    "Career Spread",
    "Celtic Cross Spread",
    "Life Path Spread"
]
INSIGHT_CATEGORIES = [
    "Personality",
    "Relationships",
    "Career",
    "Finance",
    "Health & Wellness",
    "Personal Growth",
    "Life Opportunities"
]
