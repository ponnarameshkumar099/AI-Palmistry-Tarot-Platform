from typing import Dict, Any, Optional

def calculate_spiritual_guidance_score(
    palm_confidence: float = 92.5,
    tarot_relevance: float = 94.0,
    personality_alignment: float = 88.0,
    user_context_relevance: float = 90.0,
    reading_consistency: float = 91.5
) -> Dict[str, float]:
    """
    Computes the exact Weighted Scoring Model defined in the platform specifications:
    Insight Score = (Palm Analysis Confidence * 30%)
                  + (Tarot Interpretation Relevance * 25%)
                  + (Personality Alignment * 20%)
                  + (User Context Relevance * 15%)
                  + (Reading Consistency * 10%)
    """
    # Clamp inputs to valid range 0 - 100
    p_conf = max(0.0, min(100.0, palm_confidence))
    t_rel = max(0.0, min(100.0, tarot_relevance))
    pers_align = max(0.0, min(100.0, personality_alignment))
    u_context = max(0.0, min(100.0, user_context_relevance))
    r_cons = max(0.0, min(100.0, reading_consistency))

    # Exact weighted formula
    overall_insight_score = (
        (p_conf * 0.30) +
        (t_rel * 0.25) +
        (pers_align * 0.20) +
        (u_context * 0.15) +
        (r_cons * 0.10)
    )

    # Derived qualitative sub-scores for deep reporting
    guidance_relevance = (t_rel * 0.5) + (u_context * 0.5)
    self_development = (pers_align * 0.6) + (r_cons * 0.4)
    reading_confidence = (p_conf * 0.6) + (t_rel * 0.4)

    return {
        "palm_analysis_confidence": round(p_conf, 1),
        "tarot_interpretation_relevance": round(t_rel, 1),
        "personality_alignment": round(pers_align, 1),
        "user_context_relevance": round(u_context, 1),
        "reading_consistency": round(r_cons, 1),
        "overall_insight_score": round(overall_insight_score, 1),
        "guidance_relevance_score": round(guidance_relevance, 1),
        "self_development_score": round(self_development, 1),
        "reading_confidence_score": round(reading_confidence, 1)
    }
