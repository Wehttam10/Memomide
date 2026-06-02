from datetime import datetime, timedelta

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Attempt, Note, Question, ReviewSchedule, Subject, Topic, User
from app.services.ai_service import generate_questions, grade_answer
from app.services.memory_service import update_memory_score
from app.services.scheduler_service import next_review_date

DEMO_EMAIL = "demo@student.com"
DEMO_PASSWORD = "password123"

NOTES = (
    "TCP is a connection-oriented protocol that provides reliable data transmission. "
    "It checks for errors, retransmits lost packets, and ensures packets arrive in order. "
    "UDP is connectionless and faster but does not guarantee delivery. UDP is commonly "
    "used in streaming, gaming, and video calls."
)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if existing:
            print("Demo data already exists.")
            return

        user = User(name="Demo Student", email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD))
        db.add(user)
        db.flush()

        subject = Subject(user_id=user.id, name="Data Communication", description="Networking protocols and transmission concepts.")
        db.add(subject)
        db.flush()

        topic = Topic(
            subject_id=subject.id,
            title="TCP vs UDP",
            description="Understand reliability, ordering, and speed trade-offs between TCP and UDP.",
            memory_health_score=50,
            status="Weak",
            next_review_date=datetime.utcnow() - timedelta(days=1),
        )
        db.add(topic)
        db.flush()

        db.add(Note(topic_id=topic.id, content=NOTES))
        question_items = generate_questions(NOTES)
        question_items[0]["question_text"] = "Explain the difference between TCP and UDP."
        question_items[0]["expected_answer"] = (
            "TCP is reliable, connection-oriented, checks errors, retransmits lost packets, "
            "and keeps data in order. UDP is connectionless, faster, and suitable for real-time "
            "applications where speed matters more than perfect reliability."
        )
        questions = [Question(topic_id=topic.id, **item) for item in question_items]
        db.add_all(questions)
        db.flush()

        weak_answer = "TCP is safer and UDP is faster."
        grade = grade_answer(questions[0].question_text, questions[0].expected_answer, weak_answer)
        grade["score"] = 5
        grade["feedback"] = "Partially correct but incomplete."
        grade["missing_points"] = (
            "- TCP is connection-oriented.\n"
            "- UDP is connectionless.\n"
            "- TCP supports retransmission.\n"
            "- TCP keeps packets in order.\n"
            "- UDP is useful for real-time applications."
        )
        db.add(
            Attempt(
                question_id=questions[0].id,
                user_id=user.id,
                student_answer=weak_answer,
                score=grade["score"],
                feedback=grade["feedback"],
                missing_points=grade["missing_points"],
                corrected_answer=questions[0].expected_answer,
            )
        )

        topic.memory_health_score, topic.status = update_memory_score(topic.memory_health_score, grade["score"])
        review_date, interval_days = next_review_date(grade["score"])
        demo_due_date = datetime.utcnow() - timedelta(days=1)
        topic.next_review_date = demo_due_date
        db.add(
            ReviewSchedule(
                topic_id=topic.id,
                user_id=user.id,
                next_review_date=demo_due_date,
                last_review_date=datetime.utcnow(),
                interval_days=interval_days,
                status=topic.status,
            )
        )

        db.commit()
        print("Seed complete.")
        print(f"Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
