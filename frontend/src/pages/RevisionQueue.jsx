import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, ClipboardList, Flame, Zap } from 'lucide-react';
import { getRevisionDue } from '../api/dashboard';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';

const STATUS_ROW_TONES = {
  Critical: 'topic-row-coral',
  Weak: 'topic-row-amber',
  Good: 'topic-row-teal',
  Strong: 'topic-row-violet',
};

function healthBarStyle(score) {
  return {
    width: `${Math.max(6, Math.round(score))}%`,
    background: 'linear-gradient(90deg, #8b5cf6, #0f9f9a 60%, #f0a202)',
  };
}

export default function RevisionQueue() {
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getRevisionDue().then(setTopics).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!topics) return <Loading label="Loading revision queue" rows={5} />;

  const criticalCount = topics.filter((t) => t.status === 'Critical').length;
  const weakCount = topics.filter((t) => t.status === 'Weak').length;

  return (
    <div className="space-y-6">
      <section className="celebration-card relative overflow-hidden rounded-2xl p-6 shadow-sm sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-violet-300/45 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-coral/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-amber/40 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur">
              <CalendarCheck className="h-3.5 w-3.5" />
              Spaced repetition
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
              Today&rsquo;s{' '}
              <span className="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">
                revision queue
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Critical and weak topics are prioritized before routine due reviews. Knock them out while they&rsquo;re fresh.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold text-ink shadow-sm ring-1 ring-violet-100">
                <Flame className="h-3.5 w-3.5 text-coral" />
                {topics.length} ready to review
              </span>
              {criticalCount > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                  <Zap className="h-3.5 w-3.5" />
                  {criticalCount} critical
                </span>
              ) : null}
              {weakCount > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 ring-1 ring-yellow-200">
                  {weakCount} weak
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 px-5 py-4 text-center shadow-sm ring-1 ring-violet-100 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">Queue size</p>
            <p className="mt-1 text-4xl font-black leading-none text-ink">{topics.length}</p>
            <p className="mt-1 text-xs text-slate-500">topic{topics.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl">
        {topics.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-white/60 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="table-head">
                    <tr>
                      <th className="table-cell">Topic</th>
                      <th className="table-cell">Subject</th>
                      <th className="table-cell">Health</th>
                      <th className="table-cell">Status</th>
                      <th className="table-cell">Next review</th>
                      <th className="table-cell">Reason</th>
                      <th className="table-cell"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topics.map((topic) => (
                      <tr key={topic.id} className="bg-white/75 transition hover:bg-white">
                        <td className="table-cell font-bold text-ink">{topic.title}</td>
                        <td className="table-cell text-slate-600">{topic.subject_name}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="w-10 font-black text-ink">{Math.round(topic.memory_health_score)}%</span>
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full" style={healthBarStyle(topic.memory_health_score)} />
                            </div>
                          </div>
                        </td>
                        <td className="table-cell"><StatusBadge status={topic.status} /></td>
                        <td className="table-cell text-slate-600">{new Date(topic.next_review_date).toLocaleDateString()}</td>
                        <td className="table-cell text-slate-600">{topic.reason}</td>
                        <td className="table-cell text-right">
                          <Link
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-700"
                            to={`/topics/${topic.id}/practice`}
                          >
                            Practice
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:hidden">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/topics/${topic.id}/practice`}
                  className={`topic-row ${STATUS_ROW_TONES[topic.status] || 'topic-row-violet'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-ink">{topic.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{topic.subject_name}</p>
                    </div>
                    <StatusBadge status={topic.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-black text-ink">{Math.round(topic.memory_health_score)}% health</span>
                    <span className="text-slate-500">{new Date(topic.next_review_date).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={healthBarStyle(topic.memory_health_score)} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{topic.reason}</p>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="Nothing due today"
            message="You are clear for now. New reviews will appear here after answering practice questions or when seeded demo topics become due."
            actionLabel="Browse subjects"
            actionTo="/subjects"
          />
        )}
      </section>
    </div>
  );
}
