from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Topic, User
from ..schemas import TopicCreate, TopicOut, TopicUpdate
from ..services.memory_service import status_for_score
from .helpers import get_owned_subject, get_owned_topic

router = APIRouter(tags=["topics"])


@router.get("/subjects/{subject_id}/topics", response_model=list[TopicOut])
def list_topics(subject_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subject = get_owned_subject(db, subject_id, current_user)
    return subject.topics


@router.post("/subjects/{subject_id}/topics", response_model=TopicOut, status_code=status.HTTP_201_CREATED)
def create_topic(subject_id: int, payload: TopicCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_owned_subject(db, subject_id, current_user)
    topic = Topic(**payload.model_dump(), subject_id=subject_id, status=status_for_score(50))
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.get("/topics/{topic_id}", response_model=TopicOut)
def get_topic(topic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_owned_topic(db, topic_id, current_user)


@router.put("/topics/{topic_id}", response_model=TopicOut)
def update_topic(topic_id: int, payload: TopicUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    topic = get_owned_topic(db, topic_id, current_user)
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(topic, key, value)
    if "memory_health_score" in updates and "status" not in updates:
        topic.status = status_for_score(topic.memory_health_score)
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(topic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    topic = get_owned_topic(db, topic_id, current_user)
    db.delete(topic)
    db.commit()
