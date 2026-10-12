"""
Astrology & Integrated Career Guidance Service
Combines Computer Vision Palmistry metrics (Fate Line, Sun Mount, Head Line, Element)
with Zodiac Signs, Astrological Houses, and User Interests to deliver deep career advice
and complete astrological features.
"""

from typing import Dict, Any, List, Optional
import datetime

# 12 Zodiac Sign Metadata
ZODIAC_DATA = {
    "Aries": {
        "symbol": "♈", "element": "Fire", "modality": "Cardinal", "ruler": "Mars",
        "dates": "Mar 21 - Apr 19", "keywords": ["Pioneering", "Courageous", "Dynamic", "Initiating"],
        "career_archetypes": ["Entrepreneur", "Tech Pioneer", "Executive Leader", "Military Specialist", "Product Manager"],
        "ruling_gemstone": "Red Jasper & Diamond", "ruling_color": "Crimson Red",
        "mantra": "I initiate with sovereign strength and unyielding courage."
    },
    "Taurus": {
        "symbol": "♉", "element": "Earth", "modality": "Fixed", "ruler": "Venus",
        "dates": "Apr 20 - May 20", "keywords": ["Steadfast", "Resourceful", "Pragmatic", "Aesthetic"],
        "career_archetypes": ["Financial Strategist", "Real Estate Developer", "Architect", "Luxury Brand Designer", "Investment Banker"],
        "ruling_gemstone": "Emerald & Malachite", "ruling_color": "Forest Green & Gold",
        "mantra": "I build lasting value with patience and grounded mastery."
    },
    "Gemini": {
        "symbol": "♊", "element": "Air", "modality": "Mutable", "ruler": "Mercury",
        "dates": "May 21 - Jun 20", "keywords": ["Articulate", "Versatile", "Intellectual", "Connected"],
        "career_archetypes": ["AI Specialist", "Journalist / Author", "PR Director", "Software Architect", "Public Speaker"],
        "ruling_gemstone": "Agate & Aquamarine", "ruling_color": "Electric Yellow & Sky Blue",
        "mantra": "My words bridge knowledge and transform ideas into reality."
    },
    "Cancer": {
        "symbol": "♋", "element": "Water", "modality": "Cardinal", "ruler": "Moon",
        "dates": "Jun 21 - Jul 22", "keywords": ["Intuitive", "Nurturing", "Protective", "Empathetic"],
        "career_archetypes": ["Healthcare Director", "Psychologist", "Human Resources VP", "Creative Director", "Education Pioneer"],
        "ruling_gemstone": "Moonstone & Pearl", "ruling_color": "Silver & Seafoam Green",
        "mantra": "I channel deep emotional intelligence into sacred leadership."
    },
    "Leo": {
        "symbol": "♌", "element": "Fire", "modality": "Fixed", "ruler": "Sun",
        "dates": "Jul 23 - Aug 22", "keywords": ["Charismatic", "Visionary", "Generous", "Expressive"],
        "career_archetypes": ["Chief Executive Officer", "Creative Director", "Performing Artist", "Brand Strategist", "Keynote Speaker"],
        "ruling_gemstone": "Citrine & Amber", "ruling_color": "Solar Gold & Bright Amber",
        "mantra": "I shine light upon my vocational calling with magnetic confidence."
    },
    "Virgo": {
        "symbol": "♍", "element": "Earth", "modality": "Mutable", "ruler": "Mercury",
        "dates": "Aug 23 - Sep 22", "keywords": ["Analytical", "Meticulous", "Systematic", "Service-Driven"],
        "career_archetypes": ["Data Scientist", "Quality Assurance Lead", "Biomedical Researcher", "Operations Strategist", "Financial Auditor"],
        "ruling_gemstone": "Sapphire & Peridot", "ruling_color": "Navy Blue & Earthy Green",
        "mantra": "Precision and dedicated service bring divine order to my purpose."
    },
    "Libra": {
        "symbol": "♎", "element": "Air", "modality": "Cardinal", "ruler": "Venus",
        "dates": "Sep 23 - Oct 22", "keywords": ["Harmonious", "Diplomatic", "Strategic", "Refined"],
        "career_archetypes": ["Corporate Lawyer", "UI/UX Lead", "Diplomat", "Partnerships Director", "Art Curator"],
        "ruling_gemstone": "Lapis Lazuli & Rose Quartz", "ruling_color": "Pastel Blue & Rose Gold",
        "mantra": "I harmonize intellect and aesthetics to create equilibrium."
    },
    "Scorpio": {
        "symbol": "♏", "element": "Water", "modality": "Fixed", "ruler": "Pluto / Mars",
        "dates": "Oct 23 - Nov 21", "keywords": ["Transformative", "Investigative", "Resilient", "Strategic"],
        "career_archetypes": ["Cybersecurity Expert", "Forensic Investigator", "Venture Capitalist", "Surgeon / Researcher", "Mystic Consultant"],
        "ruling_gemstone": "Obsidian & Garnet", "ruling_color": "Deep Maroon & Midnight Black",
        "mantra": "I embrace deep transformation to uncover profound truth and power."
    },
    "Sagittarius": {
        "symbol": "♐", "element": "Fire", "modality": "Mutable", "ruler": "Jupiter",
        "dates": "Nov 22 - Dec 21", "keywords": ["Philosophical", "Expansive", "Adventurous", "Optimistic"],
        "career_archetypes": ["Global Business Director", "University Professor", "Publishing Lead", "International Consultant", "Philosopher"],
        "ruling_gemstone": "Turquoise & Topaz", "ruling_color": "Royal Purple & Indigo",
        "mantra": "My horizon is limitless; wisdom illuminates every step I take."
    },
    "Capricorn": {
        "symbol": "♑", "element": "Earth", "modality": "Cardinal", "ruler": "Saturn",
        "dates": "Dec 22 - Jan 19", "keywords": ["Ambitious", "Disciplined", "Authoritative", "Strategic"],
        "career_archetypes": ["Managing Director", "Governance Officer", "Infrastructure Pioneer", "Enterprise Architect", "Senior Advisor"],
        "ruling_gemstone": "Onyx & Tiger Eye", "ruling_color": "Charcoal Grey & Dark Emerald",
        "mantra": "Through discipline and enduring focus, I ascend to sovereign heights."
    },
    "Aquarius": {
        "symbol": "♒", "element": "Air", "modality": "Fixed", "ruler": "Uranus / Saturn",
        "dates": "Jan 20 - Feb 18", "keywords": ["Innovative", "Humanitarian", "Futuristic", "Original"],
        "career_archetypes": ["AI Research Scientist", "Blockchain Architect", "Social Impact Leader", "Systems Engineer", "Futurist"],
        "ruling_gemstone": "Amethyst & Fluorite", "ruling_color": "Cyan & Electric Violet",
        "mantra": "I innovate for the collective elevation of humanity."
    },
    "Pisces": {
        "symbol": "♓", "element": "Water", "modality": "Mutable", "ruler": "Neptune / Jupiter",
        "dates": "Feb 19 - Mar 20", "keywords": ["Intuitive", "Visionary", "Compassionate", "Transcendent"],
        "career_archetypes": ["Sound Therapist", "Creative Visionary", "Holistic Healer", "Filmmaker", "Spiritual Mentor"],
        "ruling_gemstone": "Aquamarine & Fluorite", "ruling_color": "Ocean Blue & Iridescent Violet",
        "mantra": "My imagination flows from infinite universal creation."
    }
}

# 12 Astrological Houses Grid Reference
HOUSES_DATA = [
    {"house": 1, "name": "House of Self (Ascendant)", "sign_ruler": "Aries", "theme": "Identity, Physicality, Persona & First Impressions"},
    {"house": 2, "name": "House of Wealth & Values", "sign_ruler": "Taurus", "theme": "Financial Assets, Income, Personal Resources & Security"},
    {"house": 3, "name": "House of Mind & Communication", "sign_ruler": "Gemini", "theme": "Intellect, Skill Set, Media, Siblings & Local Environment"},
    {"house": 4, "name": "House of Roots & Foundation", "sign_ruler": "Cancer", "theme": "Home, Family, Emotional Core & Ancestral Wisdom"},
    {"house": 5, "name": "House of Creativity & Passion", "sign_ruler": "Leo", "theme": "Self-Expression, Speculative Ventures, Romance & Innovation"},
    {"house": 6, "name": "House of Work & Wellness", "sign_ruler": "Virgo", "theme": "Daily Craft, Service, Physical Health & Routine Discipline"},
    {"house": 7, "name": "House of Partnerships", "sign_ruler": "Libra", "theme": "Strategic Alliances, Contracts, Marriage & Collaborations"},
    {"house": 8, "name": "House of Transformation & Shared Assets", "sign_ruler": "Scorpio", "theme": "Joint Investments, Research, Mystery & Transmutation"},
    {"house": 9, "name": "House of Higher Wisdom & Philosophy", "sign_ruler": "Sagittarius", "theme": "Higher Education, International Endeavors & Mastery"},
    {"house": 10, "name": "House of Midheaven & Career Impact", "sign_ruler": "Capricorn", "theme": "Vocational Reputation, Legacy, Public Achievement & Leadership"},
    {"house": 11, "name": "House of Aspirations & Collective Network", "sign_ruler": "Aquarius", "theme": "Long-Term Goals, Social Impact, Community & Innovations"},
    {"house": 12, "name": "House of Transcendence & Inner Wisdom", "sign_ruler": "Pisces", "theme": "Subconscious Mind, Intuitive Renewal & Spiritual Mastery"}
]

def calculate_integrated_career_guidance(
    palm_data: Optional[Dict[str, Any]],
    zodiac_sign: str,
    interests: List[str],
    career_stage: Optional[str] = "Mid-Career / Growth",
    skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Synthesizes Palmistry CV metrics (Fate Line, Sun Mount, Head Line, Element)
    + Zodiac Sign Astrological Archetype
    + User Interests & Skillset
    to deliver tailored vocational guidance and career roadmaps.
    """
    z_info = ZODIAC_DATA.get(zodiac_sign, ZODIAC_DATA["Aries"])
    
    # Extract Palmistry specifics
    hand_shape = palm_data.get("hand_shape", "Water Hand") if palm_data else "Water Hand"
    element = palm_data.get("element", z_info["element"]) if palm_data else z_info["element"]
    lines = palm_data.get("lines", {}) if palm_data else {}
    mounts = palm_data.get("mounts", {}) if palm_data else {}
    
    fate_line = lines.get("fate_line", {"depth": "Deep & Direct", "confidence": 92.0})
    head_line = lines.get("head_line", {"trajectory": "Slight Curve", "clarity": "High"})
    sun_mount = mounts.get("Sun", {"elevation": "High", "prominence": "Prominent"})
    jupiter_mount = mounts.get("Jupiter", {"elevation": "High", "prominence": "Dominant"})
    
    # Process user interests into domain focus
    user_interests_str = ", ".join(interests) if interests else "Technology, Innovation & Strategy"
    
    # Map combined archetype
    element_synergy = f"{element} Element (Palm) + {z_info['element']} Element ({zodiac_sign})"
    
    # Synthesize Top Career Recommendations
    recommended_fields = []
    interests_lower = [i.lower() for i in interests] if interests else []
    
    if any(kw in i for i in interests_lower for kw in ["technology", "software", "ai", "data", "engineering", "coding"]):
        recommended_fields.append({
            "title": "AI & Enterprise Tech Strategy",
            "suitability_score": 96.5,
            "rationale": f"Your {head_line.get('trajectory', 'Curved')} Head Line and Mercury/Uranus resonance make you exceptionally skilled at architecting complex technological systems."
        })
    if any(kw in i for i in interests_lower for kw in ["management", "leadership", "business", "entrepreneurship", "finance"]):
        recommended_fields.append({
            "title": "Executive Leadership & Strategic Growth",
            "suitability_score": 94.8,
            "rationale": f"Jupiter Mount dominance in your palm paired with {zodiac_sign}'s ruling planet {z_info['ruler']} grants strong executive authority and negotiation acumen."
        })
    if any(kw in i for i in interests_lower for kw in ["creative", "design", "art", "media", "writing"]):
        recommended_fields.append({
            "title": "Creative Direction & Brand Vision",
            "suitability_score": 93.2,
            "rationale": f"High Sun Mount elevation combined with {z_info['symbol']} aesthetic instincts unlocks high-impact creative storytelling."
        })
    if any(kw in i for i in interests_lower for kw in ["healing", "wellness", "psychology", "mysticism", "coaching"]):
        recommended_fields.append({
            "title": "Holistic Consultancy & Executive Coaching",
            "suitability_score": 95.0,
            "rationale": f"Water/Air element alignment endows you with deep empathetic calibration and intuitive wisdom for mentoring others."
        })

    if len(recommended_fields) < 3:
        recommended_fields.append({
            "title": f"Pioneering {zodiac_sign} Vocational Path",
            "suitability_score": 92.4,
            "rationale": f"Allying {z_info['symbol']} archetype strengths with your palm's Fate Line trajectory points directly to leadership in your chosen focus area."
        })

    # Core Strengths & Vocational Advantages
    core_strengths = [
        f"Prominent {jupiter_mount.get('prominence', 'High')} Jupiter Mount granting natural authority and mentorship capacity.",
        f"{zodiac_sign} ({z_info['element']}) ruling drive under {z_info['ruler']} facilitating quick strategic execution.",
        f"Clear Fate Line trajectory ('{fate_line.get('depth', 'Deep')}') supporting sustained long-term vocational momentum.",
        f"Expressed alignment with interests in {user_interests_str}."
    ]

    # Milestones & Timing Forecast
    milestones = {
        "next_30_days": f"Focus on refining your primary portfolio/proposition around {interests[0] if interests else 'Strategic Leadership'}. A key networking opportunity will manifest.",
        "next_90_days": f"Promotions, pitch approvals, or strategic career pivots will peak under your ruling planet {z_info['ruler']}'s favorable transit.",
        "1_year_horizon": f"Establishment of sovereign thought leadership or a high-visibility project launch yielding financial and reputational rewards."
    }

    # Remedial Practices & Rituals
    remedial_guidance = {
        "suggested_gemstone": z_info["ruling_gemstone"],
        "power_color": z_info["ruling_color"],
        "leadership_ritual": f"Spend 10 minutes at sunrise visualizing your Midheaven goals while holding a {z_info['ruling_gemstone']}. Recite: '{z_info['mantra']}'",
        "potential_challenge": f"Beware of scattered energetic focus when juggling multiple creative/technical leads. Harness Saturnian discipline to complete flagship initiatives."
    }

    return {
        "zodiac_sign": zodiac_sign,
        "zodiac_details": z_info,
        "palm_hand_shape": hand_shape,
        "elemental_synergy": element_synergy,
        "career_stage": career_stage,
        "user_interests": interests,
        "recommended_careers": recommended_fields,
        "core_strengths": core_strengths,
        "milestones": milestones,
        "remedial_guidance": remedial_guidance,
        "overall_vocational_alignment_score": 94.6
    }

def generate_natal_chart_details(
    dob: str,
    time_of_birth: Optional[str] = "12:00",
    location: Optional[str] = "Global / Unspecified"
) -> Dict[str, Any]:
    """
    Generates a full Natal Birth Chart & 12 Houses map based on birth date, time, and location.
    """
    try:
        dt = datetime.datetime.strptime(dob, "%Y-%m-%d")
        month, day = dt.month, dt.day
    except Exception:
        dt = datetime.datetime.now()
        month, day = dt.month, dt.day

    # Determine Sun Sign
    zodiac_sign = "Aries"
    if (month == 3 and day >= 21) or (month == 4 and day <= 19): zodiac_sign = "Aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20): zodiac_sign = "Taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20): zodiac_sign = "Gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22): zodiac_sign = "Cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22): zodiac_sign = "Leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22): zodiac_sign = "Virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22): zodiac_sign = "Libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21): zodiac_sign = "Scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21): zodiac_sign = "Sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19): zodiac_sign = "Capricorn"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18): zodiac_sign = "Aquarius"
    else: zodiac_sign = "Pisces"

    z_info = ZODIAC_DATA[zodiac_sign]
    
    # Synthesize Moon Sign and Ascendant based on birth hour offsets
    hour = 12
    if time_of_birth and ":" in time_of_birth:
        try: hour = int(time_of_birth.split(":")[0])
        except ValueError: hour = 12
        
    signs_list = list(ZODIAC_DATA.keys())
    ascendant_idx = (signs_list.index(zodiac_sign) + (hour // 2)) % 12
    moon_idx = (signs_list.index(zodiac_sign) + 4) % 12
    
    ascendant_sign = signs_list[ascendant_idx]
    moon_sign = signs_list[moon_idx]
    
    # 12 House Placements Mapping
    house_placements = []
    for i, house_info in enumerate(HOUSES_DATA):
        house_sign = signs_list[(ascendant_idx + i) % 12]
        house_placements.append({
            "house": house_info["house"],
            "name": house_info["name"],
            "occupying_sign": house_sign,
            "theme": house_info["theme"],
            "planetary_ruler": ZODIAC_DATA[house_sign]["ruler"]
        })

    return {
        "dob": dob,
        "time_of_birth": time_of_birth,
        "location": location,
        "sun_sign": zodiac_sign,
        "sun_sign_details": z_info,
        "moon_sign": moon_sign,
        "moon_sign_details": ZODIAC_DATA[moon_sign],
        "ascendant_sign": ascendant_sign,
        "ascendant_details": ZODIAC_DATA[ascendant_sign],
        "dominant_element": z_info["element"],
        "ruling_planet": z_info["ruler"],
        "modality": z_info["modality"],
        "house_placements": house_placements
    }

def calculate_zodiac_compatibility(sign1: str, sign2: str) -> Dict[str, Any]:
    """
    Calculates compatibility and energetic synergy between two Zodiac signs.
    """
    s1 = ZODIAC_DATA.get(sign1, ZODIAC_DATA["Aries"])
    s2 = ZODIAC_DATA.get(sign2, ZODIAC_DATA["Leo"])
    
    elem1, elem2 = s1["element"], s2["element"]
    
    # Elemental Synergy Matrix
    synergy_score = 85.0
    if elem1 == elem2:
        synergy_score = 96.0
        desc = "Harmonious resonance! Sharing the same element fosters instant mutual understanding and deep natural alignment."
    elif (elem1 in ["Fire", "Air"] and elem2 in ["Fire", "Air"]) or (elem1 in ["Earth", "Water"] and elem2 in ["Earth", "Water"]):
        synergy_score = 92.5
        desc = f"Dynamic Synergy! {elem1} and {elem2} energize and inspire each other continuously."
    else:
        synergy_score = 82.0
        desc = f"Complementary Alchemy! {elem1} and {elem2} balance each other's perspectives with grounding and growth."

    return {
        "sign_1": sign1,
        "sign_2": sign2,
        "overall_compatibility_score": synergy_score,
        "love_bond_score": round(synergy_score + 1.5, 1),
        "career_collaboration_score": round(synergy_score - 1.0, 1),
        "communication_score": round(synergy_score + 0.5, 1),
        "elemental_synergy": desc,
        "strengths": f"{s1['symbol']} ({s1['ruler']}) brings {s1['keywords'][0]} energy, while {s2['symbol']} ({s2['ruler']}) offers {s2['keywords'][0]} clarity.",
        "advice": f"Celebrate your shared strengths in strategic decisions while honoring each other's emotional rhythms."
    }

def get_zodiac_horoscope_transits(zodiac_sign: str) -> Dict[str, Any]:
    """
    Returns complete daily horoscope, planetary transit guidance, and gemstone remedies.
    """
    z_info = ZODIAC_DATA.get(zodiac_sign, ZODIAC_DATA["Aries"])
    
    return {
        "zodiac_sign": zodiac_sign,
        "symbol": z_info["symbol"],
        "element": z_info["element"],
        "ruling_planet": z_info["ruler"],
        "dates": z_info["dates"],
        "daily_transit_overview": f"Your ruling planet {z_info['ruler']} forms a powerful trine today, awakening high clarity and vocational drive in your 10th House.",
        "career_forecast": f"Excellent momentum for negotiating projects, declaring long-term goals, or launching creative endeavors in your team.",
        "love_forecast": f"Open communication brings warmth and energetic harmony. Be receptive to sudden invitations or soulful conversations.",
        "wealth_forecast": f"Favorable for long-term investments and refining your asset portfolio. Avoid impulsive retail purchases.",
        "lucky_numbers": [7, 14, 21, 88],
        "ruling_gemstone": z_info["ruling_gemstone"],
        "power_color": z_info["ruling_color"],
        "daily_affirmation": z_info["mantra"]
    }

def get_12_houses_guide() -> List[Dict[str, Any]]:
    """Returns the master reference guide for all 12 astrological houses."""
    return HOUSES_DATA
