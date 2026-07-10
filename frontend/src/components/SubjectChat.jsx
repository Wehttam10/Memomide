import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ChevronRight } from 'lucide-react';
import { chatWithSubject } from '../api/subjects';

export default function SubjectChat({ subjectId, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I am your study assistant for this subject. Ask me anything about your notes and topics!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatWithSubject(subjectId, userMessage);
      setMessages((prev) => [...prev, { role: 'ai', content: response.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'error', content: 'Failed to get response: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* h-16 Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
        <div className="flex flex-col justify-center">
          <h3 className="font-bold font-display text-slate-900 flex items-center gap-2 text-sm">
            <Bot className="w-4 h-4 text-slate-600" />
            Subject Assistant
          </h3>
          <p className="text-[10px] text-slate-500 font-sans">Ask questions based on your sources</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-650 transition"
            title="Collapse Chat"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border text-xs ${
              msg.role === 'user' 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : msg.role === 'error' 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[85%] p-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-2xl rounded-tr-none shadow-sm' 
                : msg.role === 'error' 
                  ? 'bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl rounded-tl-none' 
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-500 text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-slate-500 text-xs font-mono tracking-tight">AI is crafting notes...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-full pl-4 pr-11 py-2 text-sm outline-none transition-all duration-250 ease-out-expo focus:border-teal-500 focus:ring-1 focus:ring-teal-500/25 disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="Ask about this subject..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1 w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all duration-250 ease-out-expo"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

