import os
import pytest
from fastapi import status
from app.auth import hash_password, create_access_token
from app.models import User, Subject, Topic, Note, Question, Attempt

# Force AI_PROVIDER to mock for AI tests
os.environ["AI_PROVIDER"] = "mock"

def _create_test_user(db, name, email, password):
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}
    return user, headers

def test_generate_questions_success(client, db):
    user, headers = _create_test_user(db, "AI User", "ai@example.com", "password123")
    subject = Subject(name="Chemistry", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="Periodic Table", subject_id=subject.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    note = Note(content="Periodic Table notes. Noble gases are in Group 18. Alkali metals are in Group 1.", topic_id=topic.id)
    db.add(note)
    db.commit()
    
    response = client.post(f"/topics/{topic.id}/generate-questions", headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.headers.get("X-AI-Mode") == "mock"
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5
    for question in data:
        assert "id" in question
        assert question["topic_id"] == topic.id
        assert "question_text" in question
        assert "expected_answer" in question
        assert "question_type" in question
        assert "difficulty" in question

def test_generate_questions_empty_notes_error(client, db):
    user, headers = _create_test_user(db, "AI User", "ai@example.com", "password123")
    subject = Subject(name="Chemistry", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    # Topic with no notes at all
    topic1 = Topic(title="No Notes Topic", subject_id=subject.id)
    db.add(topic1)
    db.commit()
    db.refresh(topic1)
    
    response = client.post(f"/topics/{topic1.id}/generate-questions", headers=headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Add notes before generating questions"
    
    # Topic with empty notes content
    topic2 = Topic(title="Empty Notes Topic", subject_id=subject.id)
    db.add(topic2)
    db.commit()
    db.refresh(topic2)
    
    note = Note(content="   ", topic_id=topic2.id)
    db.add(note)
    db.commit()
    
    response = client.post(f"/topics/{topic2.id}/generate-questions", headers=headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Add notes before generating questions"

def test_list_questions_success(client, db):
    user, headers = _create_test_user(db, "AI User", "ai@example.com", "password123")
    subject = Subject(name="Biology", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="Photosynthesis", subject_id=subject.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    q1 = Question(topic_id=topic.id, question_text="What is chlorophyll?", expected_answer="Green pigment", question_type="definition", difficulty="easy")
    q2 = Question(topic_id=topic.id, question_text="Describe light reaction.", expected_answer="Produces ATP", question_type="explanation", difficulty="medium")
    db.add_all([q1, q2])
    db.commit()
    
    response = client.get(f"/topics/{topic.id}/questions", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    texts = [q["question_text"] for q in data]
    assert "What is chlorophyll?" in texts
    assert "Describe light reaction." in texts

def test_submit_attempt_success(client, db):
    user, headers = _create_test_user(db, "AI User", "ai@example.com", "password123")
    subject = Subject(name="Physics", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="Thermodynamics", subject_id=subject.id, memory_health_score=50.0, status="Weak")
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    question = Question(
        topic_id=topic.id,
        question_text="What is the first law of thermodynamics?",
        expected_answer="Energy cannot be created or destroyed, only transformed.",
        question_type="definition",
        difficulty="easy"
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    
    payload = {
        "student_answer": "Energy is conserved and can only change form."
    }
    response = client.post(f"/questions/{question.id}/attempt", json=payload, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    
    # Verify Attempt response
    assert "attempt" in data
    assert "topic" in data
    
    attempt = data["attempt"]
    assert attempt["question_id"] == question.id
    assert attempt["user_id"] == user.id
    assert attempt["student_answer"] == payload["student_answer"]
    assert "score" in attempt
    assert "feedback" in attempt
    assert "missing_points" in attempt
    assert "corrected_answer" in attempt
    
    # Verify Topic update response
    topic_resp = data["topic"]
    assert topic_resp["id"] == topic.id
    assert topic_resp["memory_health_score"] != 50.0 # memory score updated
    assert topic_resp["next_review_date"] is not None
    
    # Verify DB reflects changes
    db.refresh(topic)
    assert topic.memory_health_score == topic_resp["memory_health_score"]
    assert topic.status == topic_resp["status"]
    assert topic.next_review_date is not None
    
    # Check that attempt exists in DB
    db_attempt = db.query(Attempt).filter(Attempt.id == attempt["id"]).first()
    assert db_attempt is not None
    assert db_attempt.score == attempt["score"]

def test_list_attempts_success(client, db):
    user, headers = _create_test_user(db, "AI User", "ai@example.com", "password123")
    subject = Subject(name="History", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="French Revolution", subject_id=subject.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    question = Question(topic_id=topic.id, question_text="When did it start?", expected_answer="1789", question_type="definition", difficulty="easy")
    db.add(question)
    db.commit()
    db.refresh(question)
    
    attempt = Attempt(
        question_id=question.id,
        user_id=user.id,
        student_answer="1789",
        score=10.0,
        feedback="Perfect",
        missing_points="None",
        corrected_answer="1789"
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    response = client.get(f"/topics/{topic.id}/attempts", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == attempt.id
    assert data[0]["student_answer"] == "1789"

def test_chat_with_subject_context_success(client, db):
    user, headers = _create_test_user(db, "AI User", "ai@example.com", "password123")
    subject = Subject(name="Computer Networks", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="IP Addressing", description="IPv4 and IPv6", subject_id=subject.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    note = Note(content="IPv4 uses 32-bit addresses. IPv6 uses 128-bit addresses.", topic_id=topic.id)
    db.add(note)
    db.commit()
    
    payload = {
        "message": "What is the difference between IPv4 and IPv6?"
    }
    response = client.post(f"/subjects/{subject.id}/chat", json=payload, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "response" in data
    assert "Mock AI Response:" in data["response"]
    assert "What is the difference between IPv4 and IPv6?" in data["response"]
