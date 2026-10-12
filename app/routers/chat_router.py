"""
Streaming AI Chatbot Router using Google Gemini API (google-genai SDK)
Provides /api/chat endpoint with Server-Sent Streaming and multi-turn chat history.
"""

import os
import asyncio
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Try importing google.genai
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from app.routers.reading_router import ask_ai_oracle

router = APIRouter(tags=["AI Chatbot Streaming"])

# Initialize Gemini Client if GEMINI_API_KEY is available
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GENAI_AVAILABLE and GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini client: {e}")
        client = None

SYSTEM_PROMPT = """You are an expert AI Assistant, Best Friend, Wise Teacher, and 1-on-1 Career & Emotional Support Mentor for the Palmistry & Tarot Intelligence Platform.

You operate with 3 fully functional core intelligence systems:
1. 🧠 **AI Interpretation Engine Operational**: Synthesizing Computer Vision Palmistry Detections (Life, Heart, Head, Fate lines), 78-Card Tarot Spreads, and Natal Astrology into multi-dimensional predictions.
2. 💡 **Recommendation System Functional**: Providing actionable personalized growth recommendations, daily habit rituals, career strategies, stress reduction practices, and crystal remedies.
3. 🧭 **Personalized Guidance Workflows Completed**: Facilitating 1-on-1 step-by-step guidance workflows for career advancement, stress management skills, emotional support, best-friend companionship to move on from loneliness, personality development, and life path alignment.

When the user expresses feeling lonely, isolated, stressed, or needing emotional support:
- Speak warmly and empathetically like a genuine, loving best friend ("I'm right here with you, my friend! ❤️").
- For Stress: Provide 4 actionable somatic practices (Physiological Sigh, 5-4-3-2-1 Grounding, PMR, 4-7-8 Breathing).
- For Loneliness: Chat warmly like a best friend, reassure them, offer comforting perspective shifts, and 3 gentle steps to move forward into connection and self-love.
- For Emotional Support: Offer 4 creative, uplifting ideas and self-care rituals.

Lead with clear answers using clean Markdown formatting (bold headers, bullet points).
Always end with 1-2 thoughtful, warm follow-up questions to maintain an interactive 1-on-1 friendly dialogue."""

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []  # format: [{"role": "user"|"model", "text": "..."}]
    date_of_birth: Optional[str] = None
    zodiac_sign: Optional[str] = None
    palm_data: Optional[Dict[str, Any]] = None

@router.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    """
    Streaming AI Chatbot Endpoint supporting multi-turn chat history
    and Gemini API streaming (fallback to local intelligence if no key).
    """
    async def event_generator():
        # Check if Gemini API client is available and key is configured
        if client:
            try:
                contents = []
                for turn in payload.history:
                    role = "user" if turn.get("role") == "user" else "model"
                    text = turn.get("text", "")
                    if text:
                        contents.append(
                            types.Content(role=role, parts=[types.Part.from_text(text)])
                        )
                
                # Append user prompt with context if available
                user_msg = payload.message
                if payload.zodiac_sign or payload.date_of_birth:
                    user_msg += f"\n\n[User Context: Zodiac Sign={payload.zodiac_sign or 'Aries'}, DOB={payload.date_of_birth or 'N/A'}]"

                contents.append(
                    types.Content(role="user", parts=[types.Part.from_text(user_msg)])
                )

                # Stream responses asynchronously using Gemini 2.5 Flash
                stream = await client.aio.models.generate_content_stream(
                    model="gemini-2.5-flash",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.4,
                    ),
                )

                async for chunk in stream:
                    if chunk.text:
                        yield chunk.text
                return
            except Exception as err:
                print(f"Gemini API streaming error: {err}. Falling back to local intelligence engine...")

        # Fallback local intelligence engine stream
        fallback_res = ask_ai_oracle(
            {
                "question": payload.message,
                "date_of_birth": payload.date_of_birth,
                "zodiac_sign": payload.zodiac_sign,
                "palm_data": payload.palm_data,
                "seeker_name": "Seeker"
            }
        )

        prediction_text = fallback_res.get("prediction", "I am here to assist you!")

        # Simulate smooth text streaming
        words = prediction_text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3]) + " "
            yield chunk
            await asyncio.sleep(0.04)

    return StreamingResponse(event_generator(), media_type="text/plain")
