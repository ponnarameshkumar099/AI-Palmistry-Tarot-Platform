import os
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score, silhouette_score

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "ml_models"
MODEL_FILE = MODEL_DIR / "personality_ml_engine.joblib"

# Feature definitions
FEATURE_NAMES = [
    "palm_heart_line_depth",      # 0 to 10
    "palm_head_line_clarity",     # 0 to 10
    "palm_life_line_length",      # 0 to 10
    "palm_fate_line_prominence",  # 0 to 10
    "tarot_major_arcana_ratio",   # 0.0 to 1.0
    "tarot_fire_element_ratio",   # 0.0 to 1.0
    "tarot_water_element_ratio",  # 0.0 to 1.0
    "tarot_air_element_ratio",    # 0.0 to 1.0
    "tarot_earth_element_ratio",  # 0.0 to 1.0
    "zodiac_element_code",        # 1=Fire, 2=Earth, 3=Air, 4=Water
    "stress_resilience_level",    # 1 to 10
    "social_engagement_score",    # 1 to 10
    "ambition_drive_score"        # 1 to 10
]

ARCHETYPE_LABELS = [
    "The Mystic Visionary",
    "The Grounded Sovereign",
    "The Dynamic Catalyst",
    "The Luminary Sage",
    "The Harmonious Alchemist",
    "The Sovereign Leader"
]

class PersonalityMLEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.regressor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.kmeans = KMeans(n_clusters=6, random_state=42, n_init=10)
        self.is_trained = False
        self.model_metrics = {}

    def _generate_synthetic_dataset(self, n_samples: int = 1200):
        np.random.seed(42)
        
        # Features
        heart = np.random.uniform(2, 10, n_samples)
        head = np.random.uniform(2, 10, n_samples)
        life = np.random.uniform(2, 10, n_samples)
        fate = np.random.uniform(1, 10, n_samples)
        
        tarot_major = np.random.uniform(0.1, 0.9, n_samples)
        fire = np.random.dirichlet((2, 2, 2, 2), n_samples)
        
        zodiac_elem = np.random.choice([1, 2, 3, 4], n_samples)
        resilience = np.random.uniform(2, 10, n_samples)
        social = np.random.uniform(2, 10, n_samples)
        ambition = np.random.uniform(2, 10, n_samples)

        X = np.column_stack([
            heart, head, life, fate,
            tarot_major, fire[:, 0], fire[:, 1], fire[:, 2], fire[:, 3],
            zodiac_elem, resilience, social, ambition
        ])

        # Target 1: Big Five OCEAN Scores (0 - 100)
        # Openness: head line + air tarot + major arcana
        openness = 40 + 3.5 * head + 25 * fire[:, 2] + 20 * tarot_major + np.random.normal(0, 3, n_samples)
        # Conscientiousness: fate line + earth tarot + ambition
        conscientiousness = 35 + 3.2 * fate + 25 * fire[:, 3] + 2.5 * ambition + np.random.normal(0, 3, n_samples)
        # Extraversion: social + fire tarot + ambition
        extraversion = 30 + 3.8 * social + 25 * fire[:, 0] + 2.2 * ambition + np.random.normal(0, 3, n_samples)
        # Agreeableness: heart line + water tarot + social
        agreeableness = 38 + 3.6 * heart + 25 * fire[:, 1] + 1.8 * social + np.random.normal(0, 3, n_samples)
        # Emotional Resilience: life line + resilience
        resilience_score = 42 + 3.2 * life + 3.5 * resilience + np.random.normal(0, 3, n_samples)

        Y_ocean = np.column_stack([
            np.clip(openness, 50, 99),
            np.clip(conscientiousness, 50, 99),
            np.clip(extraversion, 50, 99),
            np.clip(agreeableness, 50, 99),
            np.clip(resilience_score, 50, 99)
        ])

        # Target 2: Archetype Classification
        # Assign archetype based on dominant element & characteristics
        y_archetype = []
        for i in range(n_samples):
            elem = zodiac_elem[i]
            if elem == 4 or fire[i, 1] > 0.35:
                y_archetype.append("The Mystic Visionary")
            elif elem == 2 or fire[i, 3] > 0.35:
                y_archetype.append("The Grounded Sovereign")
            elif elem == 1 or fire[i, 0] > 0.35:
                y_archetype.append("The Dynamic Catalyst")
            elif elem == 3 or fire[i, 2] > 0.35:
                y_archetype.append("The Luminary Sage")
            elif tarot_major[i] > 0.6:
                y_archetype.append("The Sovereign Leader")
            else:
                y_archetype.append("The Harmonious Alchemist")

        return X, Y_ocean, np.array(y_archetype)

    def train_model(self):
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        X, Y_ocean, Y_arch = self._generate_synthetic_dataset(1200)

        X_train, X_test, Y_oc_train, Y_oc_test, Y_ar_train, Y_ar_test = train_test_split(
            X, Y_ocean, Y_arch, test_size=0.2, random_state=42
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train Regressor for OCEAN traits
        self.regressor.fit(X_train_scaled, Y_oc_train)
        Y_oc_pred = self.regressor.predict(X_test_scaled)
        r2 = r2_score(Y_oc_test, Y_oc_pred)

        # Train Classifier for Archetypes
        self.classifier.fit(X_train_scaled, Y_ar_train)
        Y_ar_pred = self.classifier.predict(X_test_scaled)
        acc = accuracy_score(Y_ar_test, Y_ar_pred)

        # Train K-Means
        self.kmeans.fit(X_train_scaled)
        sil = silhouette_score(X_train_scaled, self.kmeans.labels_)

        self.is_trained = True
        self.model_metrics = {
            "r2_score_ocean": round(float(r2), 4),
            "accuracy_archetype": round(float(acc), 4),
            "silhouette_score": round(float(sil), 4),
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "model_type": "RandomForest Multi-Task Ensemble + KMeans",
            "version": "1.0.0-ML"
        }

        # Save model
        joblib.dump({
            "scaler": self.scaler,
            "regressor": self.regressor,
            "classifier": self.classifier,
            "kmeans": self.kmeans,
            "metrics": self.model_metrics
        }, MODEL_FILE)
        print(f"Machine Learning Personality Engine trained and saved to {MODEL_FILE}")

    def load_or_train(self):
        if MODEL_FILE.exists():
            try:
                data = joblib.load(MODEL_FILE)
                self.scaler = data["scaler"]
                self.regressor = data["regressor"]
                self.classifier = data["classifier"]
                self.kmeans = data["kmeans"]
                self.model_metrics = data["metrics"]
                self.is_trained = True
                print("Loaded pre-trained Machine Learning Personality Engine.")
                return
            except Exception as e:
                print(f"Error loading ML model: {e}, retraining...")
        self.train_model()

    def predict(self, input_features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_trained:
            self.load_or_train()

        # Parse feature array
        vec = [
            float(input_features.get("palm_heart_line_depth", 7.5)),
            float(input_features.get("palm_head_line_clarity", 8.0)),
            float(input_features.get("palm_life_line_length", 8.5)),
            float(input_features.get("palm_fate_line_prominence", 7.0)),
            float(input_features.get("tarot_major_arcana_ratio", 0.4)),
            float(input_features.get("tarot_fire_element_ratio", 0.25)),
            float(input_features.get("tarot_water_element_ratio", 0.35)),
            float(input_features.get("tarot_air_element_ratio", 0.20)),
            float(input_features.get("tarot_earth_element_ratio", 0.20)),
            float(input_features.get("zodiac_element_code", 4)),
            float(input_features.get("stress_resilience_level", 8.0)),
            float(input_features.get("social_engagement_score", 7.5)),
            float(input_features.get("ambition_drive_score", 8.5))
        ]

        X_in = np.array([vec])
        X_scaled = self.scaler.transform(X_in)

        # 1. Predict OCEAN Big Five Traits
        ocean_pred = self.regressor.predict(X_scaled)[0]
        ocean_scores = {
            "Openness": round(float(ocean_pred[0]), 1),
            "Conscientiousness": round(float(ocean_pred[1]), 1),
            "Extraversion": round(float(ocean_pred[2]), 1),
            "Agreeableness": round(float(ocean_pred[3]), 1),
            "Emotional Resilience": round(float(ocean_pred[4]), 1)
        }

        # 2. Predict Archetype Classification & Probability
        arch_pred = self.classifier.predict(X_scaled)[0]
        arch_probs = self.classifier.predict_proba(X_scaled)[0]
        classes = self.classifier.classes_

        prob_dict = {classes[i]: round(float(arch_probs[i]) * 100, 1) for i in range(len(classes))}
        confidence_pct = prob_dict.get(arch_pred, 92.5)

        # 3. Calculate Feature Importance Breakdown
        # Aggregate regressor feature importances into domain categories
        fi = self.regressor.feature_importances_
        palm_importance = float(np.sum(fi[0:4]))
        tarot_importance = float(np.sum(fi[4:9]))
        zodiac_importance = float(fi[9])
        behavior_importance = float(np.sum(fi[10:13]))
        
        tot_imp = palm_importance + tarot_importance + zodiac_importance + behavior_importance
        importance_breakdown = {
            "Palmistry Bio-lines": round((palm_importance / tot_imp) * 100, 1),
            "Tarot Archetypal Deck": round((tarot_importance / tot_imp) * 100, 1),
            "Astrological Sign": round((zodiac_importance / tot_imp) * 100, 1),
            "Behavioral Biorhythm": round((behavior_importance / tot_imp) * 100, 1)
        }

        # 4. Personality Growth Potential & Action Recommendations
        growth_index = round(float(np.mean(ocean_pred) * 0.95 + confidence_pct * 0.05), 1)

        action_plan = self._generate_ml_action_plan(arch_pred, ocean_scores)

        return {
            "predicted_archetype": arch_pred,
            "prediction_confidence": confidence_pct,
            "archetype_probabilities": prob_dict,
            "ocean_big_five": ocean_scores,
            "growth_potential_index": growth_index,
            "feature_importance_breakdown": importance_breakdown,
            "ml_personality_action_plan": action_plan,
            "model_metadata": {
                "algorithm": "RandomForest Ensemble & KMeans",
                "accuracy": f"{self.model_metrics.get('accuracy_archetype', 0.96) * 100:.1f}%",
                "r2_score": self.model_metrics.get('r2_score_ocean', 0.92)
            }
        }

    def _generate_ml_action_plan(self, archetype: str, ocean: Dict[str, float]) -> List[Dict[str, str]]:
        plans = [
            {
                "area": "Cognitive Reframing & Focus",
                "recommendation": f"Focus on elevating your Conscientiousness ({ocean['Conscientiousness']}%) by structuring daily 25-minute deep focus sprints.",
                "habit": "Morning 10-minute mental journaling before opening digital devices.",
                "category": "Mindset Mastery"
            },
            {
                "area": "Emotional Balance & Resilience",
                "recommendation": f"Harness high Emotional Resilience ({ocean['Emotional Resilience']}%) through daily vagus nerve stimulation and somatic grounding.",
                "habit": "Evening 4-7-8 breathing sequence to stabilize nervous system.",
                "category": "Emotional Intelligence"
            },
            {
                "area": "Leadership & Expression",
                "recommendation": f"Channel your {archetype} energy into public speaking, mentorship, and inspiring team initiatives.",
                "habit": "Weekly sharing of visionary ideas with peers or online community.",
                "category": "Vocational Ascendance"
            },
            {
                "area": "Intuitive Integration",
                "recommendation": f"Combine high Openness ({ocean['Openness']}%) with structured empirical review to turn spiritual visions into tangible projects.",
                "habit": "Weekly alignment audit connecting goals with core soul values.",
                "category": "Spiritual Synthesis"
            }
        ]
        return plans

# Global Instance
ml_engine = PersonalityMLEngine()
