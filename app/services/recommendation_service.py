from typing import List, Dict, Any

RECOMMENDATIONS_DATABASE = [
    {
        "category": "Personal Growth",
        "title": "Subconscious Shadow Integration",
        "description": "Examine reactive triggers to reclaim lost vitality and personal authority.",
        "action_steps": [
            "Identify one emotional trigger from the past week",
            "Write down what boundary or unmet need it points to",
            "Perform a 10-minute forgiveness and integration visualization"
        ],
        "affirmation": "I embrace all parts of myself with unconditional love and sovereign truth.",
        "ritual_or_exercise": "Evening journaling with candle gazing",
        "crystals_colors_focus": "Obsidian & Deep Amethyst"
    },
    {
        "category": "Relationships",
        "title": "Soul-Level Communication Alignment",
        "description": "Transcend reactive conflict by communicating from core emotional authenticity.",
        "action_steps": [
            "Use 'I feel' statements instead of projection",
            "Practice 3 minutes of synchronized breathing with your partner or friend",
            "Share one vulnerability you have been holding back"
        ],
        "affirmation": "My relationships are containers of mutual growth, truth, and profound peace.",
        "ritual_or_exercise": "Heart chakra sound bath (528 Hz frequency)",
        "crystals_colors_focus": "Rhodonite & Rose Pink"
    },
    {
        "category": "Career",
        "title": "Mastery & High-Impact Focus",
        "description": "Align daily output with your unique zone of genius to accelerate career destiny.",
        "action_steps": [
            "Block 90 minutes of undisturbed deep creative work each morning",
            "Say no to low-leverage obligations that dilute your focus",
            "Document your achievements and quantify your value contribution"
        ],
        "affirmation": "I attract prosperous opportunities that celebrate my unique genius.",
        "ritual_or_exercise": "Consecrating your workspace with sage/frankincense and clearing clutter",
        "crystals_colors_focus": "Pyrite & Royal Blue"
    },
    {
        "category": "Goal Alignment",
        "title": "Sacred Milestone Materialization",
        "description": "Bridge abstract spiritual aspirations into measurable weekly action milestones.",
        "action_steps": [
            "Break your primary 90-day goal into 3 weekly sprint outcomes",
            "Track daily consistency on a visual altar or habit tracker",
            "Celebrate every minor win with gratitude"
        ],
        "affirmation": "Every step I take grounds my highest vision into physical form.",
        "ritual_or_exercise": "Writing intentions under the New/Full Moon",
        "crystals_colors_focus": "Clear Quartz & Emerald Green"
    },
    {
        "category": "Spiritual Development",
        "title": "Intuitive Third-Eye Expansion",
        "description": "Strengthen clairsentience, lucid dreaming, and synchronic perception.",
        "action_steps": [
            "Record your dreams immediately upon waking",
            "Practice guessing card colors or testing intuitive hunches daily",
            "Spend 20 minutes in nature without digital devices"
        ],
        "affirmation": "The universe whispers its wisdom to me clearly and continuously.",
        "ritual_or_exercise": "Third-eye meditation with lavender essential oil",
        "crystals_colors_focus": "Labradorite & Indigo Violet"
    }
]

def get_recommendations_for_user(goals: List[str] = None, user_category: str = "All") -> List[Dict[str, Any]]:
    if user_category and user_category != "All":
        filtered = [r for r in RECOMMENDATIONS_DATABASE if r["category"].lower() == user_category.lower()]
        return filtered if filtered else RECOMMENDATIONS_DATABASE
    return RECOMMENDATIONS_DATABASE
