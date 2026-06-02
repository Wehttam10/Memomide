import os
from datetime import datetime, time

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Attempt, Question, Subject, Topic, User
from ..schemas import AIStatus, DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/ai-status", response_model=AIStatus)
def ai_status(_current_user: User = Depends(get_current_user)):
    provider = os.getenv("AI_PROVIDER", "mock").lower().strip()
    if provider not in {"mock", "gemini", "openai"}:
        provider = "mock"

    has_api_key = False
    if provider == "gemini":
        has_api_key = bool(os.getenv("GEMINI_API_KEY"))
    elif provider == "openai":
        has_api_key = bool(os.getenv("OPENAI_API_KEY"))

    mode = "real_ai" if provider in {"gemini", "openai"} and has_api_key else "mock"
    return {"provider": provider, "has_api_key": has_api_key, "mode": mode}


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today_end = datetime.combine(datetime.utcnow().date(), time.max)
    topics_query = db.query(Topic).join(Subject).filter(Subject.user_id == current_user.id)
    topics = topics_query.all()

    recent_attempts = (
        db.query(Attempt)
        .join(Question)
        .join(Topic)
        .join(Subject)
        .filter(Subject.user_id == current_user.id, Attempt.user_id == current_user.id)
        .order_by(Attempt.created_at.desc())
        .limit(5)
        .all()
    )

    average = db.query(func.avg(Topic.memory_health_score)).join(Subject).filter(Subject.user_id == current_user.id).scalar() or 0
    weak_statuses = {"Weak", "Critical"}
    due_count = len([topic for topic in topics if topic.next_review_date and topic.next_review_date <= today_end])

    return {
        "total_subjects": db.query(Subject).filter(Subject.user_id == current_user.id).count(),
        "total_topics": len(topics),
        "weak_topics": len([topic for topic in topics if topic.status in weak_statuses]),
        "due_reviews_today": due_count,
        "average_memory_health_score": round(float(average), 2),
        "recent_attempts": recent_attempts,
        "topic_memory_health": [{"name": topic.title, "score": topic.memory_health_score, "status": topic.status} for topic in topics],
        "weakest_topics": [
            {"id": topic.id, "title": topic.title, "score": topic.memory_health_score, "status": topic.status}
            for topic in sorted(topics, key=lambda item: item.memory_health_score)[:5]
        ],
    }
