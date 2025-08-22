"""
riskassessor.py
---------------
Ensemble-style risk scoring + (optional) ML baseline.

What this file does:
1) Provides a simple **RiskAssessor** that blends:
   - rule_prob  (from fingerprinting.py)
   - ml_prob    (from a text classifier you can train on SMS/email datasets)
   - url_risk   (optional small URL/domain risk score, default 0)

2) Offers a lightweight **MLTextModel** wrapper around scikit-learn
   (TF-IDF + LogisticRegression) for quick training/inference.
   - If you don't want sklearn now, you can skip using MLTextModel and pass ml_prob=None.

3) Computes a small-batch **Scam Risk Index (SRI)** for 5–10 messages.

Keep it simple. You can swap in a stronger model (DistilBERT, etc.) later and
still use the same `RiskAssessor.combine()` interface.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Dict, Any, Tuple

# --- Optional ML baseline (scikit-learn). You can ignore if you don't need it now. ---
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    from sklearn.calibration import CalibratedClassifierCV
    import joblib  # for save/load
    _HAS_SKLEARN = True
except Exception:
    _HAS_SKLEARN = False


@dataclass
class RiskWeights:
    """
    Blend weights for final risk. Tunable.
    Start with these and adjust via a small validation set.
    """
    rule: float = 0.35
    ml: float = 0.5
    url: float = 0.15


class RiskAssessor:
    """
    Combine rule-based probability, ML probability, and (optional) URL/domain risk
    into a single final risk in [0..1].
    """

    def __init__(self, weights: RiskWeights = RiskWeights()):
        self.w = weights

    def combine(self, rule_prob: float, ml_prob: Optional[float] = None, url_risk: Optional[float] = None) -> float:
        """
        rule_prob: float in [0,1] from FingerprintClassifier.score_to_probability(score)
        ml_prob:   float in [0,1] from your ML model (or None if not used yet)
        url_risk:  float in [0,1] from a URL risk model (or None)
        """
        rp = float(max(0.0, min(1.0, rule_prob)))
        mp = float(max(0.0, min(1.0, ml_prob))) if ml_prob is not None else 0.0
        ur = float(max(0.0, min(1.0, url_risk))) if url_risk is not None else 0.0

        score = self.w.rule * rp + self.w.ml * mp + self.w.url * ur
        # Clamp just in case of floating errors.
        return max(0.0, min(1.0, score))

    @staticmethod
    def label_from_score(score: float) -> str:
        """
        Simple bands you can tweak for UX:
          High   >= 0.80
          Medium >= 0.60
          Low    else
        """
        if score >= 0.80:
            return "High"
        if score >= 0.60:
            return "Medium"
        return "Low"


def scam_risk_index(risks: List[float]) -> float:
    """
    Small-batch SRI (Scam Risk Index) suitable for 5–10 messages.

    SRI = 100 * (0.5*mean + 0.3*95th_percentile + 0.2*fraction_over_0.8)

    Returns a number in [0..100].
    """
    if not risks:
        return 0.0

    xs = sorted(max(0.0, min(1.0, float(r))) for r in risks)
    n = len(xs)
    mean = sum(xs) / n
    p95 = xs[min(n - 1, int(0.95 * (n - 1)))]
    frac80 = sum(1 for r in xs if r >= 0.8) / n

    sri = 100.0 * (0.5 * mean + 0.3 * p95 + 0.2 * frac80)
    return round(sri, 2)


# -------------------------------
# Optional: quick ML text model
# -------------------------------

class MLTextModel:
    """
    Minimal scikit-learn pipeline:
      TF-IDF (char+word) -> LogisticRegression (calibrated)

    Usage:
        model = MLTextModel()                         # create
        model.fit(train_texts, train_labels)          # labels: 1=scam, 0=not scam
        probs = model.predict_proba(["sample text"])  # returns list of floats in [0,1]
        model.save("risk_model.joblib")               # optional
        model = MLTextModel.load("risk_model.joblib")

    Notes:
      - Requires scikit-learn + joblib.
      - CalibratedClassifierCV improves probability quality for blending.
    """

    def __init__(self):
        if not _HAS_SKLEARN:
            raise ImportError("scikit-learn is not installed. Install with: pip install scikit-learn joblib")

        # Char n-grams help with noisy text (misspellings, numbers).
        self.pipeline: Pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                lowercase=True,
                strip_accents="unicode",
                analyzer="char_wb",
                ngram_range=(3, 5),
                min_df=2
            )),
            ("clf", CalibratedClassifierCV(
                base_estimator=LogisticRegression(
                    max_iter=1000,
                    solver="liblinear",
                    class_weight="balanced"
                ),
                cv=3,  # 3-fold calibration
                method="isotonic"
            ))
        ])

    def fit(self, texts: List[str], labels: List[int]) -> None:
        self.pipeline.fit(texts, labels)

    def predict_proba(self, texts: List[str]) -> List[float]:
        # Returns probability of class 1 (scam)
        proba = self.pipeline.predict_proba(texts)
        return [float(p[1]) for p in proba]

    def save(self, path: str) -> None:
        joblib.dump(self.pipeline, path)

    @staticmethod
    def load(path: str) -> "MLTextModel":
        if not _HAS_SKLEARN:
            raise ImportError("scikit-learn is not installed. Install with: pip install scikit-learn joblib")
        m = MLTextModel.__new__(MLTextModel)
        m.pipeline = joblib.load(path)
        return m


# --- Quick demo of blending (remove or keep for local testing) ---
if __name__ == "__main__":
    # Example: combine a rule probability with an ML probability.
    assessor = RiskAssessor()

    # Pretend: rule-based engine said 0.91 (very scammy)
    rule_prob = 0.91

    # Pretend: ML model also thinks it's scammy (you would compute this with MLTextModel)
    ml_prob = 0.85

    # Optional URL risk (if you add a URL model later)
    url_risk = 0.40

    final = assessor.combine(rule_prob, ml_prob, url_risk)
    print(f"Final blended risk = {final:.3f}  Label: {assessor.label_from_score(final)}")

    # Session SRI for a tiny batch
    print("SRI for [0.2, 0.91, 0.75] =", scam_risk_index([0.2, 0.91, 0.75]))
