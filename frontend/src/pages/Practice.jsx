import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Brain, ClipboardList, Send, Sparkles, Wand2 } from 'lucide-react';
import { getAIStatus } from '../api/dashboard';
import { generateQuestions, getAttempts, getQuestions, submitAttempt } from '../api/questions';
import { getTopic } from '../api/topics';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';

export default function Practice() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [aiStatus, setAiStatus] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [topicData, questionData, attemptData] = await Promise.all([getTopic(topicId), getQuestions(topicId), getAttempts(topicId)]);
    setTopic(topicData);
    setQuestions(questionData);
    setAttempts(attemptData);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
    getAIStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ provider: 'mock', has_api_key: false, mode: 'mock' }));
  }, [topicId]);

  async function handleGenerate() {
    setFallbackReason('');
    setGenerating(true);
    try {
      const result = await generateQuestions(topicId);
      setQuestions(result.questions);
      setAiStatus({ ...(aiStatus || {}), mode: result.aiMode });
      setFallbackReason(result.fallbackReason || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(questionId) {
    const result = await submitAttempt(questionId, { student_answer: answers[questionId] || '' });
    setResults({ ...results, [questionId]: result });
    setTopic(result.topic);
    setAttempts(await getAttempts(topicId));
  }

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!topic) return <Loading label="Loading practice" rows={4} />;
  const answeredCount = Object.keys(results).length;
  const completionPercent = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="feature-pill">
              <Brain className="h-3.5 w-3.5 text-neutral-600 pointer-events-none" />
              Focus session
            </div>
            <h2 className="mt-3 text-2xl font-bold font-display text-neutral-900 tracking-tight">{topic.title} practice</h2>
            <p className="text-xs text-slate-550 mt-1 font-light">Memory health: <span className="font-mono font-bold text-neutral-900">{Math.round(topic.memory_health_score)}%</span> &bull; Next review: <span className="font-mono">{topic.next_review_date ? new Date(topic.next_review_date).toLocaleDateString() : 'Not scheduled'}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={topic.status} />
            <button className="btn-secondary" onClick={handleGenerate} type="button" disabled={generating}>
              <Wand2 className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700">Session progress</span>
              <span className="font-bold text-neutral-900 font-mono text-xs">{answeredCount}/{questions.length || 5} answered</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-neutral-900 transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
            <div className="flex items-center gap-2 font-bold text-neutral-900 font-display tracking-tight">
              <Sparkles className="h-4 w-4 text-neutral-950 pointer-events-none" />
              Goal
            </div>
            <p className="mt-1 text-slate-555">Give complete answers, then compare with AI feedback.</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-neutral-700">
              Question source: {aiStatus?.mode === 'real_ai' ? 'Gemini AI' : 'Mock AI'}
            </span>
            <span className="text-slate-500">
              {generating
                ? aiStatus?.mode === 'real_ai'
                  ? 'Gemini is reading the notes and generating understanding questions.'
                  : 'Mock generator is producing note-based fallback questions.'
                : 'Use Generate to refresh questions from the backend AI service.'}
            </span>
          </div>
          {generating ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="ai-progress-bar h-full w-1/2 rounded-full" />
            </div>
          ) : null}
        </div>
        {fallbackReason ? (
          <p className="mt-3 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Gemini fallback reason: {fallbackReason}
          </p>
        ) : null}
      </section>
      {questions.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No questions yet" message="Add notes for this topic, then generate questions to begin practice." actionLabel="Generate questions" action={handleGenerate} />
      ) : null}
      <div className="space-y-4">
        {questions.map((question) => {
          const result = results[question.id];
          return (
            <section key={question.id} className="panel space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-neutral-800 font-mono text-[10px] uppercase">{question.question_type.replace('_', ' ')}</span>
                  <span className="rounded bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-neutral-800 font-mono text-[10px] uppercase">{question.difficulty}</span>
                </div>
                {result ? <span className="rounded bg-neutral-900 border border-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white font-mono uppercase">Answered</span> : null}
              </div>
              <h3 className="text-lg font-bold font-display text-neutral-900 tracking-tight">{question.question_text}</h3>
              <textarea className="field min-h-28" placeholder="Type your answer..." value={answers[question.id] || ''} onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })} />
              <button className="btn-primary" onClick={() => handleSubmit(question.id)} type="button"><Send className="h-4 w-4 pointer-events-none" />Submit answer</button>
              {result ? (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-2">
                  <p className="font-bold font-display text-neutral-900">Score: <span className="font-mono">{result.attempt.score}/10</span></p>
                  <p className="mt-2 text-sm">{result.attempt.feedback}</p>
                  <p className="mt-3 text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Missing points</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-650">{result.attempt.missing_points}</p>
                  <p className="mt-3 text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Corrected answer</p>
                  <p className="text-sm text-slate-650">{result.attempt.corrected_answer}</p>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
      <section className="panel">
        <h3 className="font-bold font-display text-neutral-900 tracking-tight">Attempt history</h3>
        {attempts.length > 0 ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="rounded-lg border border-neutral-200 bg-white p-3 text-sm">
                <span className="font-bold font-mono text-neutral-900">{attempt.score}/10</span> &mdash; <span className="text-slate-600 font-light">{attempt.feedback}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState icon={ClipboardList} title="No attempts yet" message="Submit an answer to see grading feedback and memory score updates." />
          </div>
        )}
      </section>
    </div>
  );
}
