import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithSubject } from '../api/subjects';

export default function SubjectChat({ subjectId }) {
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
    <div className="flex flex-col h-full bg-white border-l border-neutral-200">
      <div className="p-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
        <h3 className="font-bold font-display text-neutral-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-neutral-600" />
          Subject Chat
        </h3>
        <p className="text-xs text-slate-500 mt-1">Ask questions based on your sources</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-neutral-900 text-white' : msg.role === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-neutral-100 text-neutral-600'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-neutral-900 text-white' : msg.role === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-neutral-50 border border-neutral-200 text-neutral-800'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-600">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
              <span className="text-neutral-500 text-xs font-mono">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200 bg-neutral-50 shrink-0">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-white border border-neutral-300 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            placeholder="Ask about this subject..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-neutral-900 text-white rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
