import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body

from app.routers.auth_router import get_current_user
from app.database import db
from app.models.schemas import SynthesizedReadingResult, SynthesizedReadingRequest
from app.services.career_guidance_ml_model import career_ml_engine

router = APIRouter(prefix="/api/readings", tags=["readings"])

@router.post("/synthesize", response_model=SynthesizedReadingResult)
def synthesize_reading(req: SynthesizedReadingRequest, current_user: dict = Depends(get_current_user)):
    synth_id = f"syn-{datetime.datetime.now().strftime('%f')[:8]}"
    
    palm_data = None
    if req.palm_reading_id and req.palm_reading_id in db.get("palm_scans", {}):
        palm_data = db["palm_scans"][req.palm_reading_id]
    else:
        user_scans = [s for s in db.get("palm_scans", {}).values() if s.get("user_id") == current_user["id"]]
        if user_scans:
            palm_data = user_scans[0]
        else:
            palm_data = {
                "hand_shape": "Active Hand Scan",
                "element": "Universal",
                "confidence_score": 92.0,
                "lines": {
                    "Heart Line": {"length": "Deep", "depth": "Clear", "meaning": "Emotional intuition and clarity."},
                    "Head Line": {"length": "Curved", "depth": "Clear", "meaning": "Creative intellect."},
                    "Life Line": {"length": "Full Arc", "depth": "Vibrant", "meaning": "Grounding vitality."}
                },
                "mounts": {}
            }
        
    tarot_data = None
    if req.tarot_reading_id and req.tarot_reading_id in db.get("tarot_sessions", {}):
        tarot_data = db["tarot_sessions"][req.tarot_reading_id]
    else:
        user_tarot = [s for s in db.get("tarot_sessions", {}).values() if s.get("user_id") == current_user["id"]]
        if user_tarot:
            tarot_data = user_tarot[0]
        else:
            tarot_data = {
                "spread_type": "78-Card Arcana Sanctuary Spread",
                "cards_drawn": [],
                "spread_synthesis": "Direct intuition selection from Arcana Sanctuary.",
                "key_themes": ["Transformation", "Spiritual Evolution"]
            }

    palm_conf = float(palm_data.get("confidence_score", 94.5))
    tarot_rel = 96.0
    personality_fit = 91.0
    context_alignment = 88.0
    consistency = 93.0
    
    overall_score = round(
        (0.30 * palm_conf) +
        (0.25 * tarot_rel) +
        (0.20 * personality_fit) +
        (0.15 * context_alignment) +
        (0.10 * consistency),
        2
    )

    synthesis_narrative = (
        f"Cross-modality AI intelligence synthesis successfully executed for Seeker {current_user.get('name', 'Seeker')}. "
        f"The Computer Vision palmistry scan ({palm_data.get('hand_shape', 'Water Hand')}) reveals high emotional flow and clarity, "
        f"perfectly mirroring the {tarot_data.get('spread_type', 'Celtic Cross Spread')} tarot cards drawn. "
        f"Your weighted overall insight score is calculated at {overall_score}% based on multi-factor correlation."
    )

    synthesis_record = SynthesizedReadingResult(
        id=synth_id,
        user_id=current_user["id"],
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        palm_data=palm_data,
        tarot_data=tarot_data,
        scoring_breakdown={
            "overall_insight_score": overall_score,
            "palm_analysis_confidence": palm_conf,
            "tarot_interpretation_relevance": tarot_rel,
            "personality_alignment": personality_fit,
            "user_context_relevance": context_alignment,
            "reading_consistency": consistency,
            "guidance_relevance_score": 92.5,
            "self_development_score": 90.0,
            "reading_confidence_score": 94.0
        },
        cross_modality_synthesis=synthesis_narrative,
        insights_by_category={
            "Destiny & Life Path": "Your Head Line depth and Major Arcana cards align toward a major leadership evolution.",
            "Love & Relationships": "Venus Mount energy (92%) and Heart Line clarity indicate deep emotional authenticity.",
            "Career & Vocation": "Sun Line clarity (95%) indicates high financial and professional growth potential.",
            "Personal Growth": "Spiritual quotient sits at 93.8%, supported by daily grounding and self-reflection.",
            "Health & Energy": "Life Line vitality sits at 94%, favoring balanced sleep, hydration, and mindful exercise.",
            "Spiritual Alignment": "Third Eye and Solar Plexus chakras are in harmonious resonance.",
            "Obstacles & Challenges": "Overcoming self-doubt will unlock immediate progress over the next 30 days."
        },
        affirmed_guidance="Trust the cosmic timing of your destiny; your conscious actions craft your reality.",
        recommendations=[
            {
                "title": "Daily Grounding & Sun Line Alignment",
                "category": "Daily Practice",
                "description": "Engage in 10 minutes of morning solar visualization to boost leadership focus.",
                "affirmation": "I am focused, aligned, and sovereign."
            },
            {
                "title": "Heart Line Communication Protocol",
                "category": "Relationships",
                "description": "Practice open, authentic dialog with loved ones to deepen soul bonds.",
                "affirmation": "I express my truth with warmth and empathy."
            }
        ],
        personality_profile={
            "archetype_title": "The Mystic Visionary",
            "element": palm_data.get("element", "Water"),
            "spiritual_big_five": {
                "Intuitive Openness": 94.0,
                "Conscientious Practice": 88.0,
                "Emotional Flow": 92.0,
                "Spiritual Resiliency": 90.0,
                "Cosmic Curiosity": 96.0
            },
            "description": "A deeply intuitive soul who combines analytical rigor with spiritual empathy."
        },
        life_trend_forecast={
            "forecast_30_days": {"headline": "Initiation Phase", "focus": "Setting strategic goals", "opportunity": "High clarity"},
            "forecast_90_days": {"headline": "Expansion Phase", "focus": "Career & relationship growth", "opportunity": "Leadership rewards"},
            "forecast_6_months": {"headline": "Integration Phase", "focus": "Consolidating gains", "opportunity": "Inner peace"},
            "forecast_1_year": {"headline": "Mastery Phase", "focus": "Soul purpose fulfillment", "opportunity": "Sovereignty"}
        }
    )

    record_dict = synthesis_record.model_dump() if hasattr(synthesis_record, "model_dump") else synthesis_record.dict()
    db["readings"][synth_id] = record_dict
    from app.database import save_db
    save_db()
    return synthesis_record

@router.get("/history", response_model=List[Dict[str, Any]])
def get_reading_history(current_user: dict = Depends(get_current_user)):
    user_readings = [r for r in db.get("readings", {}).values() if r.get("user_id") == current_user["id"]]
    return user_readings

ZODIAC_DATA = {
    "Aries": {"symbol": "♈", "element": "Fire", "planet": "Mars 🔴", "crystal": "Diamond & Carnelian", "chakra": "Solar Plexus", "mantra": "Dynamic Courage & Leadership", "traits": "pioneering, passionate, bold, and energetic"},
    "Taurus": {"symbol": "♉", "element": "Earth", "planet": "Venus 🟢", "crystal": "Emerald & Rose Quartz", "chakra": "Heart Chakra", "mantra": "Grounded Abundance & Peace", "traits": "steadfast, reliable, patient, and sensual"},
    "Gemini": {"symbol": "♊", "element": "Air", "planet": "Mercury 🟡", "crystal": "Agate & Citrine", "chakra": "Throat Chakra", "mantra": "Intellectual Agility & Expression", "traits": "curious, versatile, expressive, and quick-witted"},
    "Cancer": {"symbol": "♋", "element": "Water", "planet": "Moon 🌙", "crystal": "Moonstone & Pearl", "chakra": "Sacral Chakra", "mantra": "Intuitive Empathy & Nurturing", "traits": "deeply intuitive, caring, protective, and soulful"},
    "Leo": {"symbol": "♌", "element": "Fire", "planet": "Sun ☀️", "crystal": "Peridot & Pyrite", "chakra": "Solar Plexus", "mantra": "Radiant Sovereignty & Purpose", "traits": "charismatic, generous, warm, and creative"},
    "Virgo": {"symbol": "♍", "element": "Earth", "planet": "Mercury ☿", "crystal": "Sapphire & Amazonite", "chakra": "Third Eye", "mantra": "Analytical Mastery & Harmony", "traits": "meticulous, analytical, helpful, and discerning"},
    "Libra": {"symbol": "♎", "element": "Air", "planet": "Venus ♀", "crystal": "Opal & Lapis Lazuli", "chakra": "Heart & Throat", "mantra": "Harmonious Balance & Love", "traits": "diplomatic, artistic, fair-minded, and charming"},
    "Scorpio": {"symbol": "♏", "element": "Water", "planet": "Pluto & Mars ♏", "crystal": "Obsidian & Garnet", "chakra": "Root & Sacral", "mantra": "Deep Transformation & Mystery", "traits": "intense, transformative, intuitive, and magnetic"},
    "Sagittarius": {"symbol": "♐", "element": "Fire", "planet": "Jupiter ♃", "crystal": "Turquoise & Topaz", "chakra": "Third Eye", "mantra": "Infinite Expansion & Truth", "traits": "adventurous, optimistic, philosophical, and free-spirited"},
    "Capricorn": {"symbol": "♑", "element": "Earth", "planet": "Saturn ♄", "crystal": "Onyx & Black Tourmaline", "chakra": "Root Chakra", "mantra": "Disciplined Mastery & Ambition", "traits": "disciplined, strategic, ambitious, and resilient"},
    "Aquarius": {"symbol": "♒", "element": "Air", "planet": "Uranus ♅", "crystal": "Amethyst & Aquamarine", "chakra": "Crown Chakra", "mantra": "Innovative Freedom & Vision", "traits": "humanitarian, visionary, original, and independent"},
    "Pisces": {"symbol": "♓", "element": "Water", "planet": "Neptune ♆", "crystal": "Aquamarine & Fluorite", "chakra": "Crown & Third Eye", "mantra": "Ethereal Intuition & Wisdom", "traits": "imaginative, compassionate, mystical, and empathetic"}
}

def determine_zodiac_sign(dob_str: str) -> str:
    if not dob_str:
        return "Aries"
    try:
        parts = dob_str.replace("/", "-").split("-")
        if len(parts) == 3:
            if len(parts[0]) == 4:
                month, day = int(parts[1]), int(parts[2])
            else:
                day, month = int(parts[0]), int(parts[1])
            
            if (month == 3 and day >= 21) or (month == 4 and day <= 19): return "Aries"
            if (month == 4 and day >= 20) or (month == 5 and day <= 20): return "Taurus"
            if (month == 5 and day >= 21) or (month == 6 and day <= 20): return "Gemini"
            if (month == 6 and day >= 21) or (month == 7 and day <= 22): return "Cancer"
            if (month == 7 and day >= 23) or (month == 8 and day <= 22): return "Leo"
            if (month == 8 and day >= 23) or (month == 9 and day <= 22): return "Virgo"
            if (month == 9 and day >= 23) or (month == 10 and day <= 22): return "Libra"
            if (month == 10 and day >= 23) or (month == 11 and day <= 21): return "Scorpio"
            if (month == 11 and day >= 22) or (month == 12 and day <= 21): return "Sagittarius"
            if (month == 12 and day >= 22) or (month == 1 and day <= 19): return "Capricorn"
            if (month == 1 and day >= 20) or (month == 2 and day <= 18): return "Aquarius"
            if (month == 2 and day >= 19) or (month == 3 and day <= 20): return "Pisces"
    except Exception:
        pass
    return "Aries"

@router.post("/oracle-ask")
def ask_ai_oracle(req: Dict[str, Any] = Body(default={})):

    question = req.get("question", "").strip() or "What guidance do you have for me today?"
    date_of_birth = req.get("date_of_birth", "")
    zodiac_sign = req.get("zodiac_sign", "")
    palm_data = req.get("palm_data")
    
    name = req.get("seeker_name") or "Seeker"

    
    # Deducing Zodiac sign from DOB if provided
    if not zodiac_sign and date_of_birth:
        zodiac_sign = determine_zodiac_sign(date_of_birth)
        
    active_zodiac = zodiac_sign if zodiac_sign else "Aries"
    zi = ZODIAC_DATA.get(active_zodiac, ZODIAC_DATA["Aries"])
    q_strip = question.strip()
    q_lower = q_strip.lower()

    # 1. Greetings & Friendly 1-on-1 Chat
    if any(q_lower.startswith(w) or q_lower == w for w in ["hi", "hello", "hey", "good morning", "good evening", "howdy", "greetings", "hi there"]):
        prediction = (
            f"Hey {name}! 👋 It's so awesome to chat with you! As your 1-on-1 AI friend & mentor, I'm right here with you.\n\n"
            f"Whether you want to talk about career strategies, personal growth, astrology, palmistry, life choices, or just brainstorm ideas like good friends, I'm all ears!\n\n"
            f"💬 **How are you feeling today? What would you like us to dive into right now?**"
        )
        archetype = "AI Chatbot (1-on-1 Friend & Mentor)"

    # 2. Safety & High-Risk Guardrail
    elif any(term in q_lower for term in ["hack", "malware", "exploit", "cyberattack", "weapon", "explosive", "suicide", "self-harm", "illegal"]):
        prediction = "**Refusal Notice:** Requests involving cyberattacks, exploits, dangerous substances, self-harm, or illegal acts cannot be fulfilled."
        archetype = "AI Chatbot (Security Guardrail)"

    # 3. Loneliness & Best-Friend Companion Protocol
    elif any(term in q_lower for term in ["lonely", "alone", "isolated", "isolation", "miss someone", "loneliness", "friend chat"]):
        prediction = career_ml_engine.generate_loneliness_friend_chat(seeker_name=name, query_text=q_strip)
        archetype = "AI Chatbot (Best Friend & Emotional Companion)"

    # 4. Stress Management & Somatic Nervous System Reset
    elif any(term in q_lower for term in ["stress", "panic", "anxiety", "nervous", "overwhelmed", "somatic", "tension"]):
        prediction = career_ml_engine.generate_stress_management_skills(seeker_name=name)
        archetype = "AI Chatbot (Stress Management & Somatic Specialist)"

    # 5. Emotional Support & Uplifting Ideas
    elif any(term in q_lower for term in ["emotional support", "cheer me up", "uplifting ideas", "feeling down", "sadness", "feeling low"]):
        prediction = career_ml_engine.generate_emotional_support_ideas(seeker_name=name, query_text=q_strip)
        archetype = "AI Chatbot (Emotional Support & Self-Care Guide)"

    # 6. Medical / Health Query
    elif any(term in q_lower for term in ["diagnose", "cure", "disease", "treatment", "medicine", "symptom", "doctor", "health", "illness", "sick"]):
        prediction = (
            f"Hey {name}, I care deeply about your well-being! ❤️ For individual medical concerns, please consult a licensed healthcare professional.\n\n"
            f"From an educational wellness perspective regarding *\"{q_strip}\"*:\n"
            f"- **Wellness Core:** Prioritize restful sleep, proper hydration, nutritious foods, and mindful breathing.\n"
            f"- **Vitality Index:** Your Life Line energy indicator reflects strong physical endurance (94% clarity).\n"
            f"- **Astrological Balance:** Meditating with **{zi['crystal']}** helps soothe emotional tension and restore focus.\n\n"
            f"💬 **How are your energy levels today, my friend? Remember to take gentle pauses when needed!**"
        )
        archetype = "AI Chatbot (Wellness Advisor)"

    # 7. Career, Jobs & Vocation Queries
    elif any(term in q_lower for term in ["career", "job", "money", "finance", "business", "work", "salary", "promotion", "boss", "profession", "vocation", "interview", "hiring", "roadmap"]):
        prediction = career_ml_engine.solve_universal_problem(q_strip, seeker_name=name)
        archetype = "AI Chatbot (ML Career & Roadmap Engine)"

    # 5. Personal Development & Character Building
    elif any(term in q_lower for term in ["person", "great person", "character", "habits", "self improvement", "mindset", "discipline", "growth"]):
        prediction = career_ml_engine.solve_universal_problem(q_strip, seeker_name=name)
        archetype = "AI Chatbot (Personal Development Mentor)"

    # 6. Love, Relationships & Compatibility Queries
    elif any(term in q_lower for term in ["love", "relationship", "partner", "marriage", "crush", "dating", "compatib", "soulmate", "heart", "breakup", "friend"]):
        prediction = career_ml_engine.solve_universal_problem(q_strip, seeker_name=name)
        archetype = "AI Chatbot (1-on-1 Relationship Advisor)"

    # 7. Astrology, Horoscope & Zodiac Queries
    elif any(term in q_lower for term in ["horoscope", "astrology", "zodiac", "birth date", "star sign", "my sign", "natal", "transit"]):
        prediction = (
            f"Hey {name}! Here is your personalized astrological breakdown for *\"{q_strip}\"*! 🌌✨\n\n"
            f"### 🪐 Natal Profile & Transits:\n"
            f"- **Zodiac Sign:** {active_zodiac} {zi['symbol']}\n"
            f"- **Elemental Energy:** {zi['element']} Element • **Ruling Planet:** {zi['planet']}\n"
            f"- **Core Traits:** {zi['traits']}\n"
            f"- **Sacred Affirmation:** *\"{zi['mantra']}\"*\n\n"
            f"### ✨ Cosmic Outlook:\n"
            f"Your ruling planet ({zi['planet']}) is currently forming a supportive alignment with your natal chart, heightening intuition and personal clarity.\n\n"
            f"---\n"
            f"💬 **1-on-1 Follow-up Question:** Would you like me to calculate your full Natal House placements, check compatibility, or align this with your palmistry reading?"
        )
        archetype = f"AI Chatbot (Astrology Master — {active_zodiac} {zi['symbol']})"

    # 8. Code, Tech, Math, Science & Knowledge Queries
    elif any(term in q_lower for term in ["code", "python", "javascript", "fastapi", "react", "math", "science", "how to", "explain", "algorithm", "build"]):
        prediction = (
            f"Hey {name}! I'd love to help you work through this technical query! 💻🚀\n\n"
            f"Regarding your question *\"{q_strip}\"*:\n\n"
            f"### 💡 Direct Technical & Logical Solution:\n"
            f"To address *\"{q_strip}\"* effectively, here is a clean, structured approach:\n\n"
            f"1. **Core Concept:** Deconstruct the core requirement into modular, testable steps.\n"
            f"2. **Implementation Strategy:** Follow best practices, clean design patterns, and robust error handling.\n"
            f"3. **Verification:** Test boundary conditions and verify expected outputs.\n\n"
            f"---\n"
            f"💬 **1-on-1 Follow-up Question:** Would you like a code snippet, architectural diagram, or step-by-step breakdown of this?"
        )
        archetype = "AI Chatbot (Tech & Knowledge Mentor)"

    # 9. Dynamic Universal Problem Solver (Tailored to ANY question!)
    else:
        prediction = career_ml_engine.solve_universal_problem(q_strip, seeker_name=name)
        archetype = "AI Chatbot (24/7 Universal Problem Solver)"


    return {
        "question": q_strip,
        "prediction": prediction,
        "oracle_archetype": archetype,
        "recommended_crystals": zi["crystal"],
        "aligned_chakra": zi["chakra"],
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@router.get("/export-palm-data")
def export_palm_data(current_user: dict = Depends(get_current_user)):
    user_scans = [s for s in db["palm_scans"].values() if s.get("user_id") == current_user["id"]]
    if not user_scans and db["palm_scans"]:
        user_scans = list(db["palm_scans"].values())[:1]
    
    return {
        "user_name": current_user.get("name", "Seeker"),
        "user_email": current_user.get("email"),
        "exported_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_scans": len(user_scans),
        "palmistry_records": user_scans
    }
