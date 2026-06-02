import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { register } from '../api/auth';

const perks = [
  'Personalised revision queue from day one',
  'AI-generated flashcards from your notes',
  'Track streaks across every subject',
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-shell landing-grid relative min-h-screen overflow-hidden">
      <div className="blob blob-violet" />
      <div className="blob blob-teal" />
      <div className="blob blob-amber" />
      <div className="blob blob-coral" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-stretch gap-10 px-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        <section className="flex flex-1 flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            Start your study streak
          </div>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Make every page{' '}
            <span className="bg-gradient-to-r from-amber via-coral to-violet-600 bg-clip-text text-transparent">
              actually stick.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Build a study habit that compounds. MemoMind plans your revisions,
            celebrates your wins, and keeps your favourite subjects alive in long-term
            memory.
          </p>

          <ul className="mt-8 max-w-xl space-y-3">
            {perks.map((perk, i) => (
              <li key={perk} className="feature-pill w-full justify-start">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                    i === 0
                      ? 'bg-violet-500'
                      : i === 1
                        ? 'bg-teal'
                        : 'bg-amber'
                  }`}
                >
                  {i + 1}
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full lg:max-w-md">
          <form onSubmit={handleSubmit} className="glass-card relative space-y-5">
            <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

            <div className="flex items-center gap-3">
              <img
                src="/memomind-logo.jpeg"
                alt="MemoMind logo"
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-violet-200"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  MemoMind
                </p>
                <h2 className="text-xl font-bold text-ink">Create your account</h2>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              No credit card. Just bring your notes and your curiosity.
            </p>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
                {error}
              </p>
            ) : null}

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Name</span>
                <input
                  className="field-vibrant"
                  placeholder="Ada Lovelace"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Email</span>
                <input
                  className="field-vibrant"
                  placeholder="you@student.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Password</span>
                <input
                  className="field-vibrant"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>
            </div>

            <button className="btn-vibrant w-full" disabled={loading}>
              {loading ? 'Creating account…' : (
                <>
                  Start studying
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already registered?{' '}
              <Link className="font-semibold text-violet-600 hover:text-violet-700" to="/login">
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
