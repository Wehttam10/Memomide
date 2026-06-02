from datetime import datetime, timedelta


def interval_for_score(score: float) -> int:
    if score <= 3:
        return 1
    if score <= 5:
        return 2
    if score <= 7:
        return 4
    if score < 9:
        return 7
    return 14


def next_review_date(score: float) -> tuple[datetime, int]:
    interval_days = interval_for_score(score)
    return datetime.utcnow() + timedelta(days=interval_days), interval_days
