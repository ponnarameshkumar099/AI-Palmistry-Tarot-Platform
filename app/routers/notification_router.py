from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.auth_service import get_current_user
from app.services.notification_service import get_user_notifications, mark_notification_read, trigger_daily_guidance_dispatch

router = APIRouter(prefix="/api/notifications", tags=["Notification & Engagement System"])

@router.get("")
def list_notifications(
    unread_only: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id", "")
    user_role = current_user.get("role", "User")
    return get_user_notifications(user_id=user_id, user_role=user_role, unread_only=unread_only)

@router.post("/{notif_id}/read")
def mark_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id", "")
    success = mark_notification_read(notif_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success", "message": "Marked as read"}

@router.post("/trigger-daily-guidance")
def trigger_daily(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id", "")
    item = trigger_daily_guidance_dispatch(user_id)
    return {"status": "success", "notification": item}
