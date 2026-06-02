import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTopic, updateTopic } from '../api/topics';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';

export default function TopicDetail() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getTopic(topicId).then(setTopic).catch((err) => setError(err.message));
  }, [topicId]);

  async function save(event) {
    event.preventDefault();
    setTopic(await updateTopic(topicId, { title: topic.title, description: topic.description }));
  }

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!topic) return <Loading label="Loading topic" />;

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="panel space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input className="field max-w-xl text-xl font-bold" value={topic.title} onChange={(e) => setTopic({ ...topic, title: e.target.value })} />
          <StatusBadge status={topic.status} />
        </div>
        <textarea className="field" value={topic.description || ''} onChange={(e) => setTopic({ ...topic, description: e.target.value })} />
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>{Math.round(topic.memory_health_score)}% memory health</span>
          <span>Next review: {topic.next_review_date ? new Date(topic.next_review_date).toLocaleDateString() : 'Not scheduled'}</span>
        </div>
        <button className="btn-secondary">Save topic</button>
      </form>
      <div className="flex flex-wrap gap-3">
        <Link className="btn-secondary" to={`/topics/${topic.id}/notes`}>Manage notes</Link>
        <Link className="btn-primary" to={`/topics/${topic.id}/practice`}>Practice questions</Link>
      </div>
    </div>
  );
}
