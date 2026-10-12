import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.database import db, save_db

def create_notification(user_id: str, notif_type: str, title: str, message: str, action_url: Optional[str] = None, role: Optional[str] = None) -> Dict[str, Any]:
    notif_id = f"notif-{uuid.uuid4().hex[:8]}"
    item = {
        "id": notif_id,
        "user_id": user_id,
        "role": role,
        "type": notif_type,
        "title": title,
        "message": message,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "read": False,
        "action_url": action_url or "/dashboard"
    }
    if "notifications" not in db:
        db["notifications"] = {}
    db["notifications"][notif_id] = item
    save_db()
    return item

def get_user_notifications(user_id: str, user_role: str = "User", unread_only: bool = False) -> List[Dict[str, Any]]:
    user_notifs = [
        n for n in db.get("notifications", {}).values() 
        if n.get("user_id") == user_id or n.get("user_id") == "all" or n.get("user_id") == user_role or n.get("role") == user_role
    ]
    if unread_only:
        user_notifs = [n for n in user_notifs if not n.get("read", False)]
    user_notifs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return user_notifs

def mark_notification_read(notif_id: str, user_id: str) -> bool:
    if "notifications" in db and notif_id in db["notifications"]:
        n = db["notifications"][notif_id]
        n["read"] = True
        save_db()
        return True
    return False

def trigger_daily_guidance_dispatch(user_id: str) -> Dict[str, Any]:
    """Simulates the automated cron trigger for daily cosmic guidance"""
    return create_notification(
        user_id=user_id,
        notif_type="daily_guidance",
        title="🌟 Daily Celestial Wisdom",
        message="The stars highlight your solar plexus chakra today. Take decisive action on your top priority!",
        action_url="/readings/tarot"
    )
