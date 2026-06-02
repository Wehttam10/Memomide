from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import Note, Question, Subject, Topic, User


def get_owned_subject(db: Session, subject_id: int, user: User) -> Subject:
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


def get_owned_topic(db: Session, topic_id: int, user: User) -> Topic:
    topic = db.query(Topic).join(Subject).filter(Topic.id == topic_id, Subject.user_id == user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


def get_owned_note(db: Session, note_id: int, user: User) -> Note:
    note = db.query(Note).join(Topic).join(Subject).filter(Note.id == note_id, Subject.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


def get_owned_question(db: Session, question_id: int, user: User) -> Question:
    question = (
        db.query(Question)
        .join(Topic)
        .join(Subject)
        .filter(Question.id == question_id, Subject.user_id == user.id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
