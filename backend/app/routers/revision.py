from datetime import datetime, time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Subject, Topic, User
from ..schemas import TopicWithSubject

router = APIRouter(prefix="/revision", tags=["revision"])

STATUS_PRIORITY = {"Critical": 0, "Weak": 1, "Good": 2, "Strong": 3}


@router.get("/due", response_model=list[TopicWithSubject])
def due_revision_queue(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today_end = datetime.combine(datetime.utcnow().date(), time.max)
    now = datetime.utcnow()
    topics = (
        db.query(Topic)
        .join(Subject)
        .filter(Subject.user_id == current_user.id, Topic.next_review_date.isnot(None), Topic.next_review_date <= today_end)
        .all()
    )

    def reason(topic: Topic) -> str:
        if topic.status in {"Critical", "Weak"}:
            return f"{topic.status} memory health needs attention"
        if topic.next_review_date and topic.next_review_date < now:
            return "Overdue review"
        return "Due today"

    def sort_key(topic: Topic):
        overdue_rank = 0 if topic.next_review_date and topic.next_review_date < now else 1
        return (STATUS_PRIORITY.get(topic.status, 4), overdue_rank, topic.next_review_date)

    return [
        {
            "id": topic.id,
            "subject_id": topic.subject_id,
            "title": topic.title,
            "description": topic.description,
            "memory_health_score": topic.memory_health_score,
            "status": topic.status,
            "next_review_date": topic.next_review_date,
            "created_at": topic.created_at,
            "subject_name": topic.subject.name,
            "reason": reason(topic),
        }
        for topic in sorted(topics, key=sort_key)
    ]
