import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layers, Plus, BookOpen, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSubject } from '../api/subjects';
import { createTopic, deleteTopic, getTopics } from '../api/topics';
import Loading from '../components/Loading';
import SubjectChat from '../components/SubjectChat';
import TopicViewer from '../components/TopicViewer';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  
  // Workspace State
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  async function load() {
    try {
      const [subjectData, topicData] = await Promise.all([getSubject(subjectId), getTopics(subjectId)]);
      setSubject(subjectData);
      setTopics(topicData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [subjectId]);

  async function addTopic(event) {
    event.preventDefault();
    if (!topicForm.title.trim()) return;
    await createTopic(subjectId, topicForm);
    setTopicForm({ title: '', description: '' });
    await load();
  }

  if (error) return <div className="panel text-rose-700 m-6">{error}</div>;
  if (!subject) return <div className="p-6"><Loading label="Loading workspace" rows={4} /></div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-neutral-100 overflow-hidden -mx-6 -my-8 lg:-mx-8">
      {/* LEFT PANE: Sources Sidebar */}
      <div className={`shrink-0 bg-neutral-50 border-r border-neutral-200 flex flex-col transition-all duration-300 ${showSidebar ? 'w-72 lg:w-80' : 'w-0 overflow-hidden border-r-0'}`}>
        <div className="p-4 border-b border-neutral-200 bg-white shrink-0">
          <Link to="/subjects" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-black transition-colors mb-2">
            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Library
          </Link>
          <h2 className="text-xl font-bold font-display tracking-tight text-neutral-900 truncate">{subject.name}</h2>
          <p className="text-xs text-slate-500 mt-1 truncate">{subject.description || 'Workspace'}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Sources ({topics.length})
            </h3>
            <div className="space-y-1.5">
              <button 
                onClick={() => setSelectedTopicId(null)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${selectedTopicId === null ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-200/50'}`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Subject Guide
              </button>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex flex-col gap-0.5 ${selectedTopicId === topic.id ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-200/50'}`}
                >
                  <span className="truncate">{topic.title}</span>
                  <span className={`text-xs truncate ${selectedTopicId === topic.id ? 'text-neutral-300' : 'text-slate-500'}`}>{topic.status}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={addTopic} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Add Source</h4>
            <input 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" 
              placeholder="Topic title..." 
              value={topicForm.title} 
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} 
            />
            <button className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 font-semibold rounded-lg px-3 py-2 text-sm transition-all" disabled={!topicForm.title.trim()}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>
      </div>

      {/* CENTER PANE: Viewer */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!showSidebar && (
            <button onClick={() => setShowSidebar(true)} className="p-1.5 bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:text-black">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {selectedTopicId ? (
          <TopicViewer topicId={selectedTopicId} onDeleted={load} />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6 border border-neutral-200 shadow-sm">
              <BookOpen className="w-8 h-8 text-neutral-700" />
            </div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-neutral-900 mb-2">{subject.name}</h2>
            <p className="text-slate-500 max-w-md mb-8">{subject.description || 'Welcome to your subject workspace. Select a source from the left sidebar to view notes, or ask the AI assistant questions about this subject.'}</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-lg w-full text-left">
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                <h4 className="font-bold text-neutral-900 flex items-center gap-2 mb-1"><Layers className="w-4 h-4" /> Sources</h4>
                <p className="text-sm text-slate-500">{topics.length} topics added</p>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                <h4 className="font-bold text-neutral-900 flex items-center gap-2 mb-1"><MessageSquare className="w-4 h-4" /> AI Assistant</h4>
                <p className="text-sm text-slate-500">Ready to answer questions</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANE: Chat */}
      <div className={`shrink-0 transition-all duration-300 relative ${showChat ? 'w-80 lg:w-[360px]' : 'w-0 overflow-hidden'}`}>
        {showChat && <SubjectChat subjectId={subjectId} />}
      </div>

      {/* Chat Toggle Button (Floating if chat is closed, or inline if open but we can put it in header) */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={() => setShowChat(!showChat)} 
          className={`p-2 rounded-md shadow-sm transition-colors flex items-center gap-2 text-sm font-semibold border ${showChat ? 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200' : 'bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800'}`}
        >
          <MessageSquare className="w-4 h-4" />
          {!showChat && "Chat"}
        </button>
      </div>

    </div>
  );
}
