import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Library, Plus, Sparkles, Trash2 } from 'lucide-react';
import { createSubject, deleteSubject, getSubjects } from '../api/subjects';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

const SUBJECT_TONES = [
  { stripe: 'stat-stripe-violet', icon: 'bg-violet-100 text-violet-600', hover: 'hover:text-violet-600' },
  { stripe: 'stat-stripe-teal', icon: 'bg-teal/15 text-teal', hover: 'hover:text-teal' },
  { stripe: 'stat-stripe-coral', icon: 'bg-coral/15 text-coral', hover: 'hover:text-coral' },
  { stripe: 'stat-stripe-amber', icon: 'bg-amber/15 text-amber', hover: 'hover:text-amber' },
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
      <section className="celebration-card relative overflow-hidden rounded-2xl p-6 shadow-sm sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-violet-300/45 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-amber/40 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur">
              <Library className="h-3.5 w-3.5" />
              Study library
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
              Your{' '}
              <span className="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">
                subjects
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Organize topics by course, module, or exam paper. Each subject powers AI questions and spaced repetition.
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-center shadow-sm ring-1 ring-violet-100 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">In library</p>
            <p className="mt-1 text-3xl font-black text-ink">{subjects.length}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {subjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map((subject, i) => {
                const tone = SUBJECT_TONES[i % SUBJECT_TONES.length];
                return (
                  <div
                    key={subject.id}
                    className="panel relative overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                  >
                    <div className={`stat-stripe ${tone.stripe}`} />
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/subjects/${subject.id}`}
                          className={`text-lg font-black text-ink ${tone.hover}`}
                        >
                          {subject.name}
                        </Link>
                        <p className="mt-1 min-h-10 text-sm leading-6 text-slate-500">
                          {subject.description || 'No description yet.'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-700"
                        to={`/subjects/${subject.id}`}
                      >
                        Open subject
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
          ) : (
            <div className="panel rounded-2xl">
              <EmptyState
                icon={BookOpen}
                title="No subjects yet"
                message="Create your first subject to start adding topics, notes, and revision questions."
              />
            </div>
          )}
        </section>

        <form
          onSubmit={handleCreate}
          className="panel space-y-3 rounded-2xl lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md shadow-violet-500/30" style={{ background: 'linear-gradient(135deg, #8b5cf6, #0f9f9a)' }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-black text-ink">Create subject</h3>
          </div>
          <p className="text-sm text-slate-500">
            Give it a clear name &mdash; it&rsquo;s the anchor for every topic underneath.
          </p>
          <input
            className="field-vibrant"
            placeholder="Subject name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            className="field-vibrant min-h-28"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button className="btn-vibrant w-full">
            <Plus className="h-4 w-4" />
            Add subject
          </button>
        </form>
      </div>
    </div>
  );
}
