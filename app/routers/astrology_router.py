"""
Astrology & Career Intelligence REST API Router
Provides endpoints for Palmistry + Zodiac + User Interests Career Guidance,
Natal Birth Charts, Zodiac Compatibility, and Daily Horoscopes.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.astrology_service import (
    calculate_integrated_career_guidance,
    generate_natal_chart_details,
    calculate_zodiac_compatibility,
    get_zodiac_horoscope_transits,
    get_12_houses_guide,
    ZODIAC_DATA
)

router = APIRouter(prefix="/api/astrology", tags=["Astrology & Career Intelligence"])

class CareerGuidanceRequest(BaseModel):
    palm_data: Optional[Dict[str, Any]] = None
    zodiac_sign: str = "Aries"
    user_interests: List[str] = ["Technology", "Management", "Entrepreneurship"]
    career_stage: Optional[str] = "Mid-Career / Growth"
    skills: Optional[List[str]] = None

class NatalChartRequest(BaseModel):
    dob: str = "1998-05-15"
    time_of_birth: Optional[str] = "14:30"
    location: Optional[str] = "New York, USA"

class CompatibilityRequest(BaseModel):
    sign_1: str = "Leo"
    sign_2: str = "Aries"

@router.post("/career-guidance")
def get_career_guidance_endpoint(req: CareerGuidanceRequest):
    """
    Computes integrated Career Guidance combining Palmistry CV features,
    Zodiac Sign archetype, and User Interests.
    """
    if req.zodiac_sign not in ZODIAC_DATA:
        req.zodiac_sign = "Aries"
    return calculate_integrated_career_guidance(
        palm_data=req.palm_data,
        zodiac_sign=req.zodiac_sign,
        interests=req.user_interests,
        career_stage=req.career_stage,
        skills=req.skills
    )

@router.post("/natal-chart")
def get_natal_chart_endpoint(req: NatalChartRequest):
    """
    Calculates Natal Birth Map, Sun/Moon/Ascendant signs, and 12 Astrological House positions.
    """
    return generate_natal_chart_details(
        dob=req.dob,
        time_of_birth=req.time_of_birth,
        location=req.location
    )

@router.post("/compatibility")
def get_compatibility_endpoint(req: CompatibilityRequest):
    """
    Calculates energetic and professional compatibility between two Zodiac signs.
    """
    return calculate_zodiac_compatibility(req.sign_1, req.sign_2)

@router.get("/horoscope/{zodiac_sign}")
def get_horoscope_endpoint(zodiac_sign: str):
    """
    Returns daily horoscope, planetary transits, career outlook, and lucky parameters for a sign.
    """
    sign_clean = zodiac_sign.capitalize()
    if sign_clean not in ZODIAC_DATA:
        raise HTTPException(status_code=404, detail=f"Zodiac sign '{zodiac_sign}' not found.")
    return get_zodiac_horoscope_transits(sign_clean)

@router.get("/houses")
def get_houses_guide_endpoint():
    """
    Returns full reference catalog of all 12 Astrological Houses.
    """
    return {"houses": get_12_houses_guide()}

@router.get("/zodiac-signs")
def get_all_zodiac_signs():
    """
    Returns all 12 Zodiac signs with symbols, elements, and ruling planets.
    """
    return {"zodiac_signs": ZODIAC_DATA}
