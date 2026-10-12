import uuid
import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.database import db, save_db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["Appointments & Reviews"])

class AppointmentRequest(BaseModel):
    practitioner_role: str # "Tarot Reader" or "Spiritual Consultant"
    modality: str
    selected_card: Optional[str] = "General Divination"
    date_time: Optional[str] = None
    requested_date_time: Optional[str] = None
    notes: Optional[str] = ""
    seeker_notes: Optional[str] = ""

class AppointmentStatusUpdate(BaseModel):
    status: str # "Accepted", "Rescheduled", "Completed", "Cancelled"
    notes: Optional[str] = ""
    meeting_link: Optional[str] = None

class ReviewSubmission(BaseModel):
    appointment_id: str
    practitioner_role: str
    practitioner_name: str
    rating: float
    review_text: Optional[str] = ""
    feedback_text: Optional[str] = ""

@router.get("", response_model=List[Dict[str, Any]])
def get_user_appointments(current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("role", "User")
    user_id = current_user.get("id")
    
    results = []
    for apt in db.get("appointments", {}).values():
        if user_role == "User" and apt.get("seeker_id") == user_id:
            results.append(apt)
        elif user_role == "Tarot Reader" and apt.get("practitioner_role") == "Tarot Reader":
            results.append(apt)
        elif user_role == "Spiritual Consultant" and apt.get("practitioner_role") == "Spiritual Consultant":
            results.append(apt)
        elif user_role == "Administrator":
            results.append(apt)
            
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return results

@router.post("/request", response_model=Dict[str, Any])
def request_appointment(req: AppointmentRequest, current_user: dict = Depends(get_current_user)):
    apt_id = f"apt-{uuid.uuid4().hex[:6]}"
    
    practitioner_name = "Madame Seraphina" if req.practitioner_role == "Tarot Reader" else "Zachary Vance"
    practitioner_id = "usr-reader-202" if req.practitioner_role == "Tarot Reader" else "usr-consultant-303"
    
    chosen_datetime = req.date_time or req.requested_date_time or datetime.datetime.now().isoformat()
    chosen_notes = req.notes or req.seeker_notes or f"Requested 1-on-1 {req.modality} session."

    new_apt = {
        "id": apt_id,
        "seeker_id": current_user.get("id"),
        "seeker_name": current_user.get("name", "Wise Seeker"),
        "seeker_email": current_user.get("email"),
        "practitioner_role": req.practitioner_role,
        "practitioner_id": practitioner_id,
        "practitioner_name": practitioner_name,
        "modality": req.modality,
        "selected_card": req.selected_card or "General",
        "date_time": chosen_datetime,
        "requested_date_time": chosen_datetime,
        "status": "Pending",
        "meeting_link": "",
        "notes": chosen_notes,
        "seeker_notes": chosen_notes,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    if "appointments" not in db:
        db["appointments"] = {}
    db["appointments"][apt_id] = new_apt
    
    # Dispatch Real Notification to Practitioner ID & Role
    notif_id = f"notif-{uuid.uuid4().hex[:6]}"
    practitioner_notif = {
        "id": notif_id,
        "user_id": practitioner_id,
        "role": req.practitioner_role,
        "type": "appointment_booking",
        "title": f"📅 New {req.modality} Request",
        "message": f"{current_user.get('name', 'Seeker')} requested a 1-on-1 consultation for {chosen_datetime.replace('T', ' at ')}.",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "read": False,
        "action_url": "/dashboard"
    }
    if "notifications" not in db:
        db["notifications"] = {}
    db["notifications"][notif_id] = practitioner_notif
    
    save_db()
    return new_apt

@router.post("/{apt_id}/status", response_model=Dict[str, Any])
@router.put("/{apt_id}/status", response_model=Dict[str, Any])
def update_appointment_status(apt_id: str, update: AppointmentStatusUpdate, current_user: dict = Depends(get_current_user)):
    apts = db.get("appointments", {})
    if apt_id not in apts:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    apt = apts[apt_id]
    apt["status"] = update.status
    if update.notes:
        apt["notes"] = update.notes
        
    # Auto-generate Google Meet link if status is Accepted
    if update.status == "Accepted":
        if update.meeting_link:
            apt["meeting_link"] = update.meeting_link
        elif not apt.get("meeting_link"):
            meet_slug = f"mystic-{apt['modality'].lower().replace(' ', '-').replace('&', 'and')[:15]}-{uuid.uuid4().hex[:4]}"
            apt["meeting_link"] = f"https://meet.google.com/{meet_slug}"
            
    # Create notification for seeker with Google Meet URL
    notif_id = f"notif-{uuid.uuid4().hex[:6]}"
    status_emoji = "✅" if update.status == "Accepted" else ("🔄" if update.status == "Rescheduled" else "🎉")
    seeker_notif = {
        "id": notif_id,
        "user_id": apt["seeker_id"],
        "type": "appointment_update",
        "title": f"{status_emoji} Session {update.status.upper()}: {apt['modality']}",
        "message": f"Your appointment with {apt['practitioner_name']} for {apt['date_time'].replace('T', ' at ')} is now {update.status}. " + 
                   (f"Join Google Meet: {apt['meeting_link']}" if apt.get("meeting_link") else ""),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "read": False,
        "action_url": apt.get("meeting_link") or "/dashboard"
    }
    if "notifications" not in db:
        db["notifications"] = {}
    db["notifications"][notif_id] = seeker_notif
    
    save_db()
    return apt

@router.get("/reviews", response_model=List[Dict[str, Any]])
def get_reviews(role: Optional[str] = None):
    reviews = list(db.get("reviews", {}).values())
    if role:
        reviews = [r for r in reviews if r.get("practitioner_role") == role]
    reviews.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return reviews

class AppointmentChatMessage(BaseModel):
    sender_name: str
    message: str

@router.get("/{apt_id}/chat", response_model=List[Dict[str, Any]])
def get_appointment_chat(apt_id: str, current_user: dict = Depends(get_current_user)):
    if "appointment_chats" not in db:
        db["appointment_chats"] = {}
    
    chats = db["appointment_chats"].get(apt_id, [])
    if not chats:
        apts = db.get("appointments", {})
        apt = apts.get(apt_id, {})
        prac_name = apt.get("practitioner_name", "Practitioner")
        seeker_name = apt.get("seeker_name", "Seeker")
        
        welcome_msg = {
            "id": "msg-001",
            "sender_name": prac_name,
            "sender_role": apt.get("practitioner_role", "Practitioner"),
            "user_id": apt.get("practitioner_id", "usr-reader-202"),
            "message": f"Welcome to your 1-on-1 session chat, {seeker_name}! I am ready to guide you on your {apt.get('modality', 'consultation')}.",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        chats = [welcome_msg]
        db["appointment_chats"][apt_id] = chats
        save_db()
        
    return chats

@router.post("/{apt_id}/chat", response_model=List[Dict[str, Any]])
def send_appointment_chat(apt_id: str, msg_req: AppointmentChatMessage, current_user: dict = Depends(get_current_user)):
    if "appointment_chats" not in db:
        db["appointment_chats"] = {}
        
    chats = db["appointment_chats"].get(apt_id, [])
    
    apts = db.get("appointments", {})
    apt = apts.get(apt_id, {})
    
    new_msg = {
        "id": f"msg-{uuid.uuid4().hex[:6]}",
        "sender_name": current_user.get("name", msg_req.sender_name),
        "sender_role": current_user.get("role", "User"),
        "user_id": current_user.get("id"),
        "message": msg_req.message,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    chats.append(new_msg)
    db["appointment_chats"][apt_id] = chats
    
    # Send notification to recipient
    recipient_id = apt.get("practitioner_id") if current_user.get("role") == "User" else apt.get("seeker_id")
    if recipient_id:
        notif_id = f"notif-{uuid.uuid4().hex[:6]}"
        notif = {
            "id": notif_id,
            "user_id": recipient_id,
            "type": "chat_message",
            "title": f"💬 New Message from {current_user.get('name', 'User')}",
            "message": msg_req.message[:100],
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "read": False,
            "action_url": "/dashboard"
        }
        if "notifications" not in db:
            db["notifications"] = {}
        db["notifications"][notif_id] = notif
        
    save_db()
    return chats
