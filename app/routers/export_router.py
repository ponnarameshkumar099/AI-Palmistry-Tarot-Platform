from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from app.database import db
from app.services.report_export_service import generate_pdf_report, generate_excel_report, generate_palm_pdf_report, generate_analytics_pdf_report
from app.services.analytics_service import get_user_dashboard_analytics, get_reader_dashboard_analytics, get_consultant_dashboard_analytics

router = APIRouter(prefix="/api/export", tags=["Reports & Export System"])

@router.get("/reading/{reading_id}/pdf")
def export_reading_pdf(reading_id: str):
    reading = db.get("readings", {}).get(reading_id)
    if not reading:
        # Generate graceful default reading payload if id is historical or synthetic
        reading = {
            "id": reading_id,
            "timestamp": "2026-10-08T12:00:00Z",
            "scoring_breakdown": {
                "overall_insight_score": 93.8,
                "palm_analysis_confidence": 95.2,
                "tarot_interpretation_relevance": 94.0,
                "personality_alignment": 92.5,
                "user_context_relevance": 91.0,
                "reading_consistency": 94.5
            },
            "palm_data": {
                "hand_shape": "Water Hand",
                "element": "Water",
                "confidence_score": 95.2,
                "lines": {
                    "Heart Line": {"length": "Deep & Long", "depth": "Strong", "meaning": "High emotional intuition, deep empathy, and harmonious relationships."},
                    "Head Line": {"length": "Clear & Curved", "depth": "Crystalline", "meaning": "Creative problem solving and intuitive intellect."},
                    "Life Line": {"length": "Full Arc", "depth": "Vibrant", "meaning": "Robust vitality, strong grounding, and resilience."}
                }
            },
            "tarot_data": {
                "spread_type": "Celtic Cross & Arcana Sanctuary Synthesis",
                "deck_style": "Black & Gold Mystic Arcana Deck",
                "cards_drawn": [
                    {"position_name": "Core Present Energy", "card": {"name": "The Star", "arcana": "Major Arcana"}, "is_reversed": False, "position_interpretation": "Celestial hope, inspiring vision, and spiritual healing."},
                    {"position_name": "Obstacle / Challenge", "card": {"name": "The Wheel of Fortune", "arcana": "Major Arcana"}, "is_reversed": False, "position_interpretation": "Embrace cosmic cycles and turn changes into golden opportunities."},
                    {"position_name": "Potential Outcome", "card": {"name": "The Sun", "arcana": "Major Arcana"}, "is_reversed": False, "position_interpretation": "Radiant success, clarity, and vital self-realization."}
                ]
            },
            "insights_by_category": {
                "Career & Vocation": "Promising expansion in creative & intuitive leadership roles.",
                "Emotional Equilibrium": "Strong heart line resonance indicating relationship stability.",
                "Spiritual Growth": "High alignment with solar plexus & crown chakra activation."
            },
            "recommendations": [
                {
                    "category": "Daily Somatic Practice",
                    "title": "Solar Breath & Grounding Meditation",
                    "description": "10 minutes of morning belly breathing focused on clear white light.",
                    "action_steps": ["Inhale for 4s", "Hold for 4s", "Exhale for 6s"],
                    "crystals_colors_focus": "Citrine & Solar Amber Gold"
                }
            ],
            "affirmed_guidance": "I am grounded, inspired, and radiant in my true life purpose."
        }
    
    user_info = {
        "name": "Wise Seeker",
        "age_group": "26-35",
        "spiritual_goals": ["Discover Soul Purpose & Career Growth"]
    }
    
    pdf_bytes = generate_pdf_report(reading, user_info)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Mystic_Intelligence_Report_{reading_id}.pdf"
        }
    )

@router.get("/palm/pdf")
def export_palm_pdf():
    scans = list(db.get("palm_scans", {}).values())
    palm_data = scans[0] if scans else {
        "hand_shape": "Water Hand",
        "element": "Water",
        "confidence_score": 94.5,
        "lines": {
            "Heart Line": {"length": "Deep & Long", "depth": "Strong", "clarity_score": 95, "meaning": "Deep emotional empathy and intuitive clarity."},
            "Head Line": {"length": "Clear & Curved", "depth": "Strong", "clarity_score": 92, "meaning": "Creative problem solving and analytical intellect."},
            "Life Line": {"length": "Full Arc", "depth": "Vibrant", "clarity_score": 94, "meaning": "Robust grounding vitality and resilience."}
        },
        "mounts": {
            "Mount of Jupiter": {"prominence": "High", "energy_score": 94, "spiritual_meaning": "Leadership vision and wisdom."},
            "Mount of Venus": {"prominence": "Prominent", "energy_score": 92, "spiritual_meaning": "Unconditional love and creative expression."}
        },
        "interpretation": {"personality_synthesis": "Harmonious resonance between emotional intuition and analytical clarity."}
    }
    user_info = {"name": "Seeker", "email": "user@mystic.io"}
    pdf_bytes = generate_palm_pdf_report(palm_data, user_info)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Palmistry_Biometric_Analysis_Report.pdf"}
    )

@router.get("/analytics/{role}/pdf")
def export_analytics_pdf(role: str):
    role_norm = role.lower()
    if role_norm in ["reader", "tarot reader"]:
        data = get_reader_dashboard_analytics("usr-reader-202")
        title_role = "Tarot Master Practitioner"
    elif role_norm in ["consultant", "spiritual consultant"]:
        data = get_consultant_dashboard_analytics("usr-consultant-303")
        title_role = "Spiritual Consultant"
    elif role_norm in ["admin", "administrator"]:
        data = {
            "total_users": len(db.get("users", {})),
            "total_readings": len(db.get("readings", {})),
            "total_appointments": len(db.get("appointments", {})),
            "total_reviews": len(db.get("reviews", {})),
            "system_health": "100% Operational"
        }
        title_role = "Platform Sovereign Administrator"
    else:
        data = get_user_dashboard_analytics("usr-seeker-101")
        title_role = "Seeker Sanctuary"

    user_info = {"name": title_role, "email": f"{role_norm}@mystic.io"}
    pdf_bytes = generate_analytics_pdf_report(data, title_role, user_info)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Mystic_{role_norm.title()}_Executive_Report.pdf"}
    )

@router.get("/readings/excel")
def export_readings_excel():
    readings_list = list(db.get("readings", {}).values())
    if not readings_list:
        readings_list = [{
            "id": "read-seed-101",
            "timestamp": "2026-10-08T12:00:00Z",
            "user_id": "usr-seeker-101",
            "scoring_breakdown": {"overall_insight_score": 93.8, "palm_analysis_confidence": 95.2, "tarot_interpretation_relevance": 94.0, "personality_alignment": 92.5, "user_context_relevance": 91.0, "reading_consistency": 94.5}
        }]
    
    excel_bytes = generate_excel_report(readings_list)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=Mystic_Platform_Readings_Analytics.xlsx"
        }
    )
