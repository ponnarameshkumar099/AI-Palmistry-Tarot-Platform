from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

# --- Auth & User Schemas ---

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "User"  # "User", "Tarot Reader", "Spiritual Consultant", "Administrator"
    age_group: Optional[str] = "26-35"
    interests: Optional[List[str]] = Field(default_factory=lambda: ["Tarot", "Palmistry", "Astrology"])
    spiritual_goals: Optional[List[str]] = Field(default_factory=lambda: ["Self-Discovery", "Career Clarity"])
    reading_preferences: Optional[Dict[str, Any]] = Field(default_factory=lambda: {"frequency": "Weekly", "depth": "Deep Spiritual", "focus": "Life Path"})

class UserLogin(BaseModel):
    email: str
    password: str

class OAuthLoginRequest(BaseModel):
    provider: str  # "google", "apple", "github"
    token: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = "User"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age_group: Optional[str] = None
    interests: Optional[List[str]] = None
    spiritual_goals: Optional[List[str]] = None
    reading_preferences: Optional[Dict[str, Any]] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    age_group: str
    interests: List[str]
    spiritual_goals: List[str]
    reading_preferences: Dict[str, Any]
    avatar: Optional[str] = None
    bio: Optional[str] = None
    created_at: str
    readings_count: int = 0

# --- Palmistry Schemas ---

class PalmLineDetail(BaseModel):
    name: str  # "Life Line", "Head Line", "Heart Line", "Fate Line", "Sun Line"
    description: str
    length: str  # "Long", "Moderate", "Curved", etc.
    depth: str   # "Deep", "Clear", "Chained", etc.
    clarity_score: float # 0 - 100
    meaning: str
    coordinates: List[List[float]] = Field(default_factory=list) # [[x1, y1], [x2, y2], ...] normalized

class PalmMountDetail(BaseModel):
    mount_name: str  # "Jupiter", "Saturn", "Apollo/Sun", "Mercury", "Venus", "Moon/Luna", "Mars"
    prominence: str  # "Well-developed", "Moderate", "Flat"
    spiritual_meaning: str
    energy_score: float # 0 - 100
    location: Dict[str, float] # {x, y, radius}

class PalmAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    hand_preset: Optional[str] = None # "earth_hand", "air_hand", "fire_hand", "water_hand"
    hand_type_hint: Optional[str] = "Right (Dominant)"
    question_context: Optional[str] = None

class PalmAnalysisResult(BaseModel):
    id: str
    timestamp: str
    hand_shape: str # "Earth Hand", "Air Hand", "Fire Hand", "Water Hand"
    element: str # "Earth", "Air", "Fire", "Water"
    finger_structure: Dict[str, Any]
    lines: Dict[str, PalmLineDetail]
    mounts: Dict[str, PalmMountDetail]
    confidence_score: float # 0 - 100 (Palm Analysis Confidence for scoring)
    interpretation: Dict[str, str]
    visual_overlay_svg: Optional[str] = None
    landmarks: List[Dict[str, Any]] = Field(default_factory=list)

# --- Tarot Schemas ---

class TarotCardModel(BaseModel):
    id: int
    name: str
    arcana: str # "Major Arcana" or "Minor Arcana"
    suit: Optional[str] = None # "Wands", "Cups", "Swords", "Pentacles"
    number: int
    element: str # "Fire", "Water", "Air", "Earth", "Spirit"
    astrology: str
    upright_keywords: List[str]
    reversed_keywords: List[str]
    upright_meaning: str
    reversed_meaning: str
    symbolism: str
    image_url: str

class CardDrawn(BaseModel):
    position_index: int
    position_name: str
    card: TarotCardModel
    is_reversed: bool
    position_interpretation: str

class TarotSpreadRequest(BaseModel):
    spread_type: str # "Single Card Reading", "Three Card Reading", "Relationship Spread", "Career Spread", "Celtic Cross Spread", "Life Path Spread"
    deck_style: str = "Classic Rider-Waite" # "Classic Rider-Waite", "Mystic Celestial", "Arcane Ethereal", "Modern Minimalist"
    question: Optional[str] = "What guidance does the cosmos offer me today?"
    category_focus: Optional[str] = "General"
    preselected_card_ids: Optional[List[int]] = None
    preselected_reversals: Optional[List[bool]] = None

class TarotReadingResult(BaseModel):
    id: str
    timestamp: str
    spread_type: str
    deck_style: str
    question: str
    cards_drawn: List[CardDrawn]
    relevance_score: float # 0 - 100 (Tarot Interpretation Relevance for scoring)
    spread_synthesis: str
    key_themes: List[str]

# --- Spiritual Guidance Scoring Breakdown ---

class GuidanceScoringBreakdown(BaseModel):
    palm_analysis_confidence: float # 30% weight
    tarot_interpretation_relevance: float # 25% weight
    personality_alignment: float # 20% weight
    user_context_relevance: float # 15% weight
    reading_consistency: float # 10% weight
    overall_insight_score: float # Weighted combined score
    guidance_relevance_score: float
    self_development_score: float
    reading_confidence_score: float

# --- Synthesized Multi-Modal Reading ---

class SynthesizedReadingRequest(BaseModel):
    palm_reading_id: Optional[str] = None
    tarot_reading_id: Optional[str] = None
    palm_request: Optional[PalmAnalysisRequest] = None
    tarot_request: Optional[TarotSpreadRequest] = None
    seeker_notes: Optional[str] = None
    life_focus: Optional[str] = "Personal Growth & Destiny"

class SynthesizedReadingResult(BaseModel):
    id: str
    user_id: str
    timestamp: str
    palm_data: Optional[Dict[str, Any]] = None
    tarot_data: Optional[Dict[str, Any]] = None
    scoring_breakdown: GuidanceScoringBreakdown
    cross_modality_synthesis: str
    insights_by_category: Dict[str, str] # Personality, Relationships, Career, Finance, Health & Wellness, Personal Growth, Life Opportunities
    personality_profile: Dict[str, Any]
    life_trend_forecast: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    affirmed_guidance: str

# --- Life Trends & Personality Schemas ---

class PersonalityProfileResponse(BaseModel):
    archetype_title: str
    element_balance: Dict[str, float] # Fire, Earth, Air, Water
    spiritual_big_five: Dict[str, float] # Intuition, Emotional Depth, Ambition Drive, Groundedness, Cosmic Openness
    core_strengths: List[str]
    growth_edges_weaknesses: List[str]
    behavioral_style: str
    cognitive_style: str
    recommended_growth_paths: List[str]

class LifeTrendResponse(BaseModel):
    life_path_overview: str
    biorhythm_cycles: Dict[str, float] # Spiritual, Intuitive, Vitality, Material
    forecast_30_days: Dict[str, str]
    forecast_90_days: Dict[str, str]
    forecast_6_months: Dict[str, str]
    forecast_1_year: Dict[str, str]
    opportunities: List[str]
    challenges: List[str]
    growth_potential_index: float

# --- Recommendation Schemas ---

class RecommendationItem(BaseModel):
    category: str # "Personal Growth", "Relationships", "Career", "Goal Alignment", "Spiritual Development"
    title: str
    description: str
    action_steps: List[str]
    affirmation: str
    ritual_or_exercise: str
    crystals_colors_focus: str

# --- Notification Schemas ---

class NotificationItem(BaseModel):
    id: str
    user_id: str
    type: str # "daily_guidance", "reading_reminder", "insight_update", "spiritual_growth", "platform_announcement"
    title: str
    message: str
    timestamp: str
    read: bool = False
    action_url: Optional[str] = None
