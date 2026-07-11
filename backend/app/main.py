import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import attempts, auth, dashboard, notes, questions, revision, subjects, topics

from .database import Base, engine, get_db
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import Depends

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MemoMind API")

origins_env = os.getenv("ALLOWED_ORIGINS")
if origins_env:
    allow_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]
else:
    allow_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-AI-Mode", "X-AI-Fallback-Reason"],
)

app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(topics.router)
app.include_router(notes.router)
app.include_router(questions.router)
app.include_router(attempts.router)
app.include_router(dashboard.router)
app.include_router(revision.router)


@app.get("/")
def root(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "MemoMind API is running", "database": "connected"}
    except Exception as e:
        return {"status": "error", "message": "MemoMind API is running, but database connection failed", "details": str(e)}
