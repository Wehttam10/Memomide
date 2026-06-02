import json
import os
import re
from collections import Counter
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

QUESTION_TYPES = {"definition", "explanation", "comparison", "scenario", "higher_order"}
DIFFICULTIES = {"easy", "medium", "hard"}
DEFAULT_TIMEOUT = 25
GEMINI_FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]


def _keywords(text: str) -> list[str]:
    words = re.findall(r"[a-zA-Z]{4,}", text.lower())
    stop_words = {
        "that", "with", "this", "from", "have", "does", "into", "used",
        "when", "where", "what", "which", "will", "their", "about",
    }
    return [word for word in words if word not in stop_words]


def _extract_json(text: str) -> Any:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\}|\[.*\])", cleaned, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(1))


def _normalize_questions(data: Any) -> list[dict]:
    raw_questions = data.get("questions") if isinstance(data, dict) else data
    if not isinstance(raw_questions, list):
        raise ValueError("AI response did not contain a questions list")

    fallback_types = ["definition", "explanation", "comparison", "scenario", "higher_order"]
    normalized = []
    for index, item in enumerate(raw_questions[:5]):
        if not isinstance(item, dict):
            continue
        question_type = item.get("question_type", fallback_types[index])
        difficulty = item.get("difficulty", "medium")
        normalized.append(
            {
                "question_text": str(item.get("question_text", "")).strip(),
                "expected_answer": str(item.get("expected_answer", "")).strip(),
                "question_type": question_type if question_type in QUESTION_TYPES else fallback_types[index],
                "difficulty": difficulty if difficulty in DIFFICULTIES else "medium",
            }
        )

    valid_questions = [question for question in normalized if question["question_text"] and question["expected_answer"]]
    if len(valid_questions) != 5:
        raise ValueError("AI response must contain exactly 5 valid questions")
    return valid_questions


def _normalize_grade(data: Any, expected_answer: str) -> dict:
    if not isinstance(data, dict):
        raise ValueError("AI response did not contain a grading object")

    score = float(data.get("score", 0))
    score = round(max(0, min(10, score)), 1)
    missing_points = data.get("missing_points", [])
    if isinstance(missing_points, list):
        missing_points = "\n".join(f"- {str(point).strip()}" for point in missing_points if str(point).strip())

    return {
        "score": score,
        "feedback": str(data.get("feedback", "Answer graded successfully.")).strip(),
        "missing_points": str(missing_points or "- No major missing points detected.").strip(),
        "corrected_answer": str(data.get("corrected_answer", expected_answer)).strip() or expected_answer,
    }


def mock_generate_questions(notes: str) -> list[dict]:
    compact_notes = " ".join(notes.split())
    sentences = [s.strip(" -") for s in re.split(r"[\n.!?]", notes) if len(s.strip(" -")) > 20]
    keyword_counts = Counter(_keywords(compact_notes))
    top_terms = [term for term, _ in keyword_counts.most_common(8)] or ["main concept", "example"]
    base_answer = compact_notes[:600] or "Review the notes and explain the key ideas."
    topic_title = notes.splitlines()[0].replace("notes:", "").replace("Notes:", "").strip(" -:") or top_terms[0]

    def find_line(*needles: str) -> str:
        for sentence in sentences:
            lowered = sentence.lower()
            if all(needle in lowered for needle in needles):
                return sentence
        return ""

    organization_lines = dict.fromkeys(line for line in [find_line("arranged"), find_line("groups"), find_line("periods")] if line)
    organization = " ".join(organization_lines.keys())
    alkali = find_line("group 1") or find_line("alkali")
    noble = find_line("group 18") or find_line("noble")
    radius = find_line("atomic radius")
    ionisation = find_line("ionisation") or find_line("ionization")
    electronegativity = find_line("electronegativity")
    valence = find_line("valence")
    trends = " ".join(line for line in [radius, ionisation, electronegativity] if line)

    prompts = [
        (
            f"What is the key organizing principle of {topic_title}, and how are groups and periods arranged?",
            organization or sentences[0] if sentences else base_answer,
            "definition",
            "easy",
        ),
        (
            "Explain why Group 18 noble gases are unreactive according to the notes.",
            noble or valence or base_answer,
            "explanation",
            "medium",
        ),
        (
            "Compare Group 1 alkali metals and Group 18 noble gases in terms of reactivity and electron shells.",
            " ".join(line for line in [alkali, noble] if line) or base_answer,
            "comparison",
            "medium",
        ),
        (
            "A student places a Group 1 metal into water. What should they expect, and which note concept explains it?",
            alkali or base_answer,
            "scenario",
            "medium",
        ),
        (
            "Using the periodic trends in the notes, predict how atomic radius, ionisation energy, and electronegativity change across a period and down or up a group.",
            trends or base_answer,
            "higher_order",
            "hard",
        ),
    ]
    return [
        {
            "question_text": question_text,
            "expected_answer": expected_answer if len(expected_answer) > 40 else base_answer,
            "question_type": question_type,
            "difficulty": difficulty,
        }
        for question_text, expected_answer, question_type, difficulty in prompts
    ]


def mock_grade_answer(question: str, expected_answer: str, student_answer: str) -> dict:
    answer_words = set(_keywords(student_answer))
    expected_words = set(_keywords(expected_answer))
    if not student_answer.strip():
        matched_ratio = 0
    elif expected_words:
        matched_ratio = len(answer_words & expected_words) / len(expected_words)
    else:
        matched_ratio = 0.5

    length_bonus = min(len(student_answer.split()) / 45, 1) * 2
    score = round(max(0, min(10, matched_ratio * 8 + length_bonus)), 1)
    if len(student_answer.split()) < 8:
        score = min(score, 5)

    missing = sorted(list(expected_words - answer_words))[:6]
    missing_points = "\n".join(f"- Include the idea of {word}." for word in missing) or "- No major missing points detected."
    feedback = "Strong answer with good coverage." if score >= 8 else "Partially correct but needs more complete detail."
    if score < 4:
        feedback = "The answer is too brief or misses the core concepts."

    return {
        "score": score,
        "feedback": feedback,
        "missing_points": missing_points,
        "corrected_answer": expected_answer,
    }


def _question_prompt(notes: str) -> str:
    return f"""
You are an expert educational tutor and exam question designer.

Your task is to read the student's study notes and generate high-quality revision questions that test understanding.

Rules:
- Generate exactly 5 questions.
- Questions must be based only on the provided notes.
- Do not create generic questions.
- Do not ask questions unrelated to the notes.
- Include a mix of:
  1. definition question
  2. explanation question
  3. comparison question
  4. application/scenario question
  5. higher-order thinking question
- Questions should test understanding, not only memorization.
- For each question, provide a strong expected answer.
- Assign difficulty: easy, medium, or hard.
- Assign question_type: definition, explanation, comparison, scenario, higher_order
- Return only valid JSON array.
- Do not include markdown.
- Do not include extra explanation outside the JSON.

Student notes:
{notes}

Return JSON in this exact format:
[
  {{
    "question_text": "Question here",
    "expected_answer": "Expected answer here",
    "question_type": "definition",
    "difficulty": "easy"
  }},
  {{
    "question_text": "Question here",
    "expected_answer": "Expected answer here",
    "question_type": "explanation",
    "difficulty": "medium"
  }}
]
""".strip()


def _grading_prompt(question: str, expected_answer: str, student_answer: str) -> str:
    return f"""
You are an educational evaluator.

Grade the student's answer based on the question and expected answer.

Rules:
- Score from 0 to 10.
- Do not grade only by keyword matching.
- Evaluate meaning, accuracy, completeness, and clarity.
- Give partial marks if the student understands the core idea but misses details.
- Identify missing concepts clearly.
- Provide a corrected answer.
- Return only valid JSON.
- Do not include markdown.
- Do not include extra explanation outside JSON.

Question:
{question}

Expected answer:
{expected_answer}

Student answer:
{student_answer}

Return JSON in this exact format:
{{
  "score": 7,
  "feedback": "Feedback here",
  "missing_points": ["missing point 1", "missing point 2"],
  "corrected_answer": "Corrected answer here"
}}
""".strip()


def _call_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2},
    }
    configured_model = os.getenv("GEMINI_MODEL", "").strip()
    models = [configured_model, *_list_gemini_generate_content_models(api_key), *GEMINI_FALLBACK_MODELS] if configured_model else [*_list_gemini_generate_content_models(api_key), *GEMINI_FALLBACK_MODELS]
    last_error = None

    for model in dict.fromkeys(_normalize_gemini_model_name(model) for model in models if model):
        request_model = _normalize_gemini_model_name(model).replace("models/", "")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{request_model}:generateContent"
        try:
            response = httpx.post(url, params={"key": api_key}, json=payload, timeout=DEFAULT_TIMEOUT)
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            detail = _gemini_error_detail(exc.response)
            last_error = f"{model} returned HTTP {status_code}{': ' + detail if detail else ''}"
            if status_code not in {404, 429}:
                raise RuntimeError(f"Gemini request failed with HTTP {status_code}{': ' + detail if detail else ''}") from None

    raise RuntimeError(f"No configured Gemini model was available. Last error: {last_error}")


def _normalize_gemini_model_name(model: str) -> str:
    model = model.strip()
    return model if model.startswith("models/") else f"models/{model}"


def _list_gemini_generate_content_models(api_key: str) -> list[str]:
    try:
        response = httpx.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            params={"key": api_key},
            timeout=DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        models = response.json().get("models", [])
    except Exception as exc:
        print(f"Could not list Gemini models; using configured fallbacks: {exc}")
        return []

    usable = []
    for model in models:
        methods = model.get("supportedGenerationMethods", [])
        name = model.get("name", "")
        if "generateContent" in methods and name:
            usable.append(name)

    preferred = [model for model in usable if "flash" in model.lower()]
    return preferred or usable


def _gemini_error_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text[:160]

    error = payload.get("error", {}) if isinstance(payload, dict) else {}
    status = str(error.get("status", "")).strip()
    message = str(error.get("message", "")).strip()
    detail = " - ".join(part for part in [status, message] if part)
    return detail[:160]


def _call_openai(prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a study coach API. Return only valid JSON."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
    }
    response = httpx.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=DEFAULT_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


def _provider() -> str:
    provider = os.getenv("AI_PROVIDER", "mock").lower().strip()
    return provider if provider in {"mock", "gemini", "openai"} else "mock"


def _call_provider(prompt: str) -> str:
    provider = _provider()
    if provider == "gemini":
        return _call_gemini(prompt)
    if provider == "openai":
        return _call_openai(prompt)
    raise RuntimeError("Mock provider selected")


def generate_questions_from_notes(notes: str) -> list[dict]:
    questions, _mode, _reason = generate_questions_from_notes_with_status(notes)
    return questions


def generate_questions_from_notes_with_status(notes: str) -> tuple[list[dict], str, str]:
    provider = _provider()
    if provider == "mock":
        return mock_generate_questions(notes), "mock", "AI_PROVIDER is set to mock."
    if provider == "gemini" and not os.getenv("GEMINI_API_KEY"):
        reason = "Gemini provider selected but GEMINI_API_KEY is missing."
        print(f"{reason} Falling back to mock provider.")
        return mock_generate_questions(notes), "mock", reason

    try:
        data = _extract_json(_call_provider(_question_prompt(notes)))
        return _normalize_questions(data), "real_ai", ""
    except Exception as exc:
        reason = str(exc)
        print(f"AI question generation failed; falling back to mock provider: {reason}")
        return mock_generate_questions(notes), "mock", reason


def grade_student_answer(question: str, expected_answer: str, student_answer: str) -> dict:
    provider = _provider()
    if provider == "mock":
        return mock_grade_answer(question, expected_answer, student_answer)
    if provider == "gemini" and not os.getenv("GEMINI_API_KEY"):
        print("Gemini provider selected but GEMINI_API_KEY is missing; falling back to mock provider.")
        return mock_grade_answer(question, expected_answer, student_answer)

    try:
        data = _extract_json(_call_provider(_grading_prompt(question, expected_answer, student_answer)))
        return _normalize_grade(data, expected_answer)
    except Exception as exc:
        print(f"AI grading failed; falling back to mock provider: {exc}")
        return mock_grade_answer(question, expected_answer, student_answer)


def generate_questions(notes: str) -> list[dict]:
    return generate_questions_from_notes(notes)


def grade_answer(question: str, expected_answer: str, student_answer: str) -> dict:
    return grade_student_answer(question, expected_answer, student_answer)
