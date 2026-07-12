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


def _call_gemini(prompt: str, is_json: bool = True) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise RuntimeError("google-genai package is not installed.")

    client = genai.Client(api_key=api_key)

    config = types.GenerateContentConfig(
        temperature=0.2,
        response_mime_type="application/json" if is_json else "text/plain",
    )

    configured_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    
    try:
        response = client.models.generate_content(
            model=configured_model,
            contents=prompt,
            config=config,
        )
        if response.text:
            return response.text
        raise RuntimeError("Empty response text from Gemini")
    except Exception as exc:
        raise RuntimeError(f"Gemini request failed: {exc}") from exc


def _call_openai(prompt: str, is_json: bool = True) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    system_msg = "You are a study coach API. Return only valid JSON." if is_json else "You are a helpful study assistant."
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    if is_json:
        payload["response_format"] = {"type": "json_object"}
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


def _call_provider(prompt: str, is_json: bool = True) -> str:
    provider = _provider()
    if provider == "gemini":
        return _call_gemini(prompt, is_json)
    if provider == "openai":
        return _call_openai(prompt, is_json)
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


def chat_with_context(prompt: str, context: str) -> str:
    provider = _provider()
    system_instruction = "You are an expert study assistant. Answer the user's question accurately using ONLY the provided context notes."
    full_prompt = f"{system_instruction}\n\nContext Notes:\n{context}\n\nUser Question:\n{prompt}"
    
    if provider == "mock":
        return f"Mock AI Response: According to the notes, this is a simulated response to '{prompt}'."
    
    if provider == "gemini" and not os.getenv("GEMINI_API_KEY"):
        return f"Mock AI Response: According to the notes, this is a simulated response to '{prompt}' (API key missing)."

    try:
        return _call_provider(full_prompt, is_json=False)
    except Exception as exc:
        print(f"AI chat failed; falling back to mock provider: {exc}")
def _summarize_prompt(text: str) -> str:
    return f"""
You are an expert educational AI. I will provide you with a student's study notes. First, generate a concise summary of the core concepts in the text. Second, generate 3 targeted revision questions based ONLY on the provided text.
Format your response strictly as a JSON object containing two keys:
'summary': A string containing the concise summary.
'questions': A JSON array of objects, where each object has a 'question' and an 'expected_answer'.

Student's study notes (Raw Text):
{text[:15000]}
""".strip()

def mock_summarize(text: str) -> dict:
    title = text.split('\n')[0][:50] if text else "Document Summary"
    snippet = text[:500].replace('\n', ' ')
    return {
        "title": title,
        "summary": f"# Overview\nThis is an auto-generated summary.\n\n## Extracted Snippet\n{snippet}...",
        "questions": [
            {
                "question": "What is the main topic of the uploaded document?",
                "expected_answer": title
            },
            {
                "question": "Provide a brief snippet from the document.",
                "expected_answer": snippet[:50] + "..."
            },
            {
                "question": "Is this a real AI response?",
                "expected_answer": "No, this is a mock generated response."
            }
        ]
    }

def summarize_document(text: str) -> dict:
    provider = _provider()
    if provider == "mock":
        return mock_summarize(text)
    if provider == "gemini" and not os.getenv("GEMINI_API_KEY"):
        return mock_summarize(text)
        
    try:
        data = _extract_json(_call_provider(_summarize_prompt(text), is_json=True))
        # Safely extract title from text or fallback
        title = text.split('\n')[0][:50] if text else "Document Summary"
        summary = data.get("summary", "Summary generation failed.")
        questions = data.get("questions", [])
        return {"title": title, "summary": summary, "questions": questions}
    except Exception as exc:
        print(f"AI summarization failed; falling back to mock provider: {exc}")
        return mock_summarize(text)
