import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import STATIC_DIR
from app.database import load_db
from app.routers import (
    auth_router,
    user_router,
    palm_router,
    tarot_router,
    reading_router,
    personality_trend_router,
    recommendation_router,
    analytics_router,
    export_router,
    notification_router,
    astrology_router,
    chat_router,
    appointment_router
)

# Ensure database is loaded
load_db()

app = FastAPI(
    title="AI based palmistry & tarot intelligence",
    description="AI-powered spiritual intelligence platform analyzing palm features, tarot card spreads, and astrological signs to generate personalized career and life insights.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:8000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Middleware to prevent browser caching of static HTML/JS/CSS
@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Include API Routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(palm_router.router)
app.include_router(tarot_router.router)
app.include_router(reading_router.router)
app.include_router(personality_trend_router.router)
app.include_router(recommendation_router.router)
app.include_router(analytics_router.router)
app.include_router(export_router.router)
app.include_router(notification_router.router)
app.include_router(astrology_router.router)
app.include_router(chat_router.router)
app.include_router(appointment_router.router)

# Mount Static Files
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "Palmistry & Tarot Intelligence Platform",
        "version": "1.0.0",
        "modules": [
            "Authentication",
            "User Profiles",
            "Palm Analysis",
            "Tarot Readings",
            "Astrology & Career Intelligence",
            "AI Interpretation",
            "Guidance Scoring",
            "Personality Trends",
            "Recommendations",
            "Analytics",
            "Report Exports",
            "Notifications",
            "Role Dashboards"
        ]
    }

@app.get("/")
def serve_index():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(
            str(index_path),
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    return {"message": "AI based palmistry & tarot intelligence API is running. Access /docs for API documentation."}
