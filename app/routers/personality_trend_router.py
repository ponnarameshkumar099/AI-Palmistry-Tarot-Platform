from fastapi import APIRouter, Depends, Query, Body
from typing import Optional, Dict, Any
from app.services.auth_service import get_current_user
from app.services.personality_trend_service import generate_personality_profile, generate_life_trend_forecast
from app.services.personality_ml_engine import ml_engine
from app.services.career_guidance_ml_model import career_ml_engine

router = APIRouter(prefix="/api/intelligence", tags=["Personality & Life Trend Intelligence"])

@router.get("/personality-profile")
def get_personality_profile(
    element: Optional[str] = Query("Water", description="Element: Water, Fire, Air, Earth"),
    current_user: dict = Depends(get_current_user)
):
    profile = generate_personality_profile(
        hand_element=element,
        user_interests=current_user.get("interests", [])
    )
    # Also attach ML personality inference
    ml_res = ml_engine.predict({
        "zodiac_element_code": 1 if element == "Fire" else (2 if element == "Earth" else (3 if element == "Air" else 4)),
        "stress_resilience_level": 8.2,
        "social_engagement_score": 7.8,
        "ambition_drive_score": 8.5
    })
    profile["ml_personality_insights"] = ml_res
    return profile

@router.get("/life-trends")
def get_life_trends(
    element: Optional[str] = Query("Water"),
    current_user: dict = Depends(get_current_user)
):
    age_group = current_user.get("age_group", "26-35")
    trends = generate_life_trend_forecast(user_age_group=age_group, dominant_element=element)
    return trends

@router.post("/ml-personality-predict")
def predict_ml_personality(
    payload: Dict[str, Any] = Body(default={})
):
    """Executes real-time Scikit-Learn Machine Learning inference for Personality Assessment & Trait Prediction."""
    result = ml_engine.predict(payload)
    return result

@router.get("/ml-model-stats")
def get_ml_model_stats():
    """Returns Machine Learning Personality Engine training metrics and feature importances."""
    if not ml_engine.is_trained:
        ml_engine.load_or_train()
    return {
        "status": "active",
        "metrics": ml_engine.model_metrics,
        "feature_names": [
            "Palm Heart Line", "Palm Head Line", "Palm Life Line", "Palm Fate Line",
            "Tarot Major Arcana", "Fire Element", "Water Element", "Air Element", "Earth Element",
            "Zodiac Code", "Stress Resilience", "Social Score", "Ambition Score"
        ]
    }

@router.post("/ml-career-roadmap")
def predict_career_roadmap(
    payload: Dict[str, Any] = Body(default={})
):
    """Executes RandomForest + KNN ML model inference to predict optimal career choices and generate step-by-step roadmaps."""
    return career_ml_engine.predict_career_roadmap(payload)

@router.get("/personal-development")
def get_personal_development_guidance(
    name: Optional[str] = Query("Seeker")
):
    """Returns 4 Pillars of Character & Personal Development Blueprint."""
    return career_ml_engine.generate_personal_development_guidance(seeker_name=name)

@router.get("/relationship-guidance")
def get_relationship_guidance(
    name: Optional[str] = Query("Seeker")
):
    """Returns 1-on-1 Relationship Advice, Harmony Principles & Conflict Resolution Workflow."""
    return career_ml_engine.generate_relationship_guidance(seeker_name=name)

@router.post("/universal-problem-solver")
def solve_universal_problem(
    payload: Dict[str, Any] = Body(default={})
):
    """Universal AI Problem Solver protocol for any query."""
    question = payload.get("question", "How can I improve my life?")
    seeker_name = payload.get("seeker_name", "Seeker")
    solution = career_ml_engine.solve_universal_problem(question, seeker_name)
    return {
        "question": question,
        "solution": solution,
        "status": "success"
    }

