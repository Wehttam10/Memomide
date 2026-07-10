import pytest
from fastapi import status
from app.auth import hash_password, create_access_token
from app.models import User, Subject, Topic

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

def test_create_topic_success(client, db):
    user, headers = _create_test_user(db, "Test User", "test@example.com", "password123")
    
    # Create owned subject
    subject = Subject(name="Computer Science", description="CS basics", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    payload = {
        "title": "Algorithms",
        "description": "Sorting and searching"
    }
    response = client.post(f"/subjects/{subject.id}/topics", json=payload, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Algorithms"
    assert data["description"] == "Sorting and searching"
    assert data["subject_id"] == subject.id
    assert "id" in data
    assert data["memory_health_score"] == 50.0
    assert data["status"] == "Weak"
    
    # Verify in DB
    db_topic = db.query(Topic).filter(Topic.id == data["id"]).first()
    assert db_topic is not None
    assert db_topic.title == "Algorithms"

def test_list_topics_success(client, db):
    user, headers = _create_test_user(db, "Test User", "test@example.com", "password123")
    subject = Subject(name="Maths", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    t1 = Topic(title="Calculus", subject_id=subject.id, memory_health_score=60.0, status="Medium")
    t2 = Topic(title="Algebra", subject_id=subject.id, memory_health_score=80.0, status="Strong")
    db.add_all([t1, t2])
    db.commit()
    
    response = client.get(f"/subjects/{subject.id}/topics", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    titles = [t["title"] for t in data]
    assert "Calculus" in titles
    assert "Algebra" in titles

def test_get_topic_success(client, db):
    user, headers = _create_test_user(db, "Test User", "test@example.com", "password123")
    subject = Subject(name="History", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="WWII", description="World War 2", subject_id=subject.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    response = client.get(f"/topics/{topic.id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == topic.id
    assert data["title"] == "WWII"
    assert data["description"] == "World War 2"

def test_update_topic_success(client, db):
    user, headers = _create_test_user(db, "Test User", "test@example.com", "password123")
    subject = Subject(name="Physics", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="Mechanics", description="Classical Mechanics", subject_id=subject.id, memory_health_score=50.0, status="Weak")
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    payload = {
        "title": "Quantum Mechanics",
        "description": "Intro to quantum theory",
        "memory_health_score": 95.0
    }
    response = client.put(f"/topics/{topic.id}", json=payload, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Quantum Mechanics"
    assert data["description"] == "Intro to quantum theory"
    assert data["memory_health_score"] == 95.0
    assert data["status"] == "Strong"  # Check that memory status is updated based on score
    
    # Verify in DB
    db.refresh(topic)
    assert topic.title == "Quantum Mechanics"
    assert topic.memory_health_score == 95.0
    assert topic.status == "Strong"

def test_delete_topic_success(client, db):
    user, headers = _create_test_user(db, "Test User", "test@example.com", "password123")
    subject = Subject(name="Chemistry", user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic = Topic(title="Organic Chemistry", subject_id=subject.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    response = client.delete(f"/topics/{topic.id}", headers=headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify DB does not contain the topic
    db_topic = db.query(Topic).filter(Topic.id == topic.id).first()
    assert db_topic is None

def test_topic_not_found(client, db):
    user, headers = _create_test_user(db, "Test User", "test@example.com", "password123")
    
    # Check GET on non-existent topic
    response = client.get("/topics/999", headers=headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Check PUT on non-existent topic
    payload = {"title": "New Title"}
    response = client.put("/topics/999", json=payload, headers=headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Check DELETE on non-existent topic
    response = client.delete("/topics/999", headers=headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_topic_belongs_to_another_user(client, db):
    # User 1 creates subject and topic
    user1, headers1 = _create_test_user(db, "User One", "user1@example.com", "password123")
    subject1 = Subject(name="User 1 Subject", user_id=user1.id)
    db.add(subject1)
    db.commit()
    db.refresh(subject1)
    
    topic1 = Topic(title="User 1 Topic", subject_id=subject1.id)
    db.add(topic1)
    db.commit()
    db.refresh(topic1)
    
    # User 2 tries to access User 1's subject and topic
    user2, headers2 = _create_test_user(db, "User Two", "user2@example.com", "password123")
    
    # Create topic on User 1's subject - should fail
    payload = {"title": "Sneaky Topic"}
    response = client.post(f"/subjects/{subject1.id}/topics", json=payload, headers=headers2)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # List topics of User 1's subject - should fail
    response = client.get(f"/subjects/{subject1.id}/topics", headers=headers2)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # GET User 1's topic - should fail
    response = client.get(f"/topics/{topic1.id}", headers=headers2)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # PUT User 1's topic - should fail
    response = client.put(f"/topics/{topic1.id}", json={"title": "Updated by hacker"}, headers=headers2)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # DELETE User 1's topic - should fail
    response = client.delete(f"/topics/{topic1.id}", headers=headers2)
    assert response.status_code == status.HTTP_404_NOT_FOUND
