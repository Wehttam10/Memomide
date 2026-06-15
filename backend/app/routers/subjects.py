from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Subject, User
from ..schemas import SubjectCreate, SubjectOut, SubjectUpdate, SubjectChatRequest, SubjectChatResponse
from .helpers import get_owned_subject

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("", response_model=list[SubjectOut])
def list_subjects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Subject).filter(Subject.user_id == current_user.id).order_by(Subject.created_at.desc()).all()


@router.post("", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subject = Subject(**payload.model_dump(), user_id=current_user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/{subject_id}", response_model=SubjectOut)
def get_subject(subject_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_owned_subject(db, subject_id, current_user)


@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(subject_id: int, payload: SubjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subject = get_owned_subject(db, subject_id, current_user)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(subject, key, value)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subject = get_owned_subject(db, subject_id, current_user)
    db.delete(subject)
    db.commit()


@router.post("/{subject_id}/chat", response_model=SubjectChatResponse)
def chat_with_subject(subject_id: int, payload: SubjectChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subject = get_owned_subject(db, subject_id, current_user)
    
    # Gather context from topics and notes
    context_parts = []
    for topic in subject.topics:
        topic_text = f"Topic: {topic.title}\nDescription: {topic.description}"
        notes_text = "\n".join([f"- {note.content}" for note in topic.notes])
        if notes_text:
            topic_text += f"\nNotes:\n{notes_text}"
        context_parts.append(topic_text)
        
    context = "\n\n".join(context_parts)
    if not context:
        context = "No topics or notes available for this subject."
        
    from ..services.ai_service import chat_with_context
    response = chat_with_context(payload.message, context)
    return SubjectChatResponse(response=response)

