from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.services.auth_service import get_current_user
from app.models.schemas import UserProfileUpdate
from app.database import db, save_db

router = APIRouter(prefix="/api/user", tags=["User Profile Management"])

@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    user = current_user.copy()
    user.pop("password_hash", None)
    return user

@router.put("/profile")
def update_profile(update_data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    target = db["users"][user_id]
    dump = update_data.model_dump(exclude_unset=True)
    for k, v in dump.items():
        if v is not None:
            target[k] = v
            
    save_db()
    safe_user = target.copy()
    safe_user.pop("password_hash", None)
    return safe_user

@router.get("/goals")
def get_goals(current_user: dict = Depends(get_current_user)):
    return {
        "spiritual_goals": current_user.get("spiritual_goals", []),
        "reading_preferences": current_user.get("reading_preferences", {}),
        "interests": current_user.get("interests", [])
    }

@router.post("/goals")
def update_goals(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    target = db["users"][user_id]
    if "spiritual_goals" in payload:
        target["spiritual_goals"] = payload["spiritual_goals"]
    if "reading_preferences" in payload:
        target["reading_preferences"] = payload["reading_preferences"]
    if "interests" in payload:
        target["interests"] = payload["interests"]
    save_db()
    return {"status": "success", "message": "Goals updated successfully"}
