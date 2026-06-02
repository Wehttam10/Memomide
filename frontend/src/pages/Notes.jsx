import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText, Wand2 } from 'lucide-react';
import { getAIStatus } from '../api/dashboard';
import { createNote, deleteNote, getNotes } from '../api/notes';
import { generateQuestions } from '../api/questions';
import { getTopic } from '../api/topics';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function Notes() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [aiStatus, setAiStatus] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [topicData, notesData] = await Promise.all([getTopic(topicId), getNotes(topicId)]);
    setTopic(topicData);
    setNotes(notesData);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
    getAIStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ provider: 'mock', has_api_key: false, mode: 'mock' }));
  }, [topicId]);

  async function saveNote(event) {
    event.preventDefault();
    await createNote(topicId, { content });
    setContent('');
    await load();
  }

  async function handleGenerate() {
    setMessage('');
    setFallbackReason('');
    setGenerating(true);
    try {
      const result = await generateQuestions(topicId);
      const modeLabel = result.aiMode === 'real_ai' ? 'Gemini AI' : 'Mock AI fallback';
      setMessage(`${result.questions.length} questions generated with ${modeLabel}.`);
      setFallbackReason(result.fallbackReason || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!topic) return <Loading label="Loading notes" rows={4} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">{topic.title} notes</h2>
            <p className="text-sm text-slate-500">Manual notes for the MVP. Upload support can plug in here later.</p>
          </div>
          <button className="btn-primary" onClick={handleGenerate} type="button" disabled={generating || notes.length === 0}>
            <Wand2 className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>
          <div className="mt-4 rounded-lg border border-teal/15 bg-[#edf8f5] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-slate-700">
              AI Mode: {aiStatus?.mode === 'real_ai' ? 'Gemini' : 'Mock'}
            </span>
            <span className="text-slate-500">
              {generating
                ? aiStatus?.mode === 'real_ai'
                  ? 'Gemini is analyzing your notes and designing questions.'
                  : 'Mock generator is creating note-based questions.'
                : 'Generated questions use the backend AI service.'}
            </span>
          </div>
          {generating ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="ai-progress-bar h-full w-1/2 rounded-full bg-teal" />
            </div>
          ) : null}
        </div>
        {message ? <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message} <Link className="font-semibold underline" to={`/topics/${topicId}/practice`}>Practice now</Link></p> : null}
        {fallbackReason ? (
          <p className="mt-3 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Gemini fallback reason: {fallbackReason}
          </p>
        ) : null}
        {notes.length > 0 ? (
          <div className="mt-5 space-y-3">
            {notes.map((note) => (
        <article key={note.id} className="rounded-lg border border-teal/15 bg-white/80 p-4 shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{note.content}</p>
                <button className="btn-secondary mt-3" onClick={() => deleteNote(note.id).then(load)} type="button">Delete</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState icon={FileText} title="No notes yet" message="Add text notes first. The mock AI generator uses your notes to create revision questions." />
          </div>
        )}
      </section>
      <form onSubmit={saveNote} className="panel space-y-3 lg:sticky lg:top-24 lg:self-start">
        <h3 className="font-bold">Add note</h3>
        <textarea className="field min-h-72" placeholder="Paste or write study notes here..." value={content} onChange={(e) => setContent(e.target.value)} />
        <button className="btn-primary w-full">Save note</button>
      </form>
    </div>
  );
}
