"""
fingerprinting.py
-----------------
Explainable, rule-based "fingerprint" engine built from a list-of-dicts dataset.

This module is tailored for data shaped like:

[
  {
    "id": 1,
    "scam_type": "Phishing Scam (Link Sharing)",
    "message": "Your Axis account is at risk. Click here to verify your info: http://gade.org",
    "description": "...",
    "language": "English",
    "target_info_requested": "Bank login credentials",
    "medium": "WhatsApp"
  },
  ...
]

What it does:
1) Build per-scam_type "fingerprints" from your dataset by counting simple, human features
   (e.g., mentions_otp, has_url, asks_bank_details, etc.)
2) Classify a new message using transparent log-odds, returning:
   - predicted scam type
   - a "why" list of fired features
   - lightweight "slots" (amount/domain/phone) extracted for context/clustering
"""

from __future__ import annotations
import json
import math
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse
from collections import Counter, defaultdict


# ----------------------------
# Feature & slot extraction
# ----------------------------

URL_RE = re.compile(r"(https?://\S+)", re.IGNORECASE)
PHONE_RE = re.compile(r"(\+?91[\s-]?\d{10}|\b\d{10}\b)")
AMOUNT_RE = re.compile(r"(₹|\brs\.?)\s*\d[\d,]*", re.IGNORECASE)

STOPWORDS = set("""
a an the to of and or your you for from in on is are this that here now we our me my it's its
""".split())


def _normalize_rupee(text: str) -> str:
    # Fix mis-encoded rupee (â‚¹ -> ₹) if it ever appears.
    return text.replace("â‚¹", "₹")


def extract_features(text: str) -> Dict[str, bool]:
    """
    Turn raw text into an interpretable boolean feature vector.
    Keep features human-readable so explanations are easy to show in UI.
    """
    t = _normalize_rupee(text).lower()

    feats = {
        "has_url": bool(URL_RE.search(t)),
        "has_phone": bool(PHONE_RE.search(t)),
        "has_amount": bool(AMOUNT_RE.search(t)),

        "mentions_otp": "otp" in t,
        "mentions_refund": "refund" in t or "tax refund" in t,
        "mentions_loan": "loan" in t,
        "mentions_invest": "invest" in t or "crypto" in t,
        "mentions_teamviewer": "teamviewer" in t,
        "mentions_congratulations": "congratulations" in t,

        "mentions_prepay_or_fee": ("prepay" in t) or ("processing fee" in t) or ("registration fee" in t) or ("upfront" in t),
        "asks_bank_details": ("bank details" in t) or ("bank account" in t),
        "mentions_aadhaar": "aadhaar" in t,
        "mentions_upi": "upi" in t,

        # OTP hijack cue on WhatsApp-like texts:
        "friend_tone": ("hey, this is" in t) or ("hey, it's" in t),
        "urgency_markers": ("quickly" in t) or ("urgent" in t) or ("urgently" in t) or ("limited slots" in t),
        "click_here": "click here" in t,
    }
    return feats


def extract_slots(text: str) -> Dict[str, Optional[str]]:
    """
    Pull lightweight structured fields that help explanations & clustering.
    """
    tx = _normalize_rupee(text)
    slots: Dict[str, Optional[str]] = {"DOMAIN": None, "PHONE": None, "AMOUNT": None}

    m_url = URL_RE.search(tx)
    if m_url:
        try:
            parsed = urlparse(m_url.group(1))
            host = (parsed.netloc or "").lower()
            slots["DOMAIN"] = host[4:] if host.startswith("www.") else host
        except Exception:
            slots["DOMAIN"] = None

    m_phone = PHONE_RE.search(tx)
    if m_phone:
        slots["PHONE"] = m_phone.group(1)

    m_amt = AMOUNT_RE.search(tx)
    if m_amt:
        slots["AMOUNT"] = m_amt.group(0)

    return slots


def tokenize_words(text: str) -> List[str]:
    """
    Basic word tokenizer for keyword summaries.
    """
    t = re.sub(r"[^a-zA-Z]+", " ", _normalize_rupee(text)).lower()
    toks = [w for w in t.split() if w and w not in STOPWORDS and len(w) > 2]
    return toks


# ----------------------------
# Fingerprint structures
# ----------------------------

def _logit(p: float) -> float:
    """Safe log-odds for 0<p<1; clamp to avoid infinities."""
    p = max(min(p, 0.98), 0.02)
    return math.log(p / (1.0 - p))


@dataclass
class FingerprintItem:
    scamType: str
    featurePrevalence: Dict[str, float]  # feature -> prevalence in [0..1]
    topKeywords: List[str]


@dataclass
class FingerprintSet:
    version: str
    items: List[FingerprintItem]

    @staticmethod
    def from_records(records: List[Dict[str, Any]], version: str = "v1") -> "FingerprintSet":
        """
        Build fingerprints by grouping dataset rows by scam_type and averaging feature presence.
        Also collect top keywords (for human-readable summaries).
        """
        # Group messages by scam_type
        groups: Dict[str, List[str]] = defaultdict(list)
        for r in records:
            msg = str(r.get("message", "") or "")
            scam_type = str(r.get("scam_type", "") or "Unknown")
            if msg.strip():
                groups[scam_type].append(msg)

        items: List[FingerprintItem] = []

        for scam_type, msgs in groups.items():
            # Compute feature prevalence per feature
            feat_counts = Counter()
            all_feats_keys = set()
            for m in msgs:
                f = extract_features(m)
                all_feats_keys.update(f.keys())
                for k, v in f.items():
                    if v:
                        feat_counts[k] += 1
            n = len(msgs)
            prevalence = {k: (feat_counts.get(k, 0) / n) for k in sorted(all_feats_keys)}

            # Compute top keywords
            tokens: List[str] = []
            for m in msgs:
                tokens.extend(tokenize_words(m))
            top_kw = [w for w, _ in Counter(tokens).most_common(10)]

            items.append(FingerprintItem(scamType=scam_type,
                                         featurePrevalence=prevalence,
                                         topKeywords=top_kw))

        return FingerprintSet(version=version, items=items)

    @staticmethod
    def from_json_file(path: str, version: Optional[str] = None) -> "FingerprintSet":
        """
        Load list-of-dicts dataset from a JSON file and build fingerprints.
        """
        with open(path, "r", encoding="utf-8") as f:
            records = json.load(f)
        ver = version or "v1"
        return FingerprintSet.from_records(records, version=ver)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "version": self.version,
            "items": [
                {
                    "scamType": it.scamType,
                    "featurePrevalence": it.featurePrevalence,
                    "topKeywords": it.topKeywords,
                } for it in self.items
            ],
        }


class FingerprintClassifier:
    """
    Rule-based, explainable classifier using fingerprint prevalence.

    Scoring:
      For each scamType, sum log-odds(feature prevalence) of the features present in the message.
      This produces a transparent score; the features that fired are the "why".
    """

    def __init__(self, fp: FingerprintSet):
        self.fp = fp
        # Precompute per-class weights (log-odds) for speed.
        self._weights: Dict[str, Dict[str, float]] = {}
        for item in self.fp.items:
            w = {feat: _logit(p) for feat, p in item.featurePrevalence.items()}
            self._weights[item.scamType] = w

    def classify(self, message: str) -> Dict[str, Any]:
        """
        Returns:
        {
          "scam_type": str,
          "score": float,          # raw sum of log-odds
          "prob": float,           # sigmoid(score) in [0..1] (not calibrated)
          "why": List[(feature, weight)],
          "slots": {"DOMAIN":..., "PHONE":..., "AMOUNT":...}
        }
        """
        feats = extract_features(message)
        slots = extract_slots(message)

        best_type = None
        best_score = -1e9
        best_why: List[Tuple[str, float]] = []

        for item in self.fp.items:
            weights = self._weights.get(item.scamType, {})
            score = 0.0
            why: List[Tuple[str, float]] = []
            for feat, present in feats.items():
                if present:
                    w = weights.get(feat, 0.0)
                    if abs(w) > 0.01:
                        score += w
                        why.append((feat, round(w, 2)))
            if score > best_score:
                best_score = score
                best_type = item.scamType
                best_why = sorted(why, key=lambda x: -abs(x[1]))[:6]

        return {
            "scam_type": best_type,
            "score": best_score,
            "prob": self.score_to_probability(best_score),
            "why": best_why,
            "slots": slots,
        }

    @staticmethod
    def score_to_probability(score: float) -> float:
        """Map a log-odds-like sum into [0..1] via sigmoid (handy as rule_prob)."""
        try:
            return 1.0 / (1.0 + math.exp(-score))
        except OverflowError:
            return 1.0 if score > 0 else 0.0


# ----------------------------
# Quick usage demo
# ----------------------------
if __name__ == "__main__":
    # Example records (shortened). Replace with your full list or load from file:
    records = [
      {
        "id": 1,
        "scam_type": "Phishing Scam (Link Sharing)",
        "message": "Your Axis account is at risk. Click here to verify your info: http://gade.org",
        "description": "Phishing links mimic legitimate websites and trick users into submitting sensitive data.",
        "language": "English",
        "target_info_requested": "Bank login credentials",
        "medium": "WhatsApp"
      },
      {
        "id": 4,
        "scam_type": "WhatsApp Account Hacking Scam",
        "message": "Hey, this is Bhamini. I accidentally sent my OTP to your number. Can you send it to me quickly?",
        "description": "A scammer pretends to be a friend and tricks victims into sharing the OTP meant to hijack their WhatsApp account.",
        "language": "English",
        "target_info_requested": "OTP",
        "medium": "WhatsApp"
      }
    ]

    # 1) Build fingerprints from dataset
    fps = FingerprintSet.from_records(records, version="v1")

    # 2) Create classifier
    clf = FingerprintClassifier(fps)

    # 3) Classify a new message
    msg = "Hey, this is Samiha. I accidentally sent my OTP to your number. Can you send it to me quickly?"
    result = clf.classify(msg)
    print(json.dumps(result, indent=2))
