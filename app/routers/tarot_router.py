from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.models.schemas import TarotSpreadRequest, TarotReadingResult
from app.services.tarot_service import get_all_cards, get_spread_definitions, conduct_tarot_reading
from app.services.auth_service import get_current_user
from app.database import db, save_db

router = APIRouter(prefix="/api/tarot", tags=["Tarot Reading Engine"])

@router.get("/deck")
def get_deck():
    """Returns the complete 78-Card Tarot Deck."""
    return get_all_cards()

@router.get("/spreads")
def get_spreads():
    """Returns definitions and positions for all 6 supported tarot spreads."""
    return get_spread_definitions()

@router.post("/read", response_model=TarotReadingResult)
def draw_tarot_reading(req: TarotSpreadRequest, current_user: dict = Depends(get_current_user)):
    result = conduct_tarot_reading(
        spread_type=req.spread_type,
        deck_style=req.deck_style,
        question=req.question or "What guidance does the universe offer me?",
        category_focus=req.category_focus or "General",
        preselected_card_ids=req.preselected_card_ids,
        preselected_reversals=req.preselected_reversals
    )
    
    db["tarot_sessions"][result["id"]] = {
        **result,
        "user_id": current_user["id"]
    }
    save_db()
    return result

@router.get("/history")
def get_user_tarot_history(current_user: dict = Depends(get_current_user)):
    sessions = [s for s in db["tarot_sessions"].values() if s.get("user_id") == current_user["id"]]
    sessions.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return sessions
