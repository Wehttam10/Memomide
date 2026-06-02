from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Note, User
from ..schemas import NoteCreate, NoteOut, NoteUpdate
from .helpers import get_owned_note, get_owned_topic

router = APIRouter(tags=["notes"])


@router.get("/topics/{topic_id}/notes", response_model=list[NoteOut])
def list_notes(topic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    topic = get_owned_topic(db, topic_id, current_user)
    return topic.notes


@router.post("/topics/{topic_id}/notes", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(topic_id: int, payload: NoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_owned_topic(db, topic_id, current_user)
    note = Note(**payload.model_dump(), topic_id=topic_id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = get_owned_note(db, note_id, current_user)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, key, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = get_owned_note(db, note_id, current_user)
    db.delete(note)
    db.commit()
