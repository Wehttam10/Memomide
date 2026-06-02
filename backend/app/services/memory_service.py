def status_for_score(score: float) -> str:
    if score >= 80:
        return "Strong"
    if score >= 60:
        return "Good"
    if score >= 40:
        return "Weak"
    return "Critical"


def update_memory_score(old_score: float, latest_answer_score: float) -> tuple[float, str]:
    latest_percent = latest_answer_score * 10
    new_score = round((old_score * 0.7) + (latest_percent * 0.3), 2)
    new_score = max(0, min(100, new_score))
    return new_score, status_for_score(new_score)
