from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Question, User
from ..schemas import QuestionOut
from ..services.ai_service import generate_questions_from_notes_with_status
from .helpers import get_owned_topic

router = APIRouter(tags=["questions"])


@router.post("/topics/{topic_id}/generate-questions", response_model=list[QuestionOut], status_code=status.HTTP_201_CREATED)
def generate_topic_questions(topic_id: int, response: Response, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    topic = get_owned_topic(db, topic_id, current_user)
    notes_text = "\n".join(note.content for note in topic.notes)
    if not notes_text.strip():
        raise HTTPException(status_code=400, detail="Add notes before generating questions")

    for existing_question in list(topic.questions):
        if not existing_question.attempts:
            db.delete(existing_question)
    db.flush()

    generated_questions, ai_mode, fallback_reason = generate_questions_from_notes_with_status(notes_text)
    response.headers["X-AI-Mode"] = ai_mode
    if fallback_reason:
        response.headers["X-AI-Fallback-Reason"] = fallback_reason[:180]
    questions = [Question(topic_id=topic.id, **item) for item in generated_questions]
    db.add_all(questions)
    db.commit()
    for question in questions:
        db.refresh(question)
    return questions


@router.get("/topics/{topic_id}/questions", response_model=list[QuestionOut])
def list_questions(topic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    topic = get_owned_topic(db, topic_id, current_user)
    return topic.questions
