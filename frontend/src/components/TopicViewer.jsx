import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Wand2, Plus, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { createNote, deleteNote, getNotes } from '../api/notes';
import { generateQuestions } from '../api/questions';
import { getTopic } from '../api/topics';
import { getAIStatus } from '../api/dashboard';
import EmptyState from './EmptyState';
import Loading from './Loading';
import StatusBadge from './StatusBadge';

export default function TopicViewer({ topicId, onDeleted }) {
  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  async function load() {
    setError('');
    try {
      const [topicData, notesData] = await Promise.all([getTopic(topicId), getNotes(topicId)]);
      setTopic(topicData);
      setNotes(notesData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    getAIStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ mode: 'mock' }));
    setMessage('');
  }, [topicId]);

  async function saveNote(event) {
    event.preventDefault();
    if (!content.trim()) return;
    await createNote(topicId, { content });
    setContent('');
    await load();
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent((prev) => prev + (prev ? '\n\n' : '') + `--- ${file.name} ---\n\n` + event.target.result);
      };
      reader.readAsText(file);
    }
  }

  async function handleGenerate() {
    setMessage('');
    setGenerating(true);
    try {
      const result = await generateQuestions(topicId);
      const modeLabel = result.aiMode === 'real_ai' ? 'Gemini AI' : 'Mock AI fallback';
      setMessage(`${result.questions.length} questions generated with ${modeLabel}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (error) return <div className="p-6 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg m-6">{error}</div>;
  if (!topic) return <div className="p-6 h-full flex items-center justify-center"><Loading label="Loading topic" rows={3} /></div>;

  return (
    <div className="flex flex-col h-full bg-neutral-50 overflow-y-auto">
      <div className="p-6 lg:p-8 shrink-0 border-b border-neutral-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold font-display tracking-tight text-neutral-900">{topic.title}</h2>
              <StatusBadge status={topic.status} />
            </div>
            <p className="mt-2 text-slate-600 max-w-2xl">{topic.description || 'No description provided.'}</p>
          </div>
          <Link
            to={`/topics/${topic.id}/practice`}
            className="btn-primary"
          >
            Practice Topic
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="p-6 lg:p-8 flex-1">
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display tracking-tight text-neutral-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-400" />
                Source Notes
              </h3>
              <button 
                className="btn-secondary text-xs py-1.5 px-3" 
                onClick={handleGenerate} 
                disabled={generating || notes.length === 0}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
                {generating ? 'Generating...' : 'Auto-Generate Questions'}
              </button>
            </div>

            {message && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex justify-between items-center">
                {message}
                <Link className="font-semibold underline hover:text-emerald-900" to={`/topics/${topicId}/practice`}>Practice now</Link>
              </div>
            )}

            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <article key={note.id} className="group relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-350 hover:shadow-md">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{note.content}</p>
                    <button 
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded" 
                      onClick={() => deleteNote(note.id).then(load)}
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={FileText} 
                title="No sources added" 
                message="Add notes to this topic. These notes act as context for the Subject AI and are used to generate revision questions." 
              />
            )}
          </div>

          <div>
            <form onSubmit={saveNote} className="panel space-y-3 sticky top-6 bg-white shadow-sm border border-neutral-200 rounded-xl p-5">
              <h4 className="font-bold font-display text-neutral-900 tracking-tight flex items-center gap-2 text-sm uppercase">
                <Plus className="w-4 h-4" /> Add Source
              </h4>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-lg border-2 border-dashed transition-colors p-1 ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                <textarea 
                  className={`field w-full min-h-[200px] text-sm resize-none bg-transparent border-0 focus:ring-0 ${
                    isDragging ? 'pointer-events-none opacity-50' : ''
                  }`} 
                  placeholder="Paste text from documents, or drag & drop a text file here..." 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                />
                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-indigo-600 font-bold bg-white/80 px-4 py-2 rounded-full shadow-sm">
                      Drop file to insert text
                    </span>
                  </div>
                )}
              </div>
              <button className="btn-primary w-full shadow-sm text-sm" disabled={!content.trim()}>
                Save Source
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
