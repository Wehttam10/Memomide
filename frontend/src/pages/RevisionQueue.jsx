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
    backgroundColor: '#09090b',
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
      <section className="panel relative overflow-hidden p-6 sm:p-7">
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="feature-pill">
              <CalendarCheck className="h-3.5 w-3.5 text-neutral-600" />
              Spaced repetition
            </div>
            <h2 className="mt-3 text-3xl font-bold font-display tracking-tight text-neutral-900 sm:text-4xl">
              Today&rsquo;s <span className="underline decoration-neutral-300 decoration-wavy">revision queue</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Critical and weak topics are prioritized before routine due reviews. Knock them out while they&rsquo;re fresh.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded bg-neutral-100 border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-800 font-mono">
                <Flame className="h-3.5 w-3.5 text-neutral-900 pointer-events-none" />
                {topics.length} ready to review
              </span>
              {criticalCount > 0 ? (
                <span className="inline-flex items-center gap-2 rounded bg-neutral-900 border border-neutral-900 px-3 py-1.5 text-xs font-bold text-white font-mono">
                  <Zap className="h-3.5 w-3.5 pointer-events-none" />
                  {criticalCount} critical
                </span>
              ) : null}
              {weakCount > 0 ? (
                <span className="inline-flex items-center gap-2 rounded bg-neutral-200 border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-800 font-mono">
                  {weakCount} weak
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg bg-neutral-50 border border-neutral-250 px-5 py-4 text-center">
            <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-neutral-500">Queue size</p>
            <p className="mt-1 text-4xl font-bold font-display leading-none text-neutral-900">{topics.length}</p>
            <p className="mt-1 text-xs text-slate-500 font-mono">topic{topics.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        {topics.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-neutral-200 md:block hidden">
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
                      <tr key={topic.id} className="bg-white transition hover:bg-neutral-50">
                        <td className="table-cell font-bold text-neutral-900 font-display tracking-tight">{topic.title}</td>
                        <td className="table-cell text-slate-600">{topic.subject_name}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="w-10 font-bold font-mono text-neutral-900">{Math.round(topic.memory_health_score)}%</span>
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-100">
                              <div className="h-full rounded-full" style={healthBarStyle(topic.memory_health_score)} />
                            </div>
                          </div>
                        </td>
                        <td className="table-cell"><StatusBadge status={topic.status} /></td>
                        <td className="table-cell text-slate-600 font-mono text-xs">{new Date(topic.next_review_date).toLocaleDateString()}</td>
                        <td className="table-cell text-slate-600">{topic.reason}</td>
                        <td className="table-cell text-right">
                          <Link
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-800 hover:text-black font-display tracking-tight transition-transform hover:translate-x-0.5"
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
                      <p className="font-bold font-display text-neutral-900 tracking-tight">{topic.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{topic.subject_name}</p>
                    </div>
                    <StatusBadge status={topic.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-neutral-900">{Math.round(topic.memory_health_score)}% health</span>
                    <span className="text-slate-400">{new Date(topic.next_review_date).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full" style={healthBarStyle(topic.memory_health_score)} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 leading-normal">{topic.reason}</p>
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
