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

export default function TopicViewer({ topicId, onDeleted, leftToggle, rightToggle }) {
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* h-16 Baseline Header */}
      <div className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {leftToggle}
          <h2 className="text-base font-bold font-display tracking-tight text-slate-900 truncate max-w-[150px] sm:max-w-xs md:max-w-md" title={topic.title}>{topic.title}</h2>
          <StatusBadge status={topic.status} />
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/topics/${topic.id}/practice`}
            className="btn-primary text-xs py-1.5 px-3.5"
          >
            Practice
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          {rightToggle}
        </div>
      </div>

      {/* Main content pane - scrollable */}
      <div className="p-6 lg:p-8 flex-1 overflow-y-auto">
        {topic.description && (
          <p className="text-sm text-slate-500 mb-6 bg-slate-100/50 border border-slate-200/60 p-4 rounded-xl font-sans">
            {topic.description}
          </p>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Source Notes
              </h3>
              <button 
                className="btn-secondary text-xs py-1.5 px-3" 
                onClick={handleGenerate} 
                disabled={generating || notes.length === 0}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
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
                  <article key={note.id} className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-350 hover:shadow-md">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{note.content}</p>
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
            <form onSubmit={saveNote} className="panel space-y-3 sticky top-6 bg-white shadow-sm border border-slate-200 rounded-xl p-5">
              <h4 className="font-bold font-display text-slate-900 tracking-tight flex items-center gap-2 text-sm uppercase">
                <Plus className="w-4 h-4" /> Add Source
              </h4>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ease-elegant p-1 ${
                  isDragging ? 'border-teal-500 bg-teal-50/50 shadow-inner' : 'border-slate-200 hover:border-slate-300 bg-white'
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
                    <span className="text-teal-700 font-bold bg-white border border-teal-200 px-4 py-2 rounded-xl shadow-md text-xs font-display">
                      Drop text file to upload source
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
