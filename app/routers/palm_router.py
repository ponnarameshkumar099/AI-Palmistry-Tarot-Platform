import base64
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.models.schemas import PalmAnalysisRequest, PalmAnalysisResult
from app.services.palm_service import analyze_palm_image, PALM_PRESETS
from app.services.auth_service import get_current_user
from app.database import db, save_db

router = APIRouter(prefix="/api/palm", tags=["Palm Analysis Engine"])

@router.post("/analyze")
async def analyze_palm(
    image: Optional[UploadFile] = File(None),
    preset_key: Optional[str] = Form(None),
    hand_hint: Optional[str] = Form("Right (Dominant)"),
    current_user: dict = Depends(get_current_user)
):
    image_bytes = None
    if image:
        image_bytes = await image.read()
    
    result = analyze_palm_image(
        image_bytes=image_bytes,
        preset_key=preset_key or "water_hand",
        hand_hint=hand_hint
    )
    
    # Store in database
    db["palm_scans"][result["id"]] = {
        **result,
        "user_id": current_user["id"]
    }
    save_db()
    return result

@router.post("/analyze-json")
def analyze_palm_json(req: PalmAnalysisRequest, current_user: dict = Depends(get_current_user)):
    image_bytes = None
    if req.image_base64:
        try:
            # Handle data:image/...;base64, prefix if present
            raw_b64 = req.image_base64.split(",")[-1]
            image_bytes = base64.b64decode(raw_b64)
        except Exception as e:
            print(f"Base64 decode warning: {e}")

    result = analyze_palm_image(
        image_bytes=image_bytes,
        preset_key=req.hand_preset or "water_hand",
        hand_hint=req.hand_type_hint or "Right (Dominant)"
    )
    db["palm_scans"][result["id"]] = {
        **result,
        "user_id": current_user["id"]
    }
    save_db()
    return result

@router.get("/presets")
def get_presets():
    """Returns available palm archetype samples for easy testing."""
    return {
        k: {
            "hand_shape": v["hand_shape"],
            "element": v["element"],
            "description": v["description"],
            "base_confidence": v["base_confidence"],
            "lines": v["line_characteristics"]
        } for k, v in PALM_PRESETS.items()
    }

@router.get("/scans")
def get_user_palm_scans(current_user: dict = Depends(get_current_user)):
    scans = [s for s in db["palm_scans"].values() if s.get("user_id") == current_user["id"]]
    scans.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return scans
