import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layers, Plus } from 'lucide-react';
import { getSubject, updateSubject } from '../api/subjects';
import { createTopic, deleteTopic, getTopics } from '../api/topics';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  async function load() {
    const [subjectData, topicData] = await Promise.all([getSubject(subjectId), getTopics(subjectId)]);
    setSubject(subjectData);
    setTopics(topicData);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [subjectId]);

  async function saveSubject(event) {
    event.preventDefault();
    setSubject(await updateSubject(subjectId, { name: subject.name, description: subject.description }));
  }

  async function addTopic(event) {
    event.preventDefault();
    await createTopic(subjectId, topicForm);
    setTopicForm({ title: '', description: '' });
    await load();
  }

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!subject) return <Loading label="Loading subject" rows={4} />;

  return (
    <div className="space-y-6">
      <form onSubmit={saveSubject} className="panel grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <input className="field text-lg font-bold" value={subject.name} onChange={(e) => setSubject({ ...subject, name: e.target.value })} />
          <textarea className="field" value={subject.description || ''} onChange={(e) => setSubject({ ...subject, description: e.target.value })} />
        </div>
        <button className="btn-secondary self-start">Save</button>
      </form>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel">
          <h2 className="text-xl font-bold font-display text-neutral-900 tracking-tight">Topics</h2>
          <p className="text-sm text-slate-500">Each topic can hold notes, generated questions, and memory scores.</p>
          {topics.length > 0 ? (
            <div className="mt-4 space-y-3">
              {topics.map((topic) => (
                <div key={topic.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-350 transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link to={`/topics/${topic.id}`} className="font-bold font-display tracking-tight text-neutral-900 hover:text-black transition-colors">{topic.title}</Link>
                      <p className="text-sm text-slate-500 mt-0.5">{topic.description}</p>
                    </div>
                    <StatusBadge status={topic.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="btn-secondary" to={`/topics/${topic.id}/notes`}>Notes</Link>
                    <Link className="btn-primary" to={`/topics/${topic.id}/practice`}>Practice</Link>
                    <button className="btn-secondary" onClick={() => deleteTopic(topic.id).then(load)} type="button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState icon={Layers} title="No topics in this subject" message="Create a topic to add notes, generate revision questions, and start tracking memory health." />
            </div>
          )}
        </section>
        <form onSubmit={addTopic} className="panel space-y-3 lg:sticky lg:top-24 lg:self-start">
          <h3 className="font-bold font-display text-neutral-900 tracking-tight">Create topic</h3>
          <input className="field" placeholder="Topic title" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} />
          <textarea className="field min-h-28" placeholder="Description" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} />
          <button className="btn-primary w-full"><Plus className="h-4 w-4" />Add topic</button>
        </form>
      </div>
    </div>
  );
}
