# Project: AI Study Memory Coach Test Suite

## Architecture
The AI Study Memory Coach application consists of a FastAPI backend and a React frontend. The test suites will be added separately under each directory:
- **Backend Tests**: Will reside in `backend/tests/`. We will use `pytest` and `httpx` for API routing and integration tests.
- **Frontend Tests**: Will reside in `frontend/src/components/__tests__/` or `frontend/src/pages/__tests__/` (or simply `frontend/src/tests/`). We will use `vitest` and `@testing-library/react` (with `jsdom` environment).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Backend Test Setup & Auth API Tests | Install pytest, configure pytest, and implement unit/integration tests for authentication routes (`/auth/register`, `/auth/token`, `/auth/me`). | None | DONE |
| 2 | Backend Topic & AI API Tests | Implement tests for topic creation routes (`/topics/`) and AI service integration routes (`/questions/generate`, `/attempts/grade`). | M1 | DONE |
| 3 | Frontend Test Setup & Unit Tests | Install vitest, jsdom, and RTL. Configure vitest. Implement tests for `AddSourceModal.jsx`, `TopicViewer.jsx`, and `SubjectDetail.jsx`. | None | DONE |
| 4 | Final Integration & E2E Validation | Run all test suites, ensure 100% pass rate, run forensic audit checks, and generate final test reports. | M1, M2, M3 | DONE |

## Interface Contracts & Test Configurations
### Backend Test Environment
- Framework: `pytest`
- API client: `httpx.AsyncClient` referencing the FastAPI app
- Database: Test database using SQLite memory database or separate `test_study_memory_coach.db` with migrations/schemas created dynamically per test session.
- AI Service Mock: The AI service should use a mock provider (or the existing mock provider in `ai_service.py` configured via environment variables) to ensure no actual third-party API calls are made.

### Frontend Test Environment
- Framework: `vitest` + `jsdom`
- Testing Library: `@testing-library/react` and `@testing-library/jest-dom`
- Mocks: Mock API calls (fetch/axios) and any routers/context providers (e.g., `react-router-dom`).

## Code Layout
- `backend/tests/`
  - `conftest.py` - Fixtures for test database, app instance, client, and mock services.
  - `test_auth.py` - Authentication API tests.
  - `test_topics.py` - Topic API tests.
  - `test_ai.py` - Questions generation and grading tests.
- `frontend/`
  - `vite.config.js` - Updated to support vitest testing config.
  - `src/tests/`
    - `setup.js` - Test setup (e.g. importing `@testing-library/jest-dom`, mocking globals).
    - `AddSourceModal.test.jsx` - Unit tests for `AddSourceModal`.
    - `TopicViewer.test.jsx` - Unit tests for `TopicViewer`.
    - `SubjectDetail.test.jsx` - Unit tests for `SubjectDetail`.
