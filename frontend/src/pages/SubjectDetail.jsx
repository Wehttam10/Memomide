import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layers, Plus, BookOpen, MessageSquare, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getSubject } from '../api/subjects';
import { deleteTopic, getTopics } from '../api/topics';
import Loading from '../components/Loading';
import SubjectChat from '../components/SubjectChat';
import TopicViewer from '../components/TopicViewer';
import SwipeableSourceItem from '../components/SwipeableSourceItem';
import AddSourceModal from '../components/AddSourceModal';

function SubjectDashboardGuide({ subject, topics, onAddSource }) {
  const hasSources = topics.length > 0;
  
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto flex flex-col justify-center min-h-full py-12">
      <header className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 shadow-sm mb-4">
          <BookOpen className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-800">{subject.name}</h2>
        <p className="mt-2 text-slate-500 max-w-md mx-auto">{subject.description || 'Welcome to your subject study space. Let\'s prepare your study materials.'}</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">Setup Progress</h3>
        <div className="space-y-4">
          
          {/* Step 1: Add Sources */}
          <div className="flex gap-4 items-start">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              hasSources ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
            }`}>
              {hasSources ? '✓' : '1'}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-800">Add Study Materials (Sources)</h4>
              <p className="text-xs text-slate-500">Paste notes or drag text files to build context for the AI coach.</p>
              {!hasSources && (
                <button 
                  onClick={onAddSource}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800"
                >
                  <Plus className="w-3 h-3" /> Add your first source note
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 ml-3"></div>

          {/* Step 2: Select a Topic */}
          <div className="flex gap-4 items-start">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              hasSources ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-800">Select a Source to Review</h4>
              <p className="text-xs text-slate-500 font-sans">Click a source in the left panel to read through notes and edit text context.</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 ml-3"></div>

          {/* Step 3: Auto-Generate Questions & Practice */}
          <div className="flex gap-4 items-start">
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono bg-slate-100 text-slate-400">
              3
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-800 font-sans">Auto-Generate & Practice Spaced Repetition</h4>
              <p className="text-xs text-slate-500 font-sans">Let the AI coach generate customized revision questions based directly on your study notes to track retention.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Notebook
            </h4>
            <p className="text-sm font-semibold text-slate-700">{topics.length} sources added</p>
          </div>
        </div>

        <button 
          onClick={onAddSource}
          className="p-4 rounded-xl border border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/10 hover:bg-teal-50/20 transition text-left flex flex-col justify-between group"
        >
          <div className="flex justify-between w-full items-center mb-1">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Workspace
            </h4>
            <ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-sm font-semibold text-teal-900 font-sans">Add a source note</p>
        </button>
      </div>
    </div>
  );
}

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  
  // Workspace State
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [showChat, setShowChat] = useState(() => window.innerWidth >= 1280);
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth >= 1024);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);

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

  function handleSourceAdded(newTopicId) {
    load().then(() => {
      setSelectedTopicId(newTopicId);
    });
  }

  async function handleDeleteTopic(id) {
    try {
      await deleteTopic(id);
      if (selectedTopicId === id) setSelectedTopicId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="panel text-rose-700 m-6">{error}</div>;
  if (!subject) return <div className="p-6"><Loading label="Loading workspace" rows={4} /></div>;

  const leftToggle = !showSidebar ? (
    <button 
      onClick={() => setShowSidebar(true)} 
      className="p-1.5 bg-white border border-slate-200 hover:border-slate-350 rounded-lg shadow-sm text-slate-500 hover:text-slate-900 transition-all duration-300 ease-elegant mr-1"
      title="Expand Sidebar"
    >
      <Layers className="w-4 h-4" />
    </button>
  ) : null;

  const rightToggle = !showChat ? (
    <button 
      onClick={() => setShowChat(true)} 
      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-300 ease-elegant ml-1"
      title="Expand Chat"
    >
      <MessageSquare className="w-3.5 h-3.5" />
      Chat Assistant
    </button>
  ) : null;

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      {/* LEFT PANE: Sources Sidebar */}
      <div className={`shrink-0 bg-slate-50/50 border-r border-slate-200 flex flex-col transition-all duration-300 ease-elegant ${showSidebar ? 'w-72 lg:w-80' : 'w-0 overflow-hidden border-r-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Link to="/subjects" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mr-2">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Library
            </Link>
            <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {topics.length} Sources
            </span>
          </div>
          <button 
            onClick={() => setShowSidebar(false)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Sources ({topics.length})
            </h3>
            <div className="space-y-1.5">
              <button 
                onClick={() => setSelectedTopicId(null)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${selectedTopicId === null ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-500' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Subject Guide
              </button>
              {topics.map((topic) => (
                <SwipeableSourceItem
                  key={topic.id}
                  topic={topic}
                  isSelected={selectedTopicId === topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  onDelete={handleDeleteTopic}
                />
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setIsAddSourceModalOpen(true)}
              className="btn-primary w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Source
            </button>
          </div>
        </div>
      </div>

      {/* CENTER PANE: Viewer */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {!selectedTopicId ? (
          <>
            {/* Header for guide view */}
            <div className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                {leftToggle}
                <span className="text-xs text-slate-400 font-mono">Workspace</span>
              </div>
              <div className="flex items-center gap-3">
                {rightToggle}
              </div>
            </div>
            <SubjectDashboardGuide 
              subject={subject} 
              topics={topics} 
              onAddSource={() => setIsAddSourceModalOpen(true)} 
            />
          </>
        ) : (
          <TopicViewer 
            topicId={selectedTopicId} 
            onDeleted={load} 
            leftToggle={leftToggle}
            rightToggle={rightToggle}
          />
        )}
      </div>

      {/* RIGHT PANE: Chat */}
      <div className={`shrink-0 bg-white flex flex-col transition-all duration-300 ease-elegant ${showChat ? 'w-80 lg:w-[360px]' : 'w-0 overflow-hidden'}`}>
        {showChat && <SubjectChat subjectId={subjectId} onClose={() => setShowChat(false)} />}
      </div>

      <AddSourceModal 
        isOpen={isAddSourceModalOpen} 
        onClose={() => setIsAddSourceModalOpen(false)} 
        subjectId={subjectId} 
        onSourceAdded={handleSourceAdded}
      />
    </div>
  );
}

