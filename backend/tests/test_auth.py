import pytest
from fastapi import status
from app.auth import hash_password, verify_password, create_access_token, decode_access_token
from app.models import User

# Test helper functions in app/auth.py
def test_password_hashing():
    password = "supersecretpassword"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_access_token_creation_and_decoding():
    subject = "user123"
    token = create_access_token(subject)
    assert isinstance(token, str)
    
    decoded = decode_access_token(token)
    assert decoded == subject

def test_decode_invalid_token():
    assert decode_access_token("invalid.token.here") is None

# Test Router /auth/register
def test_register_success(client, db):
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["name"] == "Test User"
    assert data["user"]["email"] == "test@example.com"
    assert "id" in data["user"]
    
    # Verify user is created in database
    db_user = db.query(User).filter(User.email == "test@example.com").first()
    assert db_user is not None
    assert db_user.name == "Test User"
    assert verify_password("securepassword123", db_user.password_hash) is True

def test_register_duplicate_email(client, db):
    # Pre-register a user
    existing_user = User(
        name="Existing User",
        email="test@example.com",
        password_hash=hash_password("password123")
    )
    db.add(existing_user)
    db.commit()
    
    payload = {
        "name": "Duplicate User",
        "email": "TEST@example.com",  # Mix case to verify lowercasing logic
        "password": "newpassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Email is already registered"

def test_register_invalid_data(client):
    # Test short password
    payload = {
        "name": "User",
        "email": "invalid-email",
        "password": "123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

# Test Router /auth/login
def test_login_success(client, db):
    # Pre-register user
    user = User(
        name="Login User",
        email="login@example.com",
        password_hash=hash_password("mypassword")
    )
    db.add(user)
    db.commit()
    
    payload = {
        "email": "login@example.com",
        "password": "mypassword"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@example.com"

def test_login_invalid_credentials(client, db):
    # Pre-register user
    user = User(
        name="Login User",
        email="login@example.com",
        password_hash=hash_password("mypassword")
    )
    db.add(user)
    db.commit()
    
    # Test wrong password
    payload = {"email": "login@example.com", "password": "wrongpassword"}
    response = client.post("/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"
    
    # Test non-existent email
    payload = {"email": "nonexistent@example.com", "password": "mypassword"}
    response = client.post("/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"

# Test Router /auth/me
def test_get_me_success(client, db):
    # Register and get token
    user = User(
        name="Me User",
        email="me@example.com",
        password_hash=hash_password("mypassword")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["name"] == "Me User"
    assert data["id"] == user.id

def test_get_me_unauthorized(client):
    # Missing token
    response = client.get("/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # Malformed token
    headers = {"Authorization": "Bearer invalidtokenhere"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid authentication token"

def test_get_me_user_not_found(client, db):
    # Create token for non-existent user ID
    token = create_access_token("9999")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "User not found"

# Test Router /auth/avatar
def test_update_avatar_success(client, db):
    # Register and get token
    user = User(
        name="Avatar User",
        email="avatar@example.com",
        password_hash=hash_password("mypassword")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {"avatar": "http://example.com/avatar.png"}
    response = client.put("/auth/avatar", json=payload, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["avatar"] == "http://example.com/avatar.png"
    
    # Verify in database
    db.refresh(user)
    assert user.avatar == "http://example.com/avatar.png"

def test_update_avatar_unauthorized(client):
    payload = {"avatar": "http://example.com/avatar.png"}
    response = client.put("/auth/avatar", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
