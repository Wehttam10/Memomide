import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, BookOpen, FileText, ArrowRight, Folder } from 'lucide-react';
import { searchWorkspace } from '../api/dashboard';
import Loading from '../components/Loading';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightText({ text, highlight }) {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }
  
  try {
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-ink font-semibold rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  } catch (e) {
    return <span>{text}</span>;
  }
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults({ subjects: [], topics: [], notes: [] });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    searchWorkspace(query)
      .then((res) => {
        setResults(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Search request failed');
        setLoading(false);
      });
  }, [query]);

  if (loading) return <Loading />;
  if (error) return <div className="text-center text-rose-600 py-10 font-semibold">{error}</div>;

  const { subjects = [], topics = [], notes = [] } = results || {};
  const totalCount = subjects.length + topics.length + notes.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Search Header */}
      <div>
        <h2 className="text-2xl font-black text-ink flex items-center gap-2">
          <SearchIcon className="h-6 w-6 text-violet-500" />
          Search Results
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {totalCount === 0 
            ? `No matches found for "${query}"`
            : `Found ${totalCount} match${totalCount === 1 ? '' : 'es'} for "${query}"`
          }
        </p>
      </div>

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-violet-100 bg-white/40 text-center">
          <Folder className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-700">No matches found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            Try checking your spelling or searching for a different keyword inside your notes or subjects.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Subjects Matches */}
          {subjects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-violet-500" />
                Subjects ({subjects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((sub) => (
                  <Link 
                    key={sub.id} 
                    to={`/subjects/${sub.id}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow hover:scale-[1.01] transition duration-200"
                  >
                    <div>
                      <h4 className="font-bold text-ink text-sm sm:text-base">
                        <HighlightText text={sub.name} highlight={query} />
                      </h4>
                      {sub.description && (
                        <p className="text-slate-500 text-xs mt-1 line-clamp-1">{sub.description}</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-violet-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Topics Matches */}
          {topics.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                Topics ({topics.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <Link 
                    key={topic.id} 
                    to={`/topics/${topic.id}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow hover:scale-[1.01] transition duration-200"
                  >
                    <div>
                      <h4 className="font-bold text-ink text-sm sm:text-base">
                        <HighlightText text={topic.title} highlight={query} />
                      </h4>
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mt-1">
                        In {topic.subject_name}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-violet-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notes Matches */}
          {notes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-violet-500" />
                Notes ({notes.length})
              </h3>
              <div className="space-y-4">
                {notes.map((note) => (
                  <Link 
                    key={note.id} 
                    to={`/topics/${note.topic_id}/notes`}
                    className="block p-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow hover:scale-[1.005] transition duration-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-ink text-sm sm:text-base">
                        Note in <span className="text-violet-600">{note.topic_title}</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Subject: {note.subject_name}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed bg-white/40 p-3 rounded-xl border border-violet-100/20 italic">
                      <HighlightText text={note.snippet} highlight={query} />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
