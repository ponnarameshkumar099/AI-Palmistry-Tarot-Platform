import json
import uuid
import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
from app.config import DATA_DIR

DB_FILE = DATA_DIR / "mystic_platform_db.json"

# In-memory storage cache backed by JSON persistence
db: Dict[str, Any] = {
    "users": {},
    "readings": {},
    "palm_scans": {},
    "tarot_sessions": {},
    "notifications": {},
    "consultation_notes": {},
    "appointments": {},
    "reviews": {},
    "audit_logs": [],
    "analytics_events": []
}

def load_db():
    global db
    if DB_FILE.exists():
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                db.update(loaded)
        except Exception as e:
            print(f"Error loading DB: {e}, initializing default seed data...")
            init_seed_data()
    else:
        init_seed_data()
        save_db()
    init_seed_data()
    save_db()

def save_db():
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving DB: {e}")

# --- 78-Card Full Tarot Dataset ---
TAROT_DECK: List[Dict[str, Any]] = [
    # 22 Major Arcana
    {
        "id": 0, "name": "The Fool", "arcana": "Major Arcana", "suit": None, "number": 0,
        "element": "Air", "astrology": "Uranus",
        "upright_keywords": ["Beginnings", "Innocence", "Spontaneity", "Free Spirit", "Leap of Faith"],
        "reversed_keywords": ["Recklessness", "Risk-taking", "Hesitation", "Naivety"],
        "upright_meaning": "Embrace infinite potential, pure faith in the universe, and embark on a transformative spiritual quest without fear.",
        "reversed_meaning": "Beware of heedless leaps without grounding; hesitation is paralyzing your fresh beginnings.",
        "symbolism": "A youth at the edge of a cliff carrying a white rose (purity) and a small bindle, accompanied by a loyal white dog symbolizing companion intuition.",
        "image_url": "/static/assets/tarot/0_fool.png"
    },
    {
        "id": 1, "name": "The Magician", "arcana": "Major Arcana", "suit": None, "number": 1,
        "element": "Air", "astrology": "Mercury",
        "upright_keywords": ["Manifestation", "Resourcefulness", "Power", "Inspired Action", "Skill"],
        "reversed_keywords": ["Illusion", "Manipulation", "Untapped Potential", "Wasted Talent"],
        "upright_meaning": "You possess all tools (wand, cup, sword, pentacle) to bridge the ethereal realms into physical manifestation. As above, so below.",
        "reversed_meaning": "Misaligned creative energy, deception, or doubt in your innate manifesting capabilities.",
        "symbolism": "The infinity sign above the head, pointing one hand to the sky and one to the earth, surrounded by blossoming red roses and white lilies.",
        "image_url": "/static/assets/tarot/1_magician.png"
    },
    {
        "id": 2, "name": "The High Priestess", "arcana": "Major Arcana", "suit": None, "number": 2,
        "element": "Water", "astrology": "Moon",
        "upright_keywords": ["Intuition", "Sacred Knowledge", "Divine Feminine", "Subconscious", "Mystery"],
        "reversed_keywords": ["Secrets", "Disconnected from Intuition", "Withdrawal", "Surface Focus"],
        "upright_meaning": "Trust your deepest inner knowing; secrets and esoteric wisdom are awakening in the quiet sanctuary of your psyche.",
        "reversed_meaning": "Ignoring gut instincts, excessive reliance on external approval, or hidden agendas surfacing.",
        "symbolism": "Seated between the pillars of Boaz (darkness) and Jachin (light), holding the scroll of TORA with a crescent moon at her feet.",
        "image_url": "/static/assets/tarot/2_high_priestess.png"
    },
    {
        "id": 3, "name": "The Empress", "arcana": "Major Arcana", "suit": None, "number": 3,
        "element": "Earth", "astrology": "Venus",
        "upright_keywords": ["Abundance", "Fertility", "Creativity", "Nurturing", "Sensuality"],
        "reversed_keywords": ["Creative Block", "Dependence", "Smothering", "Neglect"],
        "upright_meaning": "A season of flourishing abundance, sensory luxury, and creative fertility; nurture your projects and self.",
        "reversed_meaning": "Empty cup syndrome; over-giving without self-nourishment, creative stagnation.",
        "symbolism": "A crowned sovereign resting on velvety cushions amidst golden wheat fields and flowing crystalline waterfalls.",
        "image_url": "/static/assets/tarot/3_empress.png"
    },
    {
        "id": 4, "name": "The Emperor", "arcana": "Major Arcana", "suit": None, "number": 4,
        "element": "Fire", "astrology": "Aries",
        "upright_keywords": ["Authority", "Structure", "Stability", "Leadership", "Discipline"],
        "reversed_keywords": ["Tyranny", "Rigidity", "Lack of Control", "Chaos"],
        "upright_meaning": "Establish firm boundaries, structured systems, and sovereign dominion over your goals.",
        "reversed_meaning": "Inflexible control, micromanagement, or defiance of necessary structure.",
        "symbolism": "A stone throne carved with ram heads, holding an orb and scepter overlooking rugged mountains of resilience.",
        "image_url": "/static/assets/tarot/4_emperor.png"
    },
    {
        "id": 5, "name": "The Hierophant", "arcana": "Major Arcana", "suit": None, "number": 5,
        "element": "Earth", "astrology": "Taurus",
        "upright_keywords": ["Spiritual Wisdom", "Tradition", "Mentorship", "Institutions", "Belief Systems"],
        "reversed_keywords": ["Rebellion", "Unconventional Paths", "New Beliefs", "Dogma"],
        "upright_meaning": "Seek spiritual counsel, align with timeless principles, and embrace structured spiritual education.",
        "reversed_meaning": "Breaking free from dogma; forging your own personal spiritual creed and unorthodox pathway.",
        "symbolism": "Triple-crowned spiritual teacher blessing disciples before sacred keys of initiation.",
        "image_url": "/static/assets/tarot/5_hierophant.png"
    },
    {
        "id": 6, "name": "The Lovers", "arcana": "Major Arcana", "suit": None, "number": 6,
        "element": "Air", "astrology": "Gemini",
        "upright_keywords": ["Love", "Harmony", "Relationships", "Values Alignment", "Choices"],
        "reversed_keywords": ["Disharmony", "Imbalance", "Misaligned Values", "Conflict"],
        "upright_meaning": "Divine union of dualities, soul connections, and vital crossroads requiring moral integrity and heart resonance.",
        "reversed_meaning": "Inner disharmony, relationship friction, or compromising your sacred core values.",
        "symbolism": "Archangel Raphael radiating violet-gold light over Adam and Eve beneath the Tree of Life and Tree of Knowledge.",
        "image_url": "/static/assets/tarot/6_lovers.png"
    },
    {
        "id": 7, "name": "The Chariot", "arcana": "Major Arcana", "suit": None, "number": 7,
        "element": "Water", "astrology": "Cancer",
        "upright_keywords": ["Triumph", "Willpower", "Determination", "Focus", "Victory"],
        "reversed_keywords": ["Lack of Direction", "Aggression", "Loss of Control", "Obstacles"],
        "upright_meaning": "Harness opposing inner forces with resolute willpower and drive your life path forward into triumphant victory.",
        "reversed_meaning": "Feeling powerless, spinning wheels, or aggressive forceful actions causing derailment.",
        "symbolism": "A crowned charioteer reigning black and white sphinxes beneath a starry celestial canopy.",
        "image_url": "/static/assets/tarot/7_chariot.png"
    },
    {
        "id": 8, "name": "Strength", "arcana": "Major Arcana", "suit": None, "number": 8,
        "element": "Fire", "astrology": "Leo",
        "upright_keywords": ["Courage", "Gentle Mastery", "Compassion", "Patience", "Inner Power"],
        "reversed_keywords": ["Self-Doubt", "Weakness", "Raw Emotion", "Insecurity"],
        "upright_meaning": "True strength is gentle mastery: subduing instinctual beasts through unconditional love and inner poise.",
        "reversed_meaning": "Imposter syndrome, giving in to fears, or letting instinctual rage overpower wisdom.",
        "symbolism": "A maiden crowned with the infinity symbol tenderly holding open the jaws of a majestic lion.",
        "image_url": "/static/assets/tarot/8_strength.png"
    },
    {
        "id": 9, "name": "The Hermit", "arcana": "Major Arcana", "suit": None, "number": 9,
        "element": "Earth", "astrology": "Virgo",
        "upright_keywords": ["Soul-Searching", "Introspection", "Solitude", "Inner Guidance", "Wisdom"],
        "reversed_keywords": ["Isolation", "Loneliness", "Withdrawal", "Rejection of Wisdom"],
        "upright_meaning": "Retreat into sacred solitude to illuminate the inner compass; your soul holds the lantern to light your path.",
        "reversed_meaning": "Unhealthy exile, feeling disconnected from community, or avoiding necessary contemplation.",
        "symbolism": "An elder sage atop snowy peaks holding a golden lantern with a 6-pointed star of truth.",
        "image_url": "/static/assets/tarot/9_hermit.png"
    },
    {
        "id": 10, "name": "Wheel of Fortune", "arcana": "Major Arcana", "suit": None, "number": 10,
        "element": "Fire", "astrology": "Jupiter",
        "upright_keywords": ["Good Luck", "Karma", "Life Cycles", "Destiny", "Turning Point"],
        "reversed_keywords": ["Bad Luck", "Resistance to Change", "Breaking Cycles", "Setbacks"],
        "upright_meaning": "The great cosmic wheel turns in your favor; karmic rewards and unexpected synchronistic breakthroughs arrive.",
        "reversed_meaning": "A cycle of friction; do not resist the turning wheel, cultivate equanimity amidst shifts.",
        "symbolism": "The celestial wheel inscribed with Hebrew letters and alchemy symbols, guarded by the four sacred creatures.",
        "image_url": "/static/assets/tarot/10_wheel_of_fortune.png"
    },
    {
        "id": 11, "name": "Justice", "arcana": "Major Arcana", "suit": None, "number": 11,
        "element": "Air", "astrology": "Libra",
        "upright_keywords": ["Fairness", "Truth", "Cause and Effect", "Law", "Clarity"],
        "reversed_keywords": ["Dishonesty", "Unfairness", "Lack of Accountability", "Bias"],
        "upright_meaning": "Absolute cosmic equilibrium; decisions made now will balance your karmic scales with undeniable clarity.",
        "reversed_meaning": "Unfair treatment, dodging personal responsibility, or clouded moral judgment.",
        "symbolism": "A seated judge holding the double-edged sword of truth upright in one hand and balanced golden scales in the other.",
        "image_url": "/static/assets/tarot/11_justice.png"
    },
    {
        "id": 12, "name": "The Hanged Man", "arcana": "Major Arcana", "suit": None, "number": 12,
        "element": "Water", "astrology": "Neptune",
        "upright_keywords": ["Surrender", "New Perspective", "Letting Go", "Pause", "Spiritual Enlightenment"],
        "reversed_keywords": ["Stalling", "Resistance", "Martyrdom", "Needless Sacrifice"],
        "upright_meaning": "Voluntary pause; by surrendering rigid control, you see the world from an enlightened inverse perspective.",
        "reversed_meaning": "Struggling against necessary delays, playing the martyr, or stubborn resistance to shifts.",
        "symbolism": "A figure suspended upside down from a living wooden cross, serenely illuminated by a halo of radiant gold light.",
        "image_url": "/static/assets/tarot/12_hanged_man.png"
    },
    {
        "id": 13, "name": "Death", "arcana": "Major Arcana", "suit": None, "number": 13,
        "element": "Water", "astrology": "Scorpio",
        "upright_keywords": ["Transformation", "Endings", "Transition", "Rebirth", "Shedding the Old"],
        "reversed_keywords": ["Fear of Change", "Holding On", "Stagnation", "Decay"],
        "upright_meaning": "The ultimate card of profound rebirth; the old identity dissolves completely so the glorious new chapter can rise.",
        "reversed_meaning": "Clinging desperately to obsolete patterns, resisting natural evolutionary endings.",
        "symbolism": "A skeletal knight in black armor holding a banner of the mystic five-petaled rose, sunrise glowing behind twin towers.",
        "image_url": "/static/assets/tarot/13_death.png"
    },
    {
        "id": 14, "name": "Temperance", "arcana": "Major Arcana", "suit": None, "number": 14,
        "element": "Fire", "astrology": "Sagittarius",
        "upright_keywords": ["Balance", "Moderation", "Patience", "Alchemy", "Purpose"],
        "reversed_keywords": ["Imbalance", "Excess", "Extremes", "Impatience"],
        "upright_meaning": "Divine alchemy and harmonious synthesis; blending opposing energies into a tranquil, sacred golden elixir.",
        "reversed_meaning": "Living in extremes, volatility, overindulgence, or rushed timing disrupting your peace.",
        "symbolism": "An angelic being pouring fluid between two golden chalices with one foot on earth and one in crystalline water.",
        "image_url": "/static/assets/tarot/14_temperance.png"
    },
    {
        "id": 15, "name": "The Devil", "arcana": "Major Arcana", "suit": None, "number": 15,
        "element": "Earth", "astrology": "Capricorn",
        "upright_keywords": ["Shadow Self", "Attachment", "Addiction", "Illusion", "Materialism"],
        "reversed_keywords": ["Freedom", "Breaking Chains", "Reclaiming Power", "Overcoming Shadow"],
        "upright_meaning": "Examine subconscious attachments, limiting self-beliefs, or toxic dependency; the chains are loose enough to remove.",
        "reversed_meaning": "Liberation from oppressive habits, breaking generational cycles, waking up to sovereign freedom.",
        "symbolism": "A horned goat figure perched above chained figures whose neck loops are loose enough to effortlessly slip off.",
        "image_url": "/static/assets/tarot/15_devil.png"
    },
    {
        "id": 16, "name": "The Tower", "arcana": "Major Arcana", "suit": None, "number": 16,
        "element": "Fire", "astrology": "Mars",
        "upright_keywords": ["Sudden Revelation", "Awakening", "Breakdown", "Chaos", "Truth Revealed"],
        "reversed_keywords": ["Disaster Avoided", "Delaying Inevitable", "Fear of Suffering"],
        "upright_meaning": "A bolt of divine truth strikes down false foundations; this catalytic upheaval clears the ground for authentic truth.",
        "reversed_meaning": "Narrowly escaping catastrophe, or clinging to a collapsing falsehood out of fear.",
        "symbolism": "Lightning striking a fortified mountain tower, crowns falling as flames illuminate the night sky.",
        "image_url": "/static/assets/tarot/16_tower.png"
    },
    {
        "id": 17, "name": "The Star", "arcana": "Major Arcana", "suit": None, "number": 17,
        "element": "Air", "astrology": "Aquarius",
        "upright_keywords": ["Hope", "Faith", "Inspiration", "Healing", "Serenity", "Blessings"],
        "reversed_keywords": ["Despair", "Hopelessness", "Faithlessness", "Discouragement"],
        "upright_meaning": "Pure cosmic blessing; peace, renewed faith, and celestial clarity bathe your spirit after the storm.",
        "reversed_meaning": "Pessimism, feelings of emptiness, disconnection from the universe's benevolent abundance.",
        "symbolism": "A maiden pouring living water onto land and sea beneath seven minor stars and one central brilliant guiding star.",
        "image_url": "/static/assets/tarot/17_star.png"
    },
    {
        "id": 18, "name": "The Moon", "arcana": "Major Arcana", "suit": None, "number": 18,
        "element": "Water", "astrology": "Pisces",
        "upright_keywords": ["Illusion", "Subconscious", "Dreams", "Intuition", "Shadow Work"],
        "reversed_keywords": ["Clarity", "Unmasking Deception", "Release of Fear", "Lucidity"],
        "upright_meaning": "Navigate the twilight realms of dreams and intuition; things are not as they appear on the surface.",
        "reversed_meaning": "The morning mist clears, exposing hidden truths and releasing paralyzing nightmares.",
        "symbolism": "A crayfish emerging from dark waters between howling dog and wolf under a full hypnotic moon.",
        "image_url": "/static/assets/tarot/18_moon.png"
    },
    {
        "id": 19, "name": "The Sun", "arcana": "Major Arcana", "suit": None, "number": 19,
        "element": "Fire", "astrology": "Sun",
        "upright_keywords": ["Joy", "Success", "Celebration", "Radiance", "Vitality", "Warmth"],
        "reversed_keywords": ["Temporary Sadness", "Over-optimism", "Blocked Joy"],
        "upright_meaning": "Supreme radiance, unfiltered joy, vitality, and triumphant success illuminate every corner of your life.",
        "reversed_meaning": "Clouded joy, temporary gloom, or feeling unappreciated despite your bright talents.",
        "symbolism": "A joyful child crowned with flowers riding a calm white horse under a smiling golden sun surrounded by sunflowers.",
        "image_url": "/static/assets/tarot/19_sun.png"
    },
    {
        "id": 20, "name": "Judgement", "arcana": "Major Arcana", "suit": None, "number": 20,
        "element": "Fire", "astrology": "Pluto",
        "upright_keywords": ["Higher Calling", "Reckoning", "Absolution", "Awakening", "Rebirth"],
        "reversed_keywords": ["Self-Doubt", "Harsh Criticism", "Ignoring Call", "Regret"],
        "upright_meaning": "Hear the clarion call of your higher self; leave behind past regrets and step into your redeemed life purpose.",
        "reversed_meaning": "Self-judgment, harsh condemnation, or refusing to heed your spiritual calling.",
        "symbolism": "Archangel Gabriel sounding the celestial trumpet from clouds as souls rise joyously from graves.",
        "image_url": "/static/assets/tarot/20_judgement.png"
    },
    {
        "id": 21, "name": "The World", "arcana": "Major Arcana", "suit": None, "number": 21,
        "element": "Earth", "astrology": "Saturn",
        "upright_keywords": ["Completion", "Integration", "Wholeness", "Travel", "Triumph"],
        "reversed_keywords": ["Incompletion", "Lack of Closure", "Shortcuts", "Delay"],
        "upright_meaning": "A grand cycle reaches cosmic completion; celebrate wholeness, mastery, and effortless harmony with the universe.",
        "reversed_meaning": "Unfinished business, lingering ties, or seeking premature closure.",
        "symbolism": "A cosmic dancer framed in a laurel wreath, flanked by the four guardians of heaven.",
        "image_url": "/static/assets/tarot/21_world.png"
    }
]

# Add representative Minor Arcana to complete the standard 78-card archetypes (Wands, Cups, Swords, Pentacles)
SUITS = [
    ("Wands", "Fire", "Creativity, Passion, Ambition, Spiritual Drive", ["Aries", "Leo", "Sagittarius"]),
    ("Cups", "Water", "Emotions, Love, Intuition, Relationships", ["Cancer", "Scorpio", "Pisces"]),
    ("Swords", "Air", "Intellect, Truth, Communication, Clarity, Mind", ["Gemini", "Libra", "Aquarius"]),
    ("Pentacles", "Earth", "Material Wealth, Health, Stability, Career", ["Taurus", "Virgo", "Capricorn"])
]

CARD_NAMES = [
    ("Ace of {suit}", 1, "Raw potential, spark of new beginning, divine offering", "Blocked potential, missed opportunity"),
    ("Two of {suit}", 2, "Planning, duality, choices, emerging partnership", "Indecision, imbalance, poor planning"),
    ("Three of {suit}", 3, "Expansion, initial collaboration, creative growth", "Delays, creative friction, isolation"),
    ("Four of {suit}", 4, "Stability, milestone celebration, solid foundation", "Complacency, rigidity, restriction"),
    ("Five of {suit}", 5, "Conflict, competition, testing of resolve", "Resolution of conflict, compromise, peace"),
    ("Six of {suit}", 6, "Victory, harmony, generosity, peaceful transition", "Ego pride, delayed recognition, clinging to past"),
    ("Seven of {suit}", 7, "Perseverance, strategic defense, assessing options", "Overwhelmed, giving up, deception"),
    ("Eight of {suit}", 8, "Rapid movement, mastery, dedicated craft", "Haste, stagnation, scattered energy"),
    ("Nine of {suit}", 9, "Resilience, spiritual fruition, self-sufficiency", "Exhaustion, defensive paranoia, loneliness"),
    ("Ten of {suit}", 10, "Culmination, legacy, fulfillment or heavy load", "Release of burden, collapse of structure"),
    ("Page of {suit}", 11, "Curiosity, messenger of inspiration, youthful seeker", "Immaturity, procrastination, lack of follow-through"),
    ("Knight of {suit}", 12, "Action-oriented pursuit, questing energy, chivalry", "Recklessness, haste, volatile temperament"),
    ("Queen of {suit}", 13, "Empathetic mastery, emotional grounding, radiance", "Insecurity, moodiness, smothering control"),
    ("King of {suit}", 14, "Executive mastery, wisdom, visionary authority", "Autocracy, stubbornness, cold detachment")
]

next_id = 22
for suit, element, domain, signs in SUITS:
    for name_tpl, num, upright_core, reversed_core in CARD_NAMES:
        card_name = name_tpl.format(suit=suit)
        TAROT_DECK.append({
            "id": next_id,
            "name": card_name,
            "arcana": "Minor Arcana",
            "suit": suit,
            "number": num,
            "element": element,
            "astrology": signs[num % len(signs)],
            "upright_keywords": [upright_core.split(',')[0].strip(), suit, "Manifestation", "Progress"],
            "reversed_keywords": [reversed_core.split(',')[0].strip(), "Hesitation", "Misdirection"],
            "upright_meaning": f"The {card_name} brings {upright_core} to your {domain.lower()}.",
            "reversed_meaning": f"Reversed, {card_name} indicates {reversed_core} regarding {domain.lower()}.",
            "symbolism": f"Archetypal {suit} emblems radiating {element} energy across the seeker's canvas.",
            "image_url": f"/static/assets/tarot/{suit.lower()}_{num}.png"
        })
        next_id += 1


# --- Seed Data Initialization ---

def init_seed_data():
    import bcrypt
    
    hash_seeker = bcrypt.hashpw(b"SeekerPass2026!", bcrypt.gensalt()).decode("utf-8")
    hash_reader = bcrypt.hashpw(b"ReaderPass2026!", bcrypt.gensalt()).decode("utf-8")
    hash_consultant = bcrypt.hashpw(b"ConsultantPass2026!", bcrypt.gensalt()).decode("utf-8")
    hash_admin = bcrypt.hashpw(b"AdminPass2026!", bcrypt.gensalt()).decode("utf-8")

    seed_users = [
        {
            "id": "usr-seeker-101",
            "name": "Aria Solstice",
            "email": "user@mystic.io",
            "password_hash": hash_seeker,
            "role": "User",
            "age_group": "26-35",
            "interests": ["Tarot", "Palmistry", "Astrology", "Meditation"],
            "spiritual_goals": ["Discover Soul Purpose", "Strengthen Relationship Empathy", "Career Abundance"],
            "reading_preferences": {"frequency": "Weekly", "depth": "Deep Spiritual", "focus": "Life Path"},
            "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Aria",
            "bio": "Spiritual seeker passionate about intuitive living and cosmic alignments.",
            "created_at": "2026-01-15T09:30:00Z",
            "readings_count": 0
        },
        {
            "id": "usr-reader-202",
            "name": "Madame Seraphina",
            "email": "reader@mystic.io",
            "password_hash": hash_reader,
            "role": "Tarot Reader",
            "age_group": "36-45",
            "interests": ["Hermetic Tarot", "Kabbalah", "Elemental Divination", "Archetypes"],
            "spiritual_goals": ["Guide Seekers", "Elevate Platform Divination Standards"],
            "reading_preferences": {"frequency": "Daily", "depth": "Esoteric Master", "focus": "Celtic Cross"},
            "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Seraphina",
            "bio": "Certified Tarot Master & Intuitive Guide with 15+ years experience.",
            "created_at": "2025-11-20T14:15:00Z",
            "readings_count": 342
        },
        {
            "id": "usr-consultant-303",
            "name": "Zachary Vance",
            "email": "consultant@mystic.io",
            "password_hash": hash_consultant,
            "role": "Spiritual Consultant",
            "age_group": "46-55",
            "interests": ["Vedic Palmistry", "Chakra Systems", "Holistic Wellness", "Life Path Coaching"],
            "spiritual_goals": ["Integrate Ancient Modalities with Modern Psychology"],
            "reading_preferences": {"frequency": "Bi-Weekly", "depth": "Holistic Synthesis", "focus": "Life Trends"},
            "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Zachary",
            "bio": "Senior Spiritual Consultant & Palmistry Analyst specializing in life trend forecasting.",
            "created_at": "2025-08-10T10:00:00Z",
            "readings_count": 519
        },
        {
            "id": "usr-admin-404",
            "name": "Grand Sovereign Admin",
            "email": "admin@mystic.io",
            "password_hash": hash_admin,
            "role": "Administrator",
            "age_group": "36-45",
            "interests": ["Platform Governance", "AI Model Integrity", "User Safety", "Analytics"],
            "spiritual_goals": ["Maintain Cosmic Platform Integrity and Security"],
            "reading_preferences": {"frequency": "Daily", "depth": "System Architecture", "focus": "Platform Analytics"},
            "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
            "bio": "Platform Administrator & Overseer of Spiritual Intelligence Services.",
            "created_at": "2025-01-01T00:00:00Z",
            "readings_count": 1204
        }
    ]

    for u in seed_users:
        db["users"][u["id"]] = u

    # Seed Notifications
    seed_notifications = [
        {
            "id": "notif-001",
            "user_id": "usr-seeker-101",
            "type": "daily_guidance",
            "title": "Daily Cosmic Guidance",
            "message": "Today the Sun aligns with Mercury in your communication sector. Express your core truth with confidence.",
            "timestamp": "2026-08-22T08:00:00Z",
            "read": False,
            "action_url": "/readings/tarot"
        },
        {
            "id": "notif-002",
            "user_id": "usr-seeker-101",
            "type": "reading_reminder",
            "title": "Weekly Palm Synthesis Due",
            "message": "Your Sunday Palm energy scan is ready for weekly renewal. Check updated life line vigor!",
            "timestamp": "2026-08-21T18:00:00Z",
            "read": True,
            "action_url": "/readings/palm"
        },
        {
            "id": "notif-003",
            "user_id": "usr-seeker-101",
            "type": "spiritual_growth",
            "title": "Milestone Achieved: Intuition Level 3",
            "message": "Your insight consistency has reached 88.5%. You have unlocked the Celtic Cross Deep Synthesis badge!",
            "timestamp": "2026-08-20T12:00:00Z",
            "read": False,
            "action_url": "/dashboard/user"
        },
        {
            "id": "notif-004",
            "user_id": "usr-reader-202",
            "type": "platform_announcement",
            "title": "New Spreads Deployed: Life Path 7-Card",
            "message": "The Life Path Spread has been enabled for all client readings with enhanced AI synthesis.",
            "timestamp": "2026-08-22T06:00:00Z",
            "read": False,
            "action_url": "/dashboard/reader"
        }
    ]

    for n in seed_notifications:
        db["notifications"][n["id"]] = n

    # Seed Appointments
    seed_appointments = [
        {
            "id": "apt-101",
            "seeker_id": "usr-seeker-101",
            "seeker_name": "Aria Solstice",
            "seeker_email": "user@mystic.io",
            "practitioner_role": "Tarot Reader",
            "practitioner_id": "usr-reader-202",
            "practitioner_name": "Madame Seraphina",
            "modality": "Tarot Reading Consultation",
            "selected_card": "The Star (Major Arcana)",
            "date_time": "2026-10-10T14:30",
            "status": "Accepted",
            "meeting_link": "https://meet.google.com/mystic-tarot-star-session",
            "notes": "Seeker requested 1-on-1 Celtic Cross synthesis for career direction.",
            "created_at": "2026-10-08T10:00:00Z"
        },
        {
            "id": "apt-102",
            "seeker_id": "usr-seeker-101",
            "seeker_name": "Aria Solstice",
            "seeker_email": "user@mystic.io",
            "practitioner_role": "Spiritual Consultant",
            "practitioner_id": "usr-consultant-303",
            "practitioner_name": "Zachary Vance",
            "modality": "Palmistry Life Trajectory Session",
            "selected_card": "Water Hand CV Feature Scan",
            "date_time": "2026-10-12T16:00",
            "status": "Accepted",
            "meeting_link": "https://meet.google.com/mystic-palmistry-life-trajectory",
            "notes": "Seeker requested deep life trend trajectory and heart line analysis.",
            "created_at": "2026-10-08T11:30:00Z"
        },
        {
            "id": "apt-103",
            "seeker_id": "usr-seeker-101",
            "seeker_name": "Aria Solstice",
            "seeker_email": "user@mystic.io",
            "practitioner_role": "Tarot Reader",
            "practitioner_id": "usr-reader-202",
            "practitioner_name": "Madame Seraphina",
            "modality": "1-on-1 Tarot Reading Session",
            "selected_card": "The Sun (Major Arcana)",
            "date_time": "2026-10-05T15:00",
            "status": "Completed",
            "meeting_link": "https://meet.google.com/mystic-tarot-sun-session",
            "notes": "Completed 1-on-1 consultation on Major Arcana life path.",
            "created_at": "2026-10-05T09:00:00Z"
        },
        {
            "id": "apt-104",
            "seeker_id": "usr-seeker-101",
            "seeker_name": "Aria Solstice",
            "seeker_email": "user@mystic.io",
            "practitioner_role": "Spiritual Consultant",
            "practitioner_id": "usr-consultant-303",
            "practitioner_name": "Zachary Vance",
            "modality": "Spiritual Growth Coaching",
            "selected_card": "Mount of Jupiter Scan",
            "date_time": "2026-10-06T11:00",
            "status": "Rescheduled",
            "meeting_link": "https://meet.google.com/mystic-spiritual-coaching-rescheduled",
            "notes": "Rescheduled to next Tuesday upon consultant availability.",
            "created_at": "2026-10-06T08:00:00Z"
        },
        {
            "id": "apt-105",
            "seeker_id": "usr-seeker-101",
            "seeker_name": "Aria Solstice",
            "seeker_email": "user@mystic.io",
            "practitioner_role": "Tarot Reader",
            "practitioner_id": "usr-reader-202",
            "practitioner_name": "Madame Seraphina",
            "modality": "Celtic Cross Deep Synthesis",
            "selected_card": "Wheel of Fortune",
            "date_time": "2026-10-15T10:00",
            "status": "Pending",
            "meeting_link": "",
            "notes": "Pending practitioner confirmation.",
            "created_at": "2026-10-08T19:00:00Z"
        }
    ]

    for a in seed_appointments:
        db["appointments"][a["id"]] = a

    # Seed Reviews
    seed_reviews = [
        {
            "id": "rev-201",
            "appointment_id": "apt-103",
            "seeker_name": "Aria Solstice",
            "practitioner_role": "Tarot Reader",
            "practitioner_name": "Madame Seraphina",
            "rating": 5.0,
            "review_text": "Madame Seraphina's Tarot reading was extraordinarily insightful! The Celtic Cross synthesis gave me full clarity on my career path.",
            "created_at": "2026-10-05T16:30:00Z"
        },
        {
            "id": "rev-202",
            "appointment_id": "apt-104",
            "seeker_name": "Aria Solstice",
            "practitioner_role": "Spiritual Consultant",
            "practitioner_name": "Zachary Vance",
            "rating": 5.0,
            "review_text": "Zachary's Palmistry Life Trajectory Analysis accurately identified my heart line shifts and guided me through stress management.",
            "created_at": "2026-10-06T12:30:00Z"
        },
        {
            "id": "rev-203",
            "appointment_id": "apt-099",
            "seeker_name": "Julian Vance",
            "practitioner_role": "Spiritual Consultant",
            "practitioner_name": "Zachary Vance",
            "rating": 4.9,
            "review_text": "Exceptional guidance! The Google Meet consultation was seamless and highly transformational.",
            "created_at": "2026-10-04T18:00:00Z"
        }
    ]

    for r in seed_reviews:
        db["reviews"][r["id"]] = r

    # Seed Audit Logs
    db["audit_logs"] = [
        {"timestamp": "2026-08-22T10:15:00Z", "actor": "Aria Solstice", "action": "GENERATED_SYNTHESIZED_READING", "details": "Completed Life Path Spread + Water Hand Palm Scan"},
        {"timestamp": "2026-08-22T09:40:00Z", "actor": "Madame Seraphina", "action": "READER_SESSION_COMPLETED", "details": "Conducted 10-card Celtic Cross consultation"},
        {"timestamp": "2026-08-22T08:30:00Z", "actor": "Zachary Vance", "action": "CONSULTANT_TREND_REVIEW", "details": "Reviewed 30-day life trend trajectory for cohort seekers"},
        {"timestamp": "2026-08-22T08:00:00Z", "actor": "SYSTEM_CRON", "action": "DISPATCHED_DAILY_NOTIFICATIONS", "details": "Delivered daily celestial guidance to 420 active seekers"}
    ]

load_db()
