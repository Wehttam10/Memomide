import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Library, Plus, Sparkles, Trash2 } from 'lucide-react';
import { createSubject, deleteSubject, getSubjects } from '../api/subjects';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

const SUBJECT_TONES = [
  { stripe: 'stat-stripe-violet', icon: 'bg-neutral-100 text-neutral-850 border border-neutral-200', hover: 'hover:text-black' },
  { stripe: 'stat-stripe-teal', icon: 'bg-neutral-100 text-neutral-850 border border-neutral-200', hover: 'hover:text-black' },
  { stripe: 'stat-stripe-coral', icon: 'bg-neutral-100 text-neutral-850 border border-neutral-200', hover: 'hover:text-black' },
  { stripe: 'stat-stripe-amber', icon: 'bg-neutral-100 text-neutral-850 border border-neutral-200', hover: 'hover:text-black' },
];

export default function Subjects() {
  const [subjects, setSubjects] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  async function load() {
    setSubjects(await getSubjects());
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    await createSubject(form);
    setForm({ name: '', description: '' });
    await load();
  }

  async function handleDelete(id) {
    await deleteSubject(id);
    await load();
  }

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!subjects) return <Loading label="Loading subjects" rows={4} />;

  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden p-6 sm:p-7">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="feature-pill">
              <Library className="h-3.5 w-3.5 text-neutral-600" />
              Study library
            </div>
            <h2 className="mt-3 text-3xl font-bold font-display tracking-tight text-neutral-900 sm:text-4xl">
              Your <span className="underline decoration-neutral-300 decoration-wavy">subjects</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Organize topics by course, module, or exam paper. Each subject powers AI questions and spaced repetition.
            </p>
          </div>
          <div className="rounded-lg bg-neutral-50 border border-neutral-250 px-4 py-3 text-center">
            <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-neutral-500">In library</p>
            <p className="mt-1 text-3xl font-bold font-display text-neutral-900 leading-none">{subjects.length}</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Card / Form */}
          {form.isCreating ? (
            <form
              onSubmit={handleCreate}
              className="panel relative overflow-hidden bg-white border-2 border-indigo-500/20 shadow-sm flex flex-col h-full min-h-[240px]"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold font-display text-neutral-900 tracking-tight">New notebook</h3>
                  <button type="button" onClick={() => setForm({ name: '', description: '', isCreating: false })} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <input
                  className="field w-full text-sm"
                  placeholder="Notebook name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
                <textarea
                  className="field w-full min-h-[80px] text-sm resize-none"
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="pt-4 mt-auto">
                <button className="btn-primary w-full shadow-sm" disabled={!form.name.trim()}>
                  Create Notebook
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setForm({ ...form, isCreating: true })}
              className="panel flex flex-col items-center justify-center min-h-[240px] bg-white border border-neutral-200 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-50/60 flex items-center justify-center mb-5 group-hover:bg-indigo-100/80 transition-colors">
                <Plus className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="text-xl font-display text-neutral-900">Create new notebook</span>
            </button>
          )}

          {/* Existing Subjects */}
          {subjects.map((subject, i) => {
            const tone = SUBJECT_TONES[i % SUBJECT_TONES.length];
            return (
              <div
                key={subject.id}
                className="panel relative overflow-hidden flex flex-col min-h-[240px] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:border-neutral-350"
              >
                <div className={`stat-stripe ${tone.stripe}`} />
                <div className="flex items-start gap-3 flex-1">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
                    <BookOpen className="h-5 w-5 pointer-events-none" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/subjects/${subject.id}`}
                      className={`text-lg font-bold font-display tracking-tight text-neutral-900 transition-colors ${tone.hover}`}
                    >
                      {subject.name}
                    </Link>
                    <p className="mt-1 text-sm leading-6 text-slate-500 line-clamp-3">
                      {subject.description || 'No description yet.'}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-neutral-100">
                  <Link
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-800 hover:text-black font-display tracking-tight transition-transform hover:translate-x-0.5"
                    to={`/subjects/${subject.id}`}
                  >
                    Open notebook
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => handleDelete(subject.id)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
