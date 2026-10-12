from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.services.auth_service import get_current_user
from app.services.recommendation_service import get_recommendations_for_user

router = APIRouter(prefix="/api/recommendations", tags=["Recommendation Engine"])

@router.get("")
def get_recommendations(
    category: Optional[str] = Query("All", description="Category: Personal Growth, Relationships, Career, Goal Alignment, Spiritual Development"),
    current_user: dict = Depends(get_current_user)
):
    recs = get_recommendations_for_user(
        goals=current_user.get("spiritual_goals", []),
        user_category=category
    )
    return recs
