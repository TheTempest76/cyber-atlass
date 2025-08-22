"""
FastAPI app that:
- Loads fingerprints (from your dataset JSON) at startup
- Classifies a small batch of messages (5–10 typical) via FingerprintClassifier
- Blends final risk with RiskAssessor
- Returns per-message results and a batch SRI

Run:
    uvicorn main:app --reload

Swagger UI:
    http://127.0.0.1:8000/docs
"""

from typing import List, Optional, Any, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from fingerprinting import FingerprintSet, FingerprintClassifier
from risk_assessor import RiskAssessor, scam_risk_index

# -------------------------
# Config
# -------------------------
FINGERPRINTS_PATH = "data.json"   # <-- your JSON (list-of-dicts) dataset path
FINGERPRINTS_VERSION = "v1"       # version label you want to attach

# -------------------------
# App + models
# -------------------------
app = FastAPI(title="Scam Fingerprinting + Risk API", version="1.0.0")

class AnalyzeRequest(BaseModel):
    messages: List[str] = Field(..., min_items=1, max_items=50, description="Messages to analyze (5–10 typical).")
    # If you later have an ML model on the backend, you can pass precomputed ml_probs here (optional)
    ml_probs: Optional[List[Optional[float]]] = Field(
        None, description="Optional per-message ML probabilities in [0,1] (same length as messages)."
    )

class MessageResult(BaseModel):
    scam_type: Optional[str]
    score: float
    prob: float
    why: List[List[Any]]
    slots: Dict[str, Optional[str]]
    final_risk: float
    risk_label: str

class AnalyzeResponse(BaseModel):
    version: str
    count: int
    sri: float
    results: List[MessageResult]


# -------------------------
# Startup: load fingerprints & init engines
# -------------------------
clf: Optional[FingerprintClassifier] = None
assessor: Optional[RiskAssessor] = None

@app.on_event("startup")
def _startup() -> None:
    global clf, assessor
    try:
        fps = FingerprintSet.from_json_file(FINGERPRINTS_PATH, version=FINGERPRINTS_VERSION)
    except Exception as e:
        raise RuntimeError(f"Failed to load fingerprints from {FINGERPRINTS_PATH}: {e}")

    clf = FingerprintClassifier(fps)
    assessor = RiskAssessor()  # default weights: rule=0.35, ml=0.5, url=0.15


# -------------------------
# Health
# -------------------------
@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


# -------------------------
# Analyze (batch)
# -------------------------
@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze 1..50 messages (5–10 typical).
    - Uses FingerprintClassifier to get rule_prob + why.
    - Optionally blends in provided ML probabilities (req.ml_probs).
    - Returns per-message results + SRI.
    """
    if clf is None or assessor is None:
        raise HTTPException(status_code=500, detail="Service not initialized")

    messages = req.messages
    ml_probs = req.ml_probs or [None] * len(messages)

    if len(ml_probs) != len(messages):
        raise HTTPException(status_code=400, detail="ml_probs (if provided) must match messages length")

    results: List[MessageResult] = []
    risks: List[float] = []

    for msg, mlp in zip(messages, ml_probs):
        # 1) Rule-based classification from fingerprints
        result = clf.classify(msg)   # -> {scam_type, score, prob, why, slots}

        rule_prob = float(result["prob"])

        # 2) Blend final risk (ML prob optional; url_risk omitted for now)
        final = assessor.combine(rule_prob=rule_prob, ml_prob=mlp, url_risk=None)
        label = assessor.label_from_score(final)

        out = MessageResult(
            scam_type=result["scam_type"],
            score=float(result["score"]),
            prob=rule_prob,
            why=[[feat, weight] for feat, weight in result["why"]],
            slots=result["slots"],
            final_risk=float(final),
            risk_label=label,
        )
        results.append(out)
        risks.append(final)

    # 3) Compute a small-batch SRI for the set (useful summary for 5–10 msgs)
    sri = scam_risk_index(risks)

    return AnalyzeResponse(
        version=FINGERPRINTS_VERSION,
        count=len(results),
        sri=sri,
        results=results,
    )
