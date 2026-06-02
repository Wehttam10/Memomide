import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Cloud,
  Flame,
  Layers,
  Moon,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getAIStatus, getDashboardSummary } from '../api/dashboard';
import { me } from '../api/auth';
import EmptyState from '../components/EmptyState';

import Loading from '../components/Loading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const RING_RADIUS = 56;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function MemoryRing({ value }) {
  const safe = Math.max(0, Math.min(100, value));
  const offset = RING_CIRC - (safe / 100) * RING_CIRC;
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      className="gauge-glow"
      style={{ '--ring-circumference': RING_CIRC, '--ring-offset': offset }}
    >
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#0f9f9a" />
          <stop offset="100%" stopColor="#f0a202" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r={RING_RADIUS} stroke="rgba(167,139,250,0.18)" strokeWidth="14" fill="none" />
      <circle
        cx="80"
        cy="80"
        r={RING_RADIUS}
        stroke="url(#ringGrad)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={RING_CIRC}
        strokeDashoffset={offset}
        transform="rotate(-90 80 80)"
        className="ring-progress"
      />
      <text x="80" y="80" textAnchor="middle" dominantBaseline="central" fontSize="32" fontWeight="900" fill="#172033">
        {safe}%
      </text>
      <text x="80" y="108" textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="2" fill="#64748b">
        MEMORY
      </text>
    </svg>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { label: 'Good morning', Icon: Sun };
  if (hour < 18) return { label: 'Good afternoon', Icon: Cloud };
  return { label: 'Good evening', Icon: Moon };
}

function scoreChipClass(score) {
  if (score >= 8) return 'score-chip score-chip-good';
  if (score >= 5) return 'score-chip score-chip-mid';
  return 'score-chip score-chip-low';
}

const TOPIC_ROW_TONES = ['topic-row-violet', 'topic-row-coral', 'topic-row-amber', 'topic-row-teal'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch((err) => setError(err.message));

    getAIStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ provider: 'mock', has_api_key: false, mode: 'mock' }));

    me()
      .then(setUser)
      .catch(() => {});
  }, []);

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!data) return <Loading label="Loading dashboard" rows={5} />;

  const hasTopics = data.topic_memory_health.length > 0;
  const hasAttempts = data.recent_attempts.length > 0;
  const averageScore = Math.round(data.average_memory_health_score);
  const { label: greeting, Icon: GreetingIcon } = getGreeting();
  const missionTitle = data.due_reviews_today > 0 ? 'Clear today\'s review queue' : data.weak_topics > 0 ? 'Rescue one weak topic' : 'Generate a fresh practice set';
  const missionText = data.due_reviews_today > 0
    ? `${data.due_reviews_today} topic${data.due_reviews_today === 1 ? '' : 's'} ready for spaced repetition.`
    : data.weak_topics > 0
      ? `${data.weak_topics} weak area${data.weak_topics === 1 ? '' : 's'} can become stronger today.`
      : 'Build momentum by adding notes or generating questions.';
  const nextBadgeTarget = data.weakest_topics[0]?.id ? `/topics/${data.weakest_topics[0].id}/practice` : '/subjects';
  const badges = [
    { label: `${hasAttempts ? data.recent_attempts.length : 0} recent attempts`, icon: CheckCircle2, color: 'text-teal bg-teal/15' },
    { label: `${averageScore}% memory average`, icon: Flame, color: 'text-coral bg-coral/15' },
    { label: aiStatus?.mode === 'real_ai' ? 'Gemini powered' : 'Mock fallback ready', icon: Bot, color: 'text-amber bg-amber/15' },
  ];

  return (
    <div className="space-y-6">
      <section className="celebration-card relative overflow-hidden rounded-2xl shadow-sm">
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-violet-300/45 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-amber/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-coral/30 blur-3xl" />

        <div className="relative grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur">
              <GreetingIcon className="h-3.5 w-3.5" />
              {greeting}, ready to study?
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">
              Welcome,{' '}
              <span className="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">
                {user ? user.name : 'Student'}
              </span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track weak topics, review timing, answer quality, and progress &mdash; all from one focused study workspace.
            </p>
            <div className="mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
              {badges.map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/revision" className="btn-vibrant"><CalendarClock className="h-4 w-4" />Start revision</Link>
              <Link to="/subjects" className="btn-secondary">Manage subjects</Link>
            </div>
            {aiStatus ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-2 text-sm shadow-sm">
                <Bot className={aiStatus.mode === 'real_ai' ? 'h-4 w-4 text-teal' : 'h-4 w-4 text-yellow-600'} />
                <span className="font-semibold text-slate-600">AI Mode:</span>
                <span className="font-bold text-ink">{aiStatus.mode === 'real_ai' ? 'Gemini' : 'Mock'}</span>
              </div>
            ) : null}
          </div>

          <div className="relative border-t border-white/40 bg-white/35 p-6 backdrop-blur lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Memory pulse</p>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <MemoryRing value={averageScore} />
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-bold text-ink">{missionTitle}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{missionText}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-coral/15 p-3 text-center ring-1 ring-coral/25">
                <p className="text-[10px] font-bold uppercase tracking-wider text-coral">Due today</p>
                <p className="mt-1 text-2xl font-black text-ink">{data.due_reviews_today}</p>
              </div>
              <div className="rounded-xl bg-amber/15 p-3 text-center ring-1 ring-amber/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber">Weak</p>
                <p className="mt-1 text-2xl font-black text-ink">{data.weak_topics}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Subjects" value={data.total_subjects} hint="Study areas" icon={BookOpen} accent="teal" />
        <StatCard label="Topics" value={data.total_topics} hint="Tracked concepts" icon={Layers} accent="violet" />
        <StatCard label="Weak topics" value={data.weak_topics} hint="Weak or critical" icon={AlertTriangle} accent="amber" />
        <StatCard label="Due today" value={data.due_reviews_today} hint="Ready to review" icon={CalendarClock} accent="coral" />
        <StatCard label="Average score" value={`${averageScore}%`} hint="Memory health" icon={TrendingUp} accent="ink" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/subjects" className="action-tile action-tile-violet">
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 backdrop-blur">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-black">Add richer notes</p>
              <p className="mt-1 text-sm opacity-90">Better notes produce better AI questions.</p>
            </div>
          </div>
        </Link>
        <Link to="/revision" className="action-tile action-tile-coral">
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 backdrop-blur">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-black">Keep the streak alive</p>
              <p className="mt-1 text-sm opacity-90">Review due topics before they pile up.</p>
            </div>
          </div>
        </Link>
        <Link to={nextBadgeTarget} className="action-tile action-tile-amber">
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 backdrop-blur">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-black">Next badge</p>
              <p className="mt-1 text-sm opacity-90">Score 8+ to push a topic toward Strong.</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="panel xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Memory health by topic</h3>
              <p className="text-sm text-slate-500">Scores update after each graded answer.</p>
            </div>
          </div>
          {hasTopics ? (
            <div className="mt-4 h-80">
              <ResponsiveContainer>
                <AreaChart data={data.topic_memory_health} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memoryFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.42} />
                      <stop offset="55%" stopColor="#0f9f9a" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#f0a202" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="memoryStroke" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="55%" stopColor="#0f9f9a" />
                      <stop offset="100%" stopColor="#f0a202" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#cbd5e1' }} />
                  <Area type="monotone" dataKey="score" stroke="url(#memoryStroke)" strokeWidth={3} fill="url(#memoryFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState icon={Layers} title="No topics tracked yet" message="Create a subject and topic, add notes, then generate questions to begin tracking memory health." actionLabel="Create subject" actionTo="/subjects" />
            </div>
          )}
        </section>

        <section className="panel">
          <h3 className="text-lg font-bold">Weakest topics</h3>
          <p className="text-sm text-slate-500">Best place to spend the next study block.</p>
          {data.weakest_topics.length > 0 ? (
            <div className="mt-4 space-y-3">
              {data.weakest_topics.map((topic, i) => (
                <Link
                  key={topic.id}
                  to={`/topics/${topic.id}/practice`}
                  className={`topic-row ${TOPIC_ROW_TONES[i % TOPIC_ROW_TONES.length]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{topic.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{Math.round(topic.score)}% memory health</p>
                    </div>
                    <StatusBadge status={topic.status} />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(6, Math.round(topic.score))}%`,
                        background: 'linear-gradient(90deg, #8b5cf6, #0f9f9a 60%, #f0a202)',
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState icon={AlertTriangle} title="No weak topics yet" message="Once you answer questions, the coach will surface low-memory topics here." />
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Recent attempts</h3>
            <p className="text-sm text-slate-500">Latest graded answers and feedback.</p>
          </div>
        </div>
        {hasAttempts ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="table-head"><tr><th className="table-cell">Answer</th><th className="table-cell">Score</th><th className="table-cell">Feedback</th><th className="table-cell">Date</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent_attempts.map((attempt) => (
                    <tr key={attempt.id} className="bg-white/70 transition hover:bg-white">
                      <td className="table-cell max-w-md truncate font-medium text-ink">{attempt.student_answer}</td>
                      <td className="table-cell"><span className={scoreChipClass(attempt.score)}>{attempt.score}/10</span></td>
                      <td className="table-cell text-slate-600">{attempt.feedback}</td>
                      <td className="table-cell text-slate-500">{new Date(attempt.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState icon={ClipboardList} title="No attempts yet" message="Generated questions and submitted answers will appear here with AI feedback." actionLabel="Go to subjects" actionTo="/subjects" />
          </div>
        )}
      </section>
    </div>
  );
}
