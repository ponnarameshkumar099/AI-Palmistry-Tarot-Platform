import math
import datetime
from typing import Dict, Any, List

ARCHETYPES = [
    {
        "title": "The Mystic Visionary",
        "element": "Water",
        "description": "Deeply intuitive and empathetic, gifted with profound spiritual foresight, high artistic imagination, and telepathic sensitivity.",
        "strengths": ["Clairvoyant Intuition", "Empathetic Resonance", "Visionary Creativity", "Compassionate Healing"],
        "growth_edges": ["Boundary Dissolution", "Over-absorption of Atmospheric Energies", "Escapism Tendencies"],
        "behavioral_style": "Reflective, perceptive, soulful listener who navigates life by deep emotional undercurrents.",
        "cognitive_style": "Holistic, associative, pattern-synthesizing, non-linear intuition.",
        "paths": ["Deep Meditation & Sound Healing", "Intuitive Arts & Poetry", "Esoteric Divination Mentorship"]
    },
    {
        "title": "The Grounded Sovereign",
        "element": "Earth",
        "description": "Rooted in integrity, resilience, and tangible manifestation. Master of creating lasting worldly and spiritual security.",
        "strengths": ["Methodical Manifestation", "Unwavering Loyalty", "Practical Wisdom", "Stewardship & Endurance"],
        "growth_edges": ["Inflexibility to Rapid Change", "Material Skepticism", "Overworking & Burnout Risk"],
        "behavioral_style": "Calm, deliberate, highly reliable anchor in turbulent environments.",
        "cognitive_style": "Sequential, empirical, pragmatic structural logic.",
        "paths": ["Sacred Geometry & Architecture", "Somatic Bodywork & Nature Grounding", "Generational Legacy Building"]
    },
    {
        "title": "The Dynamic Catalyst",
        "element": "Fire",
        "description": "Vibrant, inspirational pioneer fueled by fiery passion, courage, and charismatic leadership.",
        "strengths": ["Fearless Initiative", "Charismatic Inspiration", "Rapid Creative Breakthroughs", "Unyielding Vitality"],
        "growth_edges": ["Impatience with Pacing", "Combustion/Short Fuse", "Struggling with Mundane Routine"],
        "behavioral_style": "High energy, spontaneous, commanding presence that sparks transformative momentum.",
        "cognitive_style": "Instantaneous intuitive leaps, visual-spatial strategy, bold risk appraisal.",
        "paths": ["Breathwork & Kundalini Yoga", "Pioneering Creative Ventures", "Public Speaking & Thought Leadership"]
    },
    {
        "title": "The Luminary Sage",
        "element": "Air",
        "description": "Brilliant intellect, master communicator, and philosophical synthesizer bridging diverse realms of wisdom.",
        "strengths": ["Linguistic Articulation", "Objective Discernment", "Philosophical Synthesis", "Innovative Conceptualization"],
        "growth_edges": ["Over-intellectualizing Emotions", "Analysis Paralysis", "Detachment from Body Sensations"],
        "behavioral_style": "Curious, witty, engaging communicator who thrives on ideas and cross-disciplinary dialog.",
        "cognitive_style": "Multi-threaded analytical categorization, dialectical reasoning, abstract theory modeling.",
        "paths": ["Esoteric Philosophy & Writing", "Breath Control (Pranayama)", "Community Facilitation & Teaching"]
    }
]

def generate_personality_profile(hand_element: str = "Water", dominant_tarot_element: str = "Water", user_interests: List[str] = None) -> Dict[str, Any]:
    # Select archetype matching the elemental synergy
    target_elem = hand_element.title() if hand_element else "Water"
    archetype = next((a for a in ARCHETYPES if a["element"].lower() in target_elem.lower()), ARCHETYPES[0])

    # Element balance calculation
    elem_balance = {
        "Water": 35.0 if target_elem == "Water" else 20.0,
        "Fire": 35.0 if target_elem == "Fire" else 20.0,
        "Air": 35.0 if target_elem == "Air" else 20.0,
        "Earth": 35.0 if target_elem == "Earth" else 20.0
    }
    # Normalize to 100%
    tot = sum(elem_balance.values())
    for k in elem_balance:
        elem_balance[k] = round((elem_balance[k] / tot) * 100, 1)

    # Spiritual Big Five
    big_five = {
        "Intuitive Acuity": 94.0 if target_elem in ["Water", "Air"] else 84.0,
        "Emotional Resonance": 92.0 if target_elem in ["Water", "Fire"] else 78.0,
        "Ambition & Drive": 95.0 if target_elem in ["Fire", "Earth"] else 80.0,
        "Grounded Resilience": 93.0 if target_elem in ["Earth", "Water"] else 76.0,
        "Cosmic Openness": 96.0 if target_elem in ["Air", "Water"] else 85.0
    }

    return {
        "archetype_title": archetype["title"],
        "element": archetype["element"],
        "description": archetype["description"],
        "element_balance": elem_balance,
        "spiritual_big_five": big_five,
        "core_strengths": archetype["strengths"],
        "growth_edges_weaknesses": archetype["growth_edges"],
        "behavioral_style": archetype["behavioral_style"],
        "cognitive_style": archetype["cognitive_style"],
        "recommended_growth_paths": archetype["paths"]
    }

def generate_life_trend_forecast(user_age_group: str = "26-35", dominant_element: str = "Water") -> Dict[str, Any]:
    now = datetime.datetime.now(datetime.timezone.utc)
    day_of_year = now.timetuple().tm_yday

    # Cyclical spiritual biorhythms (sine waves based on astronomical day of year)
    biorhythms = {
        "Spiritual Intuition Cycle": round(50 + 45 * math.sin((day_of_year / 365.0) * 2 * math.pi), 1),
        "Emotional Harmonic Cycle": round(50 + 40 * math.cos((day_of_year / 28.0) * 2 * math.pi), 1),
        "Vitality & Physical Energy": round(50 + 42 * math.sin((day_of_year / 23.0) * 2 * math.pi), 1),
        "Material Manifestation Cycle": round(50 + 38 * math.cos((day_of_year / 33.0) * 2 * math.pi), 1)
    }

    forecast_30 = {
        "headline": "Crystalline Awakening & Strategic Clarity",
        "focus": "Heightened intuition regarding personal alliances and key creative projects.",
        "opportunity": "Unexpected synchronicity leading to an inspiring collaborative gateway.",
        "caution": "Avoid scattering mental focus across too many simultaneous tasks."
    }

    forecast_90 = {
        "headline": "Expansion of Vocational Sovereignty",
        "focus": "Tangible reward for steady efforts; recognition of authentic talents.",
        "opportunity": "Major life milestone in career alignment and financial stream stabilization.",
        "caution": "Maintain energetic boundaries against external demands on your sacred time."
    }

    forecast_180 = {
        "headline": "Deep Spiritual Rejuvenation & Relationship Fruition",
        "focus": "Harmonious soul-level connections blossoming; karmic contracts achieving resolution.",
        "opportunity": "Spiritual pilgrimage, life-changing retreat, or profound inner awakening.",
        "caution": "Release lingering nostalgia or obsolete attachments."
    }

    forecast_365 = {
        "headline": "Ascendance into Master Archetype & Grand Culmination",
        "focus": "Culmination of a multi-year karmic cycle; step into teacher/mentor role in your community.",
        "opportunity": "Establishment of long-term sanctuary, abundance empire, and generational peace.",
        "caution": "Remember to ground high cosmic energy into daily humble service."
    }

    opportunities = [
        "Major cosmic window for launching creative or entrepreneurial initiatives in Q2",
        "Spiritual alignment with kindred mentors and lifelong soul companions",
        "Unlocking latent subconscious gifts through consistent meditation and dream journaling",
        "Material elevation following deliberate karmic realignments"
    ]

    challenges = [
        "Periodic over-sensitivity to chaotic social environments (counter with salt baths & grounding)",
        "Temptation to micromanage outcomes rather than trusting divine timing",
        "Imposter syndrome when stepping into greater leadership spheres"
    ]

    return {
        "life_path_overview": f"Your current astrological and palmistry timeline reflects an ascendant trajectory of self-actualization and spiritual grounding.",
        "biorhythm_cycles": biorhythms,
        "forecast_30_days": forecast_30,
        "forecast_90_days": forecast_90,
        "forecast_6_months": forecast_180,
        "forecast_1_year": forecast_365,
        "opportunities": opportunities,
        "challenges": challenges,
        "growth_potential_index": 92.8
    }
