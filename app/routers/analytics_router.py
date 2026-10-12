from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from app.services.auth_service import get_current_user, require_roles
from app.services.analytics_service import (
    get_user_dashboard_analytics,
    get_reader_dashboard_analytics,
    get_consultant_dashboard_analytics,
    get_admin_dashboard_analytics
)
from app.database import db, save_db

router = APIRouter(prefix="/api/analytics", tags=["Dashboards & Analytics"])

@router.get("/user")
def user_dashboard(current_user: dict = Depends(get_current_user)):
    return get_user_dashboard_analytics(current_user["id"])

@router.get("/reader")
def reader_dashboard(current_user: dict = Depends(require_roles(["Tarot Reader", "Administrator"]))):
    return get_reader_dashboard_analytics(current_user["id"])

@router.get("/consultant")
def consultant_dashboard(current_user: dict = Depends(require_roles(["Spiritual Consultant", "Administrator"]))):
    return get_consultant_dashboard_analytics(current_user["id"])

@router.get("/admin")
def admin_dashboard(current_user: dict = Depends(require_roles(["Administrator"]))):
    return get_admin_dashboard_analytics()

@router.get("/admin/users")
def get_all_users(current_user: dict = Depends(require_roles(["Administrator"]))):
    safe_users = []
    for u in db["users"].values():
        c = u.copy()
        c.pop("password_hash", None)
        safe_users.append(c)
    return safe_users

@router.post("/admin/users/{target_user_id}/role")
def update_user_role(
    target_user_id: str,
    payload: Dict[str, str] = Body(...),
    current_user: dict = Depends(require_roles(["Administrator"]))
):
    if target_user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    new_role = payload.get("role")
    if not new_role:
        raise HTTPException(status_code=400, detail="Missing role field")
    
    db["users"][target_user_id]["role"] = new_role
    save_db()
    return {"status": "success", "message": f"Updated {db['users'][target_user_id]['name']} role to {new_role}"}
