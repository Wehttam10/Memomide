from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Attempt, Question, ReviewSchedule, User
from ..schemas import AttemptCreate, AttemptOut, AttemptResult
from ..services.ai_service import grade_student_answer
from ..services.memory_service import update_memory_score
from ..services.scheduler_service import next_review_date
from .helpers import get_owned_question, get_owned_topic

router = APIRouter(tags=["attempts"])


@router.post("/questions/{question_id}/attempt", response_model=AttemptResult, status_code=status.HTTP_201_CREATED)
def submit_attempt(question_id: int, payload: AttemptCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    question = get_owned_question(db, question_id, current_user)
    topic = question.topic
    grade = grade_student_answer(question.question_text, question.expected_answer, payload.student_answer)

    attempt = Attempt(
        question_id=question.id,
        user_id=current_user.id,
        student_answer=payload.student_answer,
        score=grade["score"],
        feedback=grade["feedback"],
        missing_points=grade["missing_points"],
        corrected_answer=grade["corrected_answer"],
    )
    db.add(attempt)

    topic.memory_health_score, topic.status = update_memory_score(topic.memory_health_score, grade["score"])
    review_date, interval_days = next_review_date(grade["score"])
    topic.next_review_date = review_date

    schedule = (
        db.query(ReviewSchedule)
        .filter(ReviewSchedule.topic_id == topic.id, ReviewSchedule.user_id == current_user.id)
        .first()
    )
    if not schedule:
        schedule = ReviewSchedule(topic_id=topic.id, user_id=current_user.id, next_review_date=review_date, interval_days=interval_days, status=topic.status)
        db.add(schedule)
    schedule.last_review_date = datetime.now(timezone.utc)
    schedule.next_review_date = review_date
    schedule.interval_days = interval_days
    schedule.status = topic.status

    db.commit()
    db.refresh(attempt)
    db.refresh(topic)
    return {"attempt": attempt, "topic": topic}


@router.get("/topics/{topic_id}/attempts", response_model=list[AttemptOut])
def list_topic_attempts(topic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    topic = get_owned_topic(db, topic_id, current_user)
    return (
        db.query(Attempt)
        .join(Question)
        .filter(Attempt.user_id == current_user.id, Question.topic_id == topic.id)
        .order_by(Attempt.created_at.desc())
        .all()
    )
