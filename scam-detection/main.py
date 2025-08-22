# main.py (example wiring)

from fingerprinting import FingerprintSet, FingerprintClassifier
from risk_assessor import RiskAssessor, scam_risk_index

# 1) Load fingerprints (from JSON you generated / stored)
fps = FingerprintSet.from_json_file("data.json", version="v1")
clf = FingerprintClassifier(fps)

assessor = RiskAssessor()

messages = [
    "Hey, this is Aarna. I accidentally sent my OTP to your number. Can you send it to me quickly?",
    "Your tax refund of ₹28,607 is ready. Click here to verify your info: http://ram.com",
]

per_message_results = []
risks = []

for msg in messages:
    # 2) Get type + rule probability
    result = clf.classify(msg)  # includes .prob and .why
    rule_prob = result["prob"]

    # 3) (Optional) Get ML probability here (using MLTextModel); for now, None
    ml_prob = None

    # 4) Blend into final risk
    final_risk = assessor.combine(rule_prob, ml_prob)
    per_message_results.append({**result, "final_risk": final_risk})
    risks.append(final_risk)

# 5) Small-batch summary score (SRI) for 5–10 messages
summary_sri = scam_risk_index(risks)

print(per_message_results)
print("SRI:", summary_sri)
