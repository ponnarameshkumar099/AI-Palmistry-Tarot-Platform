import random
import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.database import TAROT_DECK

SPREAD_DEFINITIONS = {
    "Single Card Reading": {
        "card_count": 1,
        "positions": [
            {"index": 0, "name": "Daily Focus & Universal Guidance", "prompt": "The primary energetic theme and spiritual compass for this moment."}
        ],
        "description": "Ideal for daily check-ins, morning intentions, and concise clarity on urgent questions."
    },
    "Three Card Reading": {
        "card_count": 3,
        "positions": [
            {"index": 0, "name": "Past & Root Influence", "prompt": "Underlying roots, lessons learned, and foundation shaping the present."},
            {"index": 1, "name": "Present Energy & Crossroads", "prompt": "The active atmosphere, challenges, and decisions right now."},
            {"index": 2, "name": "Future Evolution & Outcome", "prompt": "The emerging trajectory and karmic manifestation."}
        ],
        "description": "Timeless 3-card spread exploring the flow of time (Past / Present / Future) or Mind / Body / Spirit."
    },
    "Relationship Spread": {
        "card_count": 5,
        "positions": [
            {"index": 0, "name": "Your Energy & Inner Stance", "prompt": "What you bring to the relationship and your emotional truth."},
            {"index": 1, "name": "Partner's Energy & Perspective", "prompt": "Their unspoken feelings, worldview, and emotional state."},
            {"index": 2, "name": "Core Dynamic & Bond", "prompt": "The synergistic connection between both souls."},
            {"index": 3, "name": "Hidden Challenge & Friction", "prompt": "Underlying tension, miscommunication, or karmic lesson."},
            {"index": 4, "name": "Highest Outcome & Growth", "prompt": "The harmonious potential when conscious love is nurtured."}
        ],
        "description": "Deep interpersonal reading uncovering soul bonds, emotional blindspots, and mutual harmony."
    },
    "Career Spread": {
        "card_count": 5,
        "positions": [
            {"index": 0, "name": "Current Professional Standing", "prompt": "Where you currently stand in your vocation and mastery."},
            {"index": 1, "name": "Emerging Opportunity & Spark", "prompt": "New avenues for advancement, creative ideas, or partnerships."},
            {"index": 2, "name": "Concealed Obstacle & Shadow", "prompt": "Internal or external hurdles requiring strategic tact."},
            {"index": 3, "name": "Empowered Action & Strategy", "prompt": "The exact mindset and execution step to take next."},
            {"index": 4, "name": "Financial & Career Trajectory", "prompt": "Long-term fruition, abundance, and vocational fulfillment."}
        ],
        "description": "Strategic vocational divination focusing on career breakthroughs, abundance, and leadership."
    },
    "Celtic Cross Spread": {
        "card_count": 10,
        "positions": [
            {"index": 0, "name": "Present: Heart of the Matter", "prompt": "The central energy surrounding your core inquiry."},
            {"index": 1, "name": "The Challenge: Crossing Force", "prompt": "The obstacle or catalytic friction opposing your will."},
            {"index": 2, "name": "The Foundation: Root Cause", "prompt": "Subconscious roots and past experiences anchoring the situation."},
            {"index": 3, "name": "The Recent Past: Fading Energy", "prompt": "Events and influences that are moving out of your aura."},
            {"index": 4, "name": "The Crown: Higher Aspiration", "prompt": "Your conscious goals, ideals, and highest potential vision."},
            {"index": 5, "name": "The Immediate Future: Next Step", "prompt": "What enters your sphere of experience in the days ahead."},
            {"index": 6, "name": "Self-Perception: Inner Power", "prompt": "How you see yourself and your capability to navigate this."},
            {"index": 7, "name": "External Environment: Social Sphere", "prompt": "How others perceive you and external social pressures."},
            {"index": 8, "name": "Hopes & Fears: Subconscious Heart", "prompt": "Your deepest yearnings paired with secret anxieties."},
            {"index": 9, "name": "The Final Outcome: Master Synthesis", "prompt": "The ultimate culmination and holistic resolution."}
        ],
        "description": "The quintessential master 10-card esoteric spread providing comprehensive, multi-dimensional insight."
    },
    "Life Path Spread": {
        "card_count": 7,
        "positions": [
            {"index": 0, "name": "Core Soul Essence", "prompt": "Your innate spiritual blueprint and immortal spiritual identity."},
            {"index": 1, "name": "Spiritual Calling & Life Mission", "prompt": "Why you reincarnated and your sacred vocational duty."},
            {"index": 2, "name": "Subconscious Blockage / Karmic Knot", "prompt": "The primary illusion or inherited fear needing release."},
            {"index": 3, "name": "The Karmic Lesson", "prompt": "The spiritual mastery you are destined to cultivate."},
            {"index": 4, "name": "Guiding Higher Power / Ancestral Ally", "prompt": "The celestial frequency assisting your ascent."},
            {"index": 5, "name": "Material Manifestation", "prompt": "How your soul purpose translates into worldly abundance."},
            {"index": 6, "name": "Ultimate Destiny & Ascended Integration", "prompt": "The crowning spiritual triumph of your lifetime."}
        ],
        "description": "Profound 7-card spiritual journey mapping soul incarnation, karmic release, and destiny fruition."
    }
}

DECK_THEMES = {
    "Classic Rider-Waite": {"theme": "Traditional Symbolism", "accent": "#f59e0b", "border": "#d97706"},
    "Mystic Celestial": {"theme": "Starlit Cosmic", "accent": "#8b5cf6", "border": "#6d28d9"},
    "Arcane Ethereal": {"theme": "Gold & Emerald Hermetic", "accent": "#10b981", "border": "#059669"},
    "Modern Minimalist": {"theme": "Sleek Monochromatic Gold", "accent": "#38bdf8", "border": "#0284c7"}
}

def get_all_cards() -> List[Dict[str, Any]]:
    return TAROT_DECK

def get_spread_definitions() -> Dict[str, Any]:
    return SPREAD_DEFINITIONS

def conduct_tarot_reading(
    spread_type: str = "Three Card Reading",
    deck_style: str = "Classic Rider-Waite",
    question: str = "What cosmic wisdom guides my path?",
    category_focus: str = "General",
    preselected_card_ids: Optional[List[int]] = None,
    preselected_reversals: Optional[List[bool]] = None
) -> Dict[str, Any]:
    """
    Executes an authentic tarot reading with card shuffling simulation,
    spread positioning, reversal dynamics, and deep symbolic interpretation synthesis.
    """
    spread_def = SPREAD_DEFINITIONS.get(spread_type, SPREAD_DEFINITIONS["Three Card Reading"])
    required_count = spread_def["card_count"]
    reading_id = f"tarot-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Full deck copy for shuffling
    shuffled_deck = list(TAROT_DECK)
    random.shuffle(shuffled_deck)

    cards_drawn = []
    major_arcana_count = 0
    elements_counter = {"Fire": 0, "Water": 0, "Air": 0, "Earth": 0, "Spirit": 0}

    for pos_idx, pos_meta in enumerate(spread_def["positions"]):
        if preselected_card_ids and pos_idx < len(preselected_card_ids):
            card_id = preselected_card_ids[pos_idx]
            card_data = next((c for c in TAROT_DECK if c["id"] == card_id), shuffled_deck[pos_idx])
        else:
            card_data = shuffled_deck[pos_idx]

        if preselected_reversals and pos_idx < len(preselected_reversals):
            is_rev = preselected_reversals[pos_idx]
        else:
            # 22% chance of reversal in organic draws
            is_rev = random.random() < 0.22

        if card_data["arcana"] == "Major Arcana":
            major_arcana_count += 1
        elements_counter[card_data.get("element", "Fire")] += 1

        # Position specific interpretation
        meaning_text = card_data["reversed_meaning"] if is_rev else card_data["upright_meaning"]
        keywords_str = ", ".join(card_data["reversed_keywords"] if is_rev else card_data["upright_keywords"])
        orientation_label = "Reversed" if is_rev else "Upright"

        pos_interp = (
            f"In the position of '{pos_meta['name']}', {card_data['name']} ({orientation_label}) reveals: "
            f"{meaning_text} Focus keywords: {keywords_str}."
        )

        cards_drawn.append({
            "position_index": pos_idx,
            "position_name": pos_meta["name"],
            "card": card_data,
            "is_reversed": is_rev,
            "position_interpretation": pos_interp
        })

    # Compute Tarot Interpretation Relevance Score (0 - 100)
    # Higher for coherent elemental spreads, major arcana presence, and focused questions
    base_relevance = 88.0 + (major_arcana_count * 2.0)
    if len(question) > 15:
        base_relevance += 4.5
    tarot_relevance_score = min(99.0, max(82.0, base_relevance))

    # Spread Synthesis Narrative
    dom_elem = max(elements_counter, key=elements_counter.get)
    key_themes = [f"{c['card']['name']} ({'Rev' if c['is_reversed'] else 'Up'})" for c in cards_drawn[:3]]
    key_themes.append(f"Dominant Element: {dom_elem}")

    synthesis_text = (
        f"The {spread_type} reveals a powerful energetic continuum anchored in the {dom_elem} element. "
        f"{major_arcana_count} Major Arcana keys indicate high-stakes karmic turning points. "
        f"Primary catalyst: '{cards_drawn[0]['card']['name']}' sets the foundational frequency, "
        f"culminating in '{cards_drawn[-1]['card']['name']}' for the ultimate integration."
    )

    result = {
        "id": reading_id,
        "timestamp": now_iso,
        "spread_type": spread_type,
        "deck_style": deck_style,
        "question": question,
        "cards_drawn": cards_drawn,
        "relevance_score": round(tarot_relevance_score, 1),
        "spread_synthesis": synthesis_text,
        "key_themes": key_themes
    }
    return result
