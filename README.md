# Palmistry & Tarot Intelligence Platform

An enterprise-grade, AI-powered spiritual intelligence platform that harmonizes **Computer Vision Palm Analysis** and **78-Card Tarot Divination** to generate personalized spiritual insights, personality profiling, life trend forecasting, and actionable personal growth blueprints.

---

## 🌟 Key Capabilities & Implemented Modules

1. **User Authentication & Role-Based Access Control (RBAC)**:
   - Secure JWT token authentication with 4 roles: `User` (Seeker), `Tarot Reader`, `Spiritual Consultant`, `Administrator`.
   - Seamless role-switching bar with pre-configured seed accounts.
2. **User Profile Management**:
   - Custom spiritual goals, reading preferences, age group, and session history tracking.
3. **Computer Vision Palm Analysis Engine**:
   - Extraction of the **5 Core Lines**: *Life Line*, *Head Line*, *Heart Line*, *Fate Line*, and *Sun Line*.
   - Morphological edge gradients & **4 Elemental Hand Shape Classifications** (*Earth*, *Air*, *Fire*, *Water* hands).
   - **7 Planetary Mounts**: Jupiter, Saturn, Apollo/Sun, Mercury, Venus, Moon/Luna, and Mars.
   - Interactive HTML5 canvas & SVG line overlays with toggleable masks and confidence gauges.
4. **Full 78-Card Tarot Reading Engine**:
   - Complete 78-card deck (22 Major Arcana + 56 Minor Arcana across Wands, Cups, Swords, Pentacles).
   - 4 Deck Aesthetics: *Classic Rider-Waite*, *Mystic Celestial*, *Arcane Ethereal*, *Modern Minimalist*.
   - 3D tactile card shuffling and flip animations with upright and reversal mechanics.
   - **6 Specialized Spreads**:
     1. `Single Card Reading` (1 Card — Daily focus)
     2. `Three Card Reading` (3 Cards — Past / Present / Future)
     3. `Relationship Spread` (5 Cards — Soul bond & hidden friction)
     4. `Career Spread` (5 Cards — Professional growth & trajectory)
     5. `Celtic Cross Spread` (10 Cards — Master multi-dimensional view)
     6. `Life Path Spread` (7 Cards — Soul essence & life calling)
5. **AI Cross-Modality Interpretation & Synthesis Engine**:
   - Deep cross-modality synthesis linking palm mount vigor with tarot archetypes across **7 Life Categories**:
     - *Personality*, *Relationships*, *Career*, *Finance*, *Health & Wellness*, *Personal Growth*, *Life Opportunities*.
6. **Spiritual Guidance Weighted Scoring Model**:
   - Exact mathematical implementation of the specification formula:
     $$\text{Insight Score} = 0.30 \times \text{PalmConf} + 0.25 \times \text{TarotRel} + 0.20 \times \text{PersonalityAlign} + 0.15 \times \text{UserContext} + 0.10 \times \text{Consistency}$$
7. **Personality & Life Trend Observatory**:
   - Big Five Spiritual Quotient Radar Chart (Chart.js), 4-Element Balance Meters.
   - 30-Day, 90-Day, 6-Month, and 1-Year Life Trend timeline projections.
   - Astronomical Biorhythm cycles (Intuition, Emotional, Vitality, Material).
8. **Recommendation & Ritual Engine**:
   - Step-by-step action plans, crystal/color correspondences, affirmations, and meditation prompts.
9. **4 Dedicated Role Dashboards**:
   - **Seeker (User)**: Reading logs, spiritual streak, active goals.
   - **Tarot Reader**: Client session queue, archetype draw frequency heatmaps, reader notes.
   - **Spiritual Consultant**: Cohort seeker trend monitoring, guidance effectiveness (+18.4%), growth velocity.
   - **Administrator**: Platform health, active AI models, User RBAC management, security audit logs.
10. **Reports & Export System**:
    - **PDF Export**: Download styled, multi-page PDF reports via ReportLab.
    - **Excel Export**: Multi-tab formatted `.xlsx` workbooks via openpyxl.
11. **Notification & Engagement System**:
    - Unread alert drawer, daily wisdom trigger simulation, spiritual milestone badges.

---

## 🚀 Quick Start Guide

### 1. Local Run
```powershell
# Navigate to the project root
cd "C:\Users\IT LAB-1\.gemini\antigravity\scratch\palmistry_tarot_platform"

# Run tests
python -m pytest tests/ -v

# Start application server
python run.py
```
Open your browser at **`http://127.0.0.1:8000`** to access the web application, or **`http://127.0.0.1:8000/docs`** for the OpenAPI Swagger interface.

---

### 2. Seed Test Credentials

| Role | Email | Password | Persona |
| :--- | :--- | :--- | :--- |
| **User (Seeker)** | `user@mystic.io` | `password123` | Aria Solstice |
| **Tarot Reader** | `reader@mystic.io` | `password123` | Madame Seraphina |
| **Spiritual Consultant** | `consultant@mystic.io` | `password123` | Zachary Vance |
| **Administrator** | `admin@mystic.io` | `password123` | Grand Sovereign Admin |

---

### 3. Docker Deployment
```bash
docker build -t palmistry-tarot-platform .
docker run -p 8000:8000 palmistry-tarot-platform
# Or via docker-compose:
docker-compose up -d
```


---

## Quick Start (Windows)

1. Install Python 3.10 or newer.
2. Open a terminal in the project root (the folder containing `run.py`).
3. Create and activate a virtual environment:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

4. Install dependencies:

   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. Start the application:

   ```powershell
   python run.py
   ```

6. Open `http://127.0.0.1:8000`. API documentation is available at
   `http://127.0.0.1:8000/docs`; the health endpoint is `/health`.

## Demo Account

- Seeker: `user@mystic.io` / `SeekerPass2026!`
- Tarot Reader: `reader@mystic.io` / `ReaderPass2026!`
- Spiritual Consultant: `consultant@mystic.io` / `ConsultantPass2026!`
- Administrator: `admin@mystic.io` / `AdminPass2026!`

Use demo accounts only for local demonstration. Do not expose these credentials on a public deployment.

## Project Structure

- `app/routers/` — API route handlers
- `app/services/` — application and analysis logic
- `app/models/` — request/response schemas
- `static/index.html` — frontend entry page
- `static/css/` and `static/js/` — frontend styles and interactions
- `static/assets/tarot/` — tarot card artwork
- `data/` — sample datasets and local JSON persistence
- `requirements.txt` — Python dependencies
- `run.py` — local development entry point

## Important Before Public Deployment

- Set a strong, unique `SECRET_KEY` environment variable; the built-in fallback is for local development only.
- Replace the JSON-file database with a production database before supporting concurrent or real users.
- Configure `ALLOWED_ORIGINS` to the exact frontend origins you trust.
- The OAuth endpoint is a demo simulation; it does not validate provider tokens with Google or another identity provider.
- Palmistry, tarot, astrology, and personality outputs should be presented as reflective/entertainment guidance, not scientific predictions or medical, legal, or financial advice.

## Verification Notes

This archive was reviewed for project layout and obvious configuration/documentation mismatches. Install dependencies and run the app locally to verify the complete user flow, because runtime behavior depends on your Python environment and local data.
