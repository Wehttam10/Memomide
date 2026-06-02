import os
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Attempt, Note, Question, Subject, Topic, User
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


@router.get("/search")
def search_workspace(q: str = "", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not q:
        return {"subjects": [], "topics": [], "notes": []}

    subjects = db.query(Subject).filter(
        Subject.user_id == current_user.id,
        Subject.name.ilike(f"%{q}%")
    ).all()

    topics = db.query(Topic).join(Subject).filter(
        Subject.user_id == current_user.id,
        (Topic.title.ilike(f"%{q}%") | Topic.description.ilike(f"%{q}%"))
    ).all()

    notes = db.query(Note).join(Topic).join(Subject).filter(
        Subject.user_id == current_user.id,
        Note.content.ilike(f"%{q}%")
    ).all()

    formatted_notes = []
    for note in notes:
        content = note.content
        match_idx = content.lower().find(q.lower())
        if match_idx != -1:
            start = max(0, match_idx - 60)
            end = min(len(content), match_idx + len(q) + 60)
            snippet = content[start:end]
            if start > 0:
                snippet = "..." + snippet
            if end < len(content):
                snippet = snippet + "..."
        else:
            snippet = content[:120] + "..." if len(content) > 120 else content

        formatted_notes.append({
            "id": note.id,
            "topic_id": note.topic_id,
            "topic_title": note.topic.title,
            "subject_id": note.topic.subject_id,
            "subject_name": note.topic.subject.name,
            "snippet": snippet,
            "created_at": note.created_at
        })

    return {
        "subjects": [{"id": s.id, "name": s.name, "description": s.description} for s in subjects],
        "topics": [{"id": t.id, "title": t.title, "description": t.description, "subject_id": t.subject_id, "subject_name": t.subject.name} for t in topics],
        "notes": formatted_notes
    }


@router.get("/awards")
def get_awards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start_of_today = datetime.combine(datetime.utcnow().date(), time.min)

    # Concentric rings calculations
    notes_today = db.query(Note).join(Topic).join(Subject).filter(
        Subject.user_id == current_user.id,
        Note.created_at >= start_of_today
    ).count()

    questions_today = db.query(Attempt).filter(
        Attempt.user_id == current_user.id,
        Attempt.created_at >= start_of_today
    ).count()

    topics_today = db.query(Topic).join(Question).join(Attempt).join(Subject).filter(
        Subject.user_id == current_user.id,
        Attempt.user_id == current_user.id,
        Attempt.created_at >= start_of_today
    ).distinct().count()

    # Badges calculations
    total_notes = db.query(Note).join(Topic).join(Subject).filter(Subject.user_id == current_user.id).count()
    scholar_unlocked = total_notes >= 3

    attempts = db.query(Attempt).filter(Attempt.user_id == current_user.id).all()
    night_owl_unlocked = any(at.created_at.hour >= 22 or at.created_at.hour < 4 for at in attempts)

    total_topics_practiced = db.query(Topic).join(Question).join(Attempt).join(Subject).filter(
        Subject.user_id == current_user.id,
        Attempt.user_id == current_user.id
    ).distinct().count()
    topic_master_unlocked = total_topics_practiced >= 5

    perfect_score_unlocked = any(at.score >= 9.0 for at in attempts)

    total_attempts = len(attempts)
    review_hero_unlocked = total_attempts >= 3

    days_since_creation = (datetime.utcnow() - current_user.created_at).days
    lifelong_learner_unlocked = days_since_creation >= 7

    writers_block_breaker_unlocked = db.query(Question).join(Topic).join(Subject).filter(
        Subject.user_id == current_user.id
    ).first() is not None

    persistent_climber_unlocked = total_attempts >= 10

    # 3 consecutive days check
    consistency_champion_unlocked = False
    if total_attempts >= 3:
        attempt_dates = sorted(list(set(at.created_at.date() for at in attempts)))
        for i in range(len(attempt_dates) - 2):
            if (attempt_dates[i+1] - attempt_dates[i]).days == 1 and (attempt_dates[i+2] - attempt_dates[i+1]).days == 1:
                consistency_champion_unlocked = True
                break

    # Helper to format unlock date
    def get_unlock_date(unlocked: bool):
        return datetime.utcnow().isoformat() if unlocked else None

    badges = [
        {
            "id": "scholar",
            "name": "Scholar",
            "description": "Write at least 3 notes in any topic.",
            "unlocked": scholar_unlocked,
            "unlock_date": get_unlock_date(scholar_unlocked),
            "icon": "BookOpen"
        },
        {
            "id": "night_owl",
            "name": "Night Owl",
            "description": "Complete a study practice between 10 PM and 4 AM.",
            "unlocked": night_owl_unlocked,
            "unlock_date": get_unlock_date(night_owl_unlocked),
            "icon": "Moon"
        },
        {
            "id": "topic_master",
            "name": "Topic Master",
            "description": "Practice at least 5 different topics.",
            "unlocked": topic_master_unlocked,
            "unlock_date": get_unlock_date(topic_master_unlocked),
            "icon": "Award"
        },
        {
            "id": "perfect_score",
            "name": "Perfect Score",
            "description": "Get a score of 9.0 or higher on any attempt.",
            "unlocked": perfect_score_unlocked,
            "unlock_date": get_unlock_date(perfect_score_unlocked),
            "icon": "Sparkles"
        },
        {
            "id": "review_hero",
            "name": "Review Hero",
            "description": "Complete at least 3 practice attempts.",
            "unlocked": review_hero_unlocked,
            "unlock_date": get_unlock_date(review_hero_unlocked),
            "icon": "CheckCircle"
        },
        {
            "id": "lifelong_learner",
            "name": "Lifelong Learner",
            "description": "Use the application for at least 7 days.",
            "unlocked": lifelong_learner_unlocked,
            "unlock_date": get_unlock_date(lifelong_learner_unlocked),
            "icon": "Calendar"
        },
        {
            "id": "block_breaker",
            "name": "Writer's Block Breaker",
            "description": "Create at least 1 topic with study questions.",
            "unlocked": writers_block_breaker_unlocked,
            "unlock_date": get_unlock_date(writers_block_breaker_unlocked),
            "icon": "PenTool"
        },
        {
            "id": "persistent_climber",
            "name": "Persistent Climber",
            "description": "Complete a total of 10 practice attempts.",
            "unlocked": persistent_climber_unlocked,
            "unlock_date": get_unlock_date(persistent_climber_unlocked),
            "icon": "TrendingUp"
        },
        {
            "id": "consistency_champion",
            "name": "Consistency Champion",
            "description": "Complete practice attempts on 3 consecutive days.",
            "unlocked": consistency_champion_unlocked,
            "unlock_date": get_unlock_date(consistency_champion_unlocked),
            "icon": "Flame"
        }
    ]

    return {
        "rings": {
            "notes": {
                "current": notes_today,
                "goal": 1,
                "percentage": min(100, int((notes_today / 1.0) * 100)) if notes_today else 0
            },
            "questions": {
                "current": questions_today,
                "goal": 3,
                "percentage": min(100, int((questions_today / 3.0) * 100)) if questions_today else 0
            },
            "topics": {
                "current": topics_today,
                "goal": 2,
                "percentage": min(100, int((topics_today / 2.0) * 100)) if topics_today else 0
            }
        },
        "badges": badges
    }
