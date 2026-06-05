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

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {subjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map((subject, i) => {
                const tone = SUBJECT_TONES[i % SUBJECT_TONES.length];
                return (
                  <div
                    key={subject.id}
                    className="panel relative overflow-hidden transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:border-neutral-350"
                  >
                    <div className={`stat-stripe ${tone.stripe}`} />
                    <div className="flex items-start gap-3">
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
                        <p className="mt-1 min-h-10 text-sm leading-6 text-slate-500">
                          {subject.description || 'No description yet.'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-800 hover:text-black font-display tracking-tight transition-transform hover:translate-x-0.5"
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
            <div className="panel rounded-lg">
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
          className="panel space-y-3 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white bg-neutral-900">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold font-display text-neutral-900 tracking-tight">Create subject</h3>
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
