from typing import Dict, Any, List, Optional
from app.services.scoring_service import calculate_spiritual_guidance_score
from app.services.personality_trend_service import generate_personality_profile, generate_life_trend_forecast

def synthesize_multimodal_reading(
    palm_data: Optional[Dict[str, Any]],
    tarot_data: Optional[Dict[str, Any]],
    user_profile: Dict[str, Any],
    seeker_notes: Optional[str] = None,
    life_focus: Optional[str] = "Personal Growth & Destiny"
) -> Dict[str, Any]:
    """
    AI & Symbolic Knowledge Engine:
    Synthesizes palmistry features + tarot spread + user goals into
    comprehensive cross-modality insights across 7 vital life categories.
    """
    hand_shape = palm_data.get("hand_shape", "Water Hand") if palm_data else "Water Hand"
    hand_elem = palm_data.get("element", "Water") if palm_data else "Water"
    palm_conf = palm_data.get("confidence_score", 92.0) if palm_data else 90.0

    cards = tarot_data.get("cards_drawn", []) if tarot_data else []
    spread_type = tarot_data.get("spread_type", "Three Card Reading") if tarot_data else "Three Card Reading"
    tarot_rel = tarot_data.get("relevance_score", 94.0) if tarot_data else 91.0
    key_cards = [c["card"]["name"] for c in cards[:3]] if cards else ["The High Priestess", "The Star", "Ace of Wands"]

    # Compute personality profile and trends
    personality = generate_personality_profile(hand_elem, user_interests=user_profile.get("interests", []))
    trends = generate_life_trend_forecast(user_profile.get("age_group", "26-35"), hand_elem)

    # Compute exact weighted guidance score
    scoring = calculate_spiritual_guidance_score(
        palm_confidence=palm_conf,
        tarot_relevance=tarot_rel,
        personality_alignment=89.5,
        user_context_relevance=92.0,
        reading_consistency=90.5
    )

    # Cross-modality narrative synthesis
    card_names_str = ", ".join(key_cards)
    synthesis_narrative = (
        f"Cosmic Synthesis of the {hand_shape} ({hand_elem} Element) aligned with the {spread_type} ({card_names_str}). "
        f"Your palm's prominent mounts and deep lifeline contours validate high vitality and visionary receptivity. "
        f"The tarot spread acts as a mirror to this innate blueprint, emphasizing that your current focus on '{life_focus}' "
        f"is reaching a karmic convergence point. Balance intuitive contemplation with decisive physical action."
    )

    # Generate insights across all 7 required categories
    insights_by_cat = {
        "Personality": (
            f"As a {personality['archetype_title']}, your dominant {hand_elem} elemental balance bestows rare depth. "
            f"Your palm's Head line and {cards[0]['card']['name'] if cards else 'The Magician'} show an exceptional ability "
            f"to transform abstract intuition into structured creative reality."
        ),
        "Relationships": (
            f"Your Heart line's graceful curve indicates profound emotional loyalty. Aligned with {cards[1]['card']['name'] if len(cards) > 1 else 'The Lovers'}, "
            f"authentic communication and energetic reciprocity are paramount. Avoid one-sided energetic giving."
        ),
        "Career": (
            f"The Fate Line's clear upward trajectory, illuminated by {cards[-1]['card']['name'] if cards else 'The Sun'}, "
            f"forecasts substantial vocational expansion. Your innate leadership shines when mentoring or pioneering original solutions."
        ),
        "Finance": (
            f"Sun Line clarity combined with Pentacles and Wands archetypes shows steady material accumulation. "
            f"Invest in long-term skill refinement and ethical, value-driven assets rather than speculative quick wins."
        ),
        "Health & Wellness": (
            f"Your Life Line indicates robust nervous-system recuperation. Cultivate grounded daily rhythms: "
            f"hydration, breathwork, nature grounding, and boundary-setting to maintain pristine energetic balance."
        ),
        "Personal Growth": (
            f"The active tarot keys suggest a powerful awakening phase. You are invited to transmute past self-doubt into unshakeable sovereign confidence. "
            f"Daily meditation and sacred journaling will accelerate your inner evolution."
        ),
        "Life Opportunities": (
            f"Major synchronistic windows are opening in the next 30 to 90 days. Be vigilant for collaborative invitations "
            f"that resonate with your core soul values."
        )
    }

    # Actionable Guidance & Affirmation
    affirmed_guidance = (
        f"I stand sovereign in my authentic truth. My hands hold the power of creation, "
        f"and the cards illuminate my path with divine clarity. I step forward in courage and grace."
    )

    # Build recommendations
    recs = [
        {
            "category": "Personal Growth",
            "title": "Sacred Morning Grounding Ritual",
            "description": f"Engage in 15 minutes of silent breath meditation facing East to harmonize your {hand_elem} energy.",
            "action_steps": ["5 minutes box breathing", "Journaling 3 intuitive prompts", "Setting daily intention"],
            "affirmation": "I am deeply anchored in universal wisdom.",
            "ritual_or_exercise": "Sun gazing and barefoot earthing",
            "crystals_colors_focus": "Lapis Lazuli & Celestial Indigo"
        },
        {
            "category": "Relationships",
            "title": "Heart-Chakra Harmonic Resonance",
            "description": "Practice non-judgmental active listening and transparent emotional boundary setting with loved ones.",
            "action_steps": ["Express appreciation explicitly", "Release unsaid expectations", "Hold sacred space"],
            "affirmation": "My heart radiates unconditional compassion and clear boundaries.",
            "ritual_or_exercise": "Rose quartz meditation with green tea",
            "crystals_colors_focus": "Rose Quartz & Emerald Green"
        },
        {
            "category": "Career",
            "title": "Vocational Quantum Leap Execution",
            "description": "Channel your Fate Line momentum into launching your highest-potential project without hesitation.",
            "action_steps": ["Draft project blueprint", "Schedule pitch/review", "Declare commitment publicly"],
            "affirmation": "My vocational path is paved with abundance and purpose.",
            "ritual_or_exercise": "Lighting a golden candle while writing business milestones",
            "crystals_colors_focus": "Citrine & Solar Gold"
        }
    ]

    return {
        "scoring_breakdown": scoring,
        "cross_modality_synthesis": synthesis_narrative,
        "insights_by_category": insights_by_cat,
        "personality_profile": personality,
        "life_trend_forecast": trends,
        "recommendations": recs,
        "affirmed_guidance": affirmed_guidance
    }
