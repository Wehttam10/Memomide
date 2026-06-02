import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Flame, Target, ArrowRight } from 'lucide-react';
import { login } from '../api/auth';

const features = [
  { icon: Brain, label: 'AI memory coach', tone: 'text-violet-600 bg-violet-100' },
  { icon: Sparkles, label: 'Smart revision queue', tone: 'text-teal bg-teal/15' },
  { icon: Flame, label: 'Daily streaks & rewards', tone: 'text-amber bg-amber/15' },
  { icon: Target, label: 'Subject-wise progress', tone: 'text-coral bg-coral/15' },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'demo@student.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
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
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
            Your AI study companion
          </div>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Study smarter,{' '}
            <span className="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">
              remember longer.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-600">
            MemoMind turns your notes into spaced-repetition flashcards, surfaces what
            you&rsquo;re about to forget, and keeps your study rhythm humming &mdash; one
            calm, colourful session at a time.
          </p>

          <ul className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            {features.map(({ icon: Icon, label, tone }) => (
              <li key={label} className="feature-pill">
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-slate-600">
            <div className="flex -space-x-2">
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-violet-600" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-teal to-emerald-500" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-amber to-orange-500" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-coral to-rose-500" />
            </div>
            <p>
              Joined by{' '}
              <span className="font-semibold text-ink">curious learners</span> who
              study with calm focus.
            </p>
          </div>
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
                <h2 className="text-xl font-bold text-ink">Welcome back</h2>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Sign in to pick up exactly where your brain left off.
            </p>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
                {error}
              </p>
            ) : null}

            <div className="space-y-3">
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>
            </div>

            <button className="btn-vibrant w-full" disabled={loading}>
              {loading ? 'Signing in…' : (
                <>
                  Continue studying
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              New here?{' '}
              <Link className="font-semibold text-violet-600 hover:text-violet-700" to="/register">
                Create your account
              </Link>
            </p>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Made for curious learners. Free to start.
          </p>
        </section>
      </div>
    </div>
  );
}
