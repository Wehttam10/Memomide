import os

# Set DATABASE_URL before importing any application code to avoid writing to the development database
os.environ["DATABASE_URL"] = "sqlite:///./test_study_memory_coach.db"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, engine, SessionLocal, get_db
from app.main import app

# Ensure test db is not the production db
TEST_DATABASE_URL = "sqlite:///./test_study_memory_coach.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def cleanup_db_file():
    # Ensure test database file is clean at the start
    db_path = "./test_study_memory_coach.db"
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass
    yield
    # Clean up test database file at the end of the test session
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass

@pytest.fixture(scope="function")
def db():
    # Re-create all tables for a clean slate for each test function
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)
    
    # Override get_db dependency to use this test session
    def override_get_db():
        try:
            yield session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def client(db):
    with TestClient(app) as c:
        yield c
