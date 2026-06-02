
````markdown
# MemoMind

A clean 3-month MVP study platform for notes, AI-generated revision questions, answer grading, weak-topic detection, and spaced repetition scheduling.

## Features

- Register, login, JWT authentication, and protected student data
- Subject and topic management
- Manual notes for each topic
- Provider-based AI question generation from notes, with mock fallback
- Provider-based AI answer grading with score, feedback, missing points, and corrected answer
- Memory health score and topic status updates
- Spaced repetition next review scheduling
- Daily revision queue
- Dashboard with metrics, recent attempts, weakest topics, and Recharts visualization
- Seeded demo data for final year project demos

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT authentication
- Database: SQLite for local development, with SQLAlchemy structure ready for PostgreSQL later
- AI: Provider abstraction in `backend/app/services/ai_service.py` supporting `mock`, `gemini`, and `openai`

---

# Quick Start for macOS

You need **two Terminal windows open at the same time**:

1. One Terminal for the **FastAPI backend**
2. One Terminal for the **Vite frontend**

The frontend cannot log in or load data unless the backend is running.

---

## 1. Prerequisites

Before running the project, make sure your Mac has:

- Python 3.10+
- Node.js 18+ and npm
- Git, if you are cloning from GitHub

Check Python:

```bash
python3 --version
````

Check Git:

```bash
git --version
```

If macOS asks you to install Command Line Developer Tools, click **Install**.

Check Node.js and npm:

```bash
node -v
npm -v
```

If `node` or `npm` says `command not found`, install Node.js using `nvm`.

---

## 2. Install Node.js on macOS using nvm

Run these commands in a fresh Terminal window:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

Then load `nvm` into the current Terminal session:

```bash
. "$HOME/.nvm/nvm.sh"
```

Install the latest LTS version of Node.js:

```bash
nvm install --lts
nvm use --lts
```

Verify:

```bash
node -v
npm -v
```

After this, close and reopen Terminal once. This helps make sure `node` and `npm` are available normally.

---

# Running the App

## Terminal 1 — Backend

Open Terminal and go to the project root:

```bash
cd /Users/yourname/Downloads/ai-study-memory-coach
```

Replace `/Users/yourname/Downloads/ai-study-memory-coach` with your actual project path.

Go into the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv .venv
```

Activate the virtual environment on macOS:

```bash
source .venv/bin/activate
```

After activation, your Terminal should show `(.venv)` at the front, like this:

```bash
(.venv) yourname@MacBook-Air backend %
```

Install backend dependencies:

```bash
python -m pip install -r requirements.txt
```

Seed the demo data:

```bash
python -m app.seed
```

Start the backend server:

```bash
python -m uvicorn app.main:app --reload
```

You should see something like:

```bash
Uvicorn running on http://127.0.0.1:8000
```

Keep this Terminal open. The backend is now running.

Backend API docs:

```text
http://127.0.0.1:8000/docs
```

---

## Terminal 2 — Frontend

Open a **new Terminal window or tab**.

Go to the frontend folder:

```bash
cd /Users/yourname/Downloads/ai-study-memory-coach/frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

You should see a Vite local URL, usually:

```text
http://localhost:5173
```

Open that link in your browser.

---

# Demo Login

Use this demo account:

```text
Email: demo@student.com
Password: password123
```

The login form may already be pre-filled with these credentials.

---

# Frontend to Backend Connection

The frontend reads the backend API URL from:

```text
frontend/.env
```

It should contain:

```env
VITE_API_URL=http://localhost:8000
```

If `frontend/.env` does not exist, the app should fall back to:

```text
http://localhost:8000
```

If you change `.env`, restart the frontend server:

```bash
Ctrl + C
npm run dev
```

Vite only reads `.env` when it starts.

---

# AI Provider Configuration

AI provider settings live in the backend `.env` file.

Create this file:

```text
backend/.env
```

Example:

```env
AI_PROVIDER=mock
GEMINI_API_KEY=
```

By default, use:

```env
AI_PROVIDER=mock
```

To enable Gemini:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

Then restart the backend:

```bash
Ctrl + C
python -m uvicorn app.main:app --reload
```

API keys are only used by the FastAPI backend. They are not exposed to the React frontend.

---

# Common macOS Troubleshooting

## 1. `zsh: command not found: npm`

This means Node.js/npm is not installed or not loaded into your Terminal.

Run:

```bash
node -v
npm -v
```

If both fail, install Node.js using `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
. "$HOME/.nvm/nvm.sh"
nvm install --lts
nvm use --lts
```

Then close and reopen Terminal.

---

## 2. `zsh: command not found: uvicorn`

Use this instead:

```bash
python -m uvicorn app.main:app --reload
```

This makes sure Python uses the `uvicorn` installed inside your active virtual environment.

If it still fails, install it:

```bash
python -m pip install uvicorn
```

---

## 3. `ModuleNotFoundError: No module named 'fastapi'`

Your backend dependencies are not installed.

Make sure you are inside the backend folder and your venv is active:

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Then run:

```bash
python -m uvicorn app.main:app --reload
```

---

## 4. `ModuleNotFoundError: No module named 'dotenv'`

Install the missing dependency:

```bash
python -m pip install python-dotenv
```

But the better fix is usually:

```bash
python -m pip install -r requirements.txt
```

---

## 5. `ModuleNotFoundError: No module named 'jose'`

Install:

```bash
python -m pip install "python-jose[cryptography]"
```

---

## 6. `ModuleNotFoundError: No module named 'passlib'`

Install:

```bash
python -m pip install "passlib[bcrypt]"
```

---

## 7. `ModuleNotFoundError: No module named 'sqlalchemy'`

Install:

```bash
python -m pip install sqlalchemy
```

---

## 8. `ImportError: email-validator is not installed`

Install:

```bash
python -m pip install "pydantic[email]"
```

---

## 9. `node_modules/.bin/vite: Permission denied`

Do not use `sudo npm run dev`.

Delete and reinstall `node_modules`:

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

If it still fails:

```bash
chmod +x node_modules/.bin/vite
npm run dev
```

---

## 10. Backend looks frozen after running Uvicorn

This is normal.

When you see:

```bash
Uvicorn running on http://127.0.0.1:8000
```

the backend server is running. Leave that Terminal open.

Open a second Terminal for the frontend.

---

## 11. Login fails or browser says network error

Check these things:

1. Backend Terminal is still running
2. Backend URL is:

```text
http://127.0.0.1:8000
```

3. Frontend `.env` contains:

```env
VITE_API_URL=http://localhost:8000
```

4. Restart frontend after changing `.env`:

```bash
Ctrl + C
npm run dev
```

---

## 12. Port already in use

If backend port `8000` is already used, run:

```bash
python -m uvicorn app.main:app --reload --port 8001
```

Then update `frontend/.env`:

```env
VITE_API_URL=http://localhost:8001
```

Restart the frontend:

```bash
npm run dev
```

If frontend port `5173` is already used:

```bash
npm run dev -- --port 5174
```

---

# Already Set Up Before?

For backend:

```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

For frontend, in another Terminal:

```bash
cd frontend
npm run dev
```

---

# Main Demo Flow

1. Login with the demo account.
2. Open the dashboard to see summary cards and memory chart.
3. Go to Subjects.
4. Open Data Communication.
5. Open TCP vs UDP.
6. Review notes or generate questions.
7. Answer a question and submit.
8. See score, AI feedback, missing points, corrected answer, updated memory health, and next review date.
9. Open Revision to see due or overdue reviews.

---

# Future Improvements

* PDF upload and text extraction
* Teacher dashboard
* Email or Telegram reminders
* Exam preparation mode
* Mobile app
* Payment subscription system

````

The most important fixes are these:

```bash
source .venv/bin/activate
````

is for **Mac**, while Windows uses:

```bash
.venv\Scripts\activate
```

And for Mac, this is safer:

```bash
python -m uvicorn app.main:app --reload
```

instead of:

```bash
uvicorn app.main:app --reload
```
