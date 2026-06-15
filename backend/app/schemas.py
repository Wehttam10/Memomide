from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    created_at: datetime
    avatar: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class AvatarUpdate(BaseModel):
    avatar: str


class SubjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str = ""


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=160)
    description: Optional[str] = None


class SubjectOut(SubjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


class SubjectChatRequest(BaseModel):
    message: str


class SubjectChatResponse(BaseModel):
    response: str


class TopicBase(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    description: str = ""


class TopicCreate(TopicBase):
    pass


class TopicUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=180)
    description: Optional[str] = None
    memory_health_score: Optional[float] = Field(default=None, ge=0, le=100)
    status: Optional[str] = None
    next_review_date: Optional[datetime] = None


class TopicOut(TopicBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subject_id: int
    memory_health_score: float
    status: str
    next_review_date: Optional[datetime]
    created_at: datetime


class NoteCreate(BaseModel):
    content: str = Field(min_length=1)
    file_name: Optional[str] = None


class NoteUpdate(BaseModel):
    content: Optional[str] = Field(default=None, min_length=1)
    file_name: Optional[str] = None


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic_id: int
    content: str
    file_name: Optional[str]
    created_at: datetime


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic_id: int
    question_text: str
    expected_answer: str
    question_type: str
    difficulty: str
    created_at: datetime


class AttemptCreate(BaseModel):
    student_answer: str = Field(min_length=1)


class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    user_id: int
    student_answer: str
    score: float
    feedback: str
    missing_points: str
    corrected_answer: str
    created_at: datetime


class AttemptResult(BaseModel):
    attempt: AttemptOut
    topic: TopicOut


class TopicWithSubject(TopicOut):
    subject_name: str
    reason: str


class DashboardSummary(BaseModel):
    total_subjects: int
    total_topics: int
    weak_topics: int
    due_reviews_today: int
    average_memory_health_score: float
    recent_attempts: List[AttemptOut]
    topic_memory_health: List[dict]
    weakest_topics: List[dict]


class AIStatus(BaseModel):
    provider: str
    has_api_key: bool
    mode: str
