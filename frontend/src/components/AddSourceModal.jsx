import { useState, useRef } from 'react';
import { Upload, Clipboard, X } from 'lucide-react';
import { createTopic } from '../api/topics';
import { createNote } from '../api/notes';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function AddSourceModal({ isOpen, onClose, subjectId, onSourceAdded }) {
  const [view, setView] = useState('menu'); // 'menu' | 'text'
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  async function handleCreateSource(title, content) {
    setLoading(true);
    try {
      const topic = await createTopic(subjectId, { title, description: '' });
      await createNote(topic.id, { content });
      onSourceAdded(topic.id);
      handleClose();
    } catch (err) {
      alert("Failed to add source: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setView('menu');
    setText('');
    setIsDragging(false);
    onClose();
  }

  async function handleFile(file) {
    if (!file) return;
    setLoading(true);

    try {
      if (file.name.endsWith('.docx')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target.result;
            const result = await mammoth.extractRawText({ arrayBuffer });
            await handleCreateSource(file.name, result.value);
          } catch (err) {
            alert("Failed to parse Word document: " + err.message);
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        await handleCreateSource(file.name, fullText.trim());
        return;
      }

      // Default text reading
      const reader = new FileReader();
      reader.onload = async (event) => {
        await handleCreateSource(file.name, event.target.result);
      };
      reader.readAsText(file);
    } catch (err) {
      alert("Error reading file: " + err.message);
      setLoading(false);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden relative border border-neutral-200">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12">
          {view === 'menu' && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-colors min-h-[360px] ${
                isDragging ? 'border-indigo-400 bg-indigo-50/50' : 'border-neutral-200 bg-neutral-50/30'
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-display font-medium text-neutral-900 mb-3">or drop your files</h2>
              <p className="text-neutral-500 mb-12">pdf, docs, text, markdown, csv, and more</p>

              <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-xl">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-3 px-6 py-3.5 bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm rounded-full text-neutral-800 font-medium transition-all flex-1 min-w-[160px] justify-center"
                >
                  <Upload className="w-5 h-5 text-neutral-600" />
                  Upload files
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => handleFile(e.target.files[0])} 
                  className="hidden" 
                  accept=".txt,.md,.csv,.json,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                />

                <button 
                  onClick={() => setView('text')}
                  disabled={loading}
                  className="flex items-center gap-3 px-6 py-3.5 bg-indigo-50 border border-indigo-100 hover:border-indigo-200 hover:shadow-sm rounded-full text-indigo-900 font-medium transition-all flex-1 min-w-[160px] justify-center"
                >
                  <Clipboard className="w-5 h-5 text-indigo-600" />
                  Copied text
                </button>
              </div>

              {loading && <p className="mt-8 text-indigo-600 font-medium animate-pulse">Processing source...</p>}
            </div>
          )}

          {view === 'text' && (
            <div className="flex flex-col h-[400px]">
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Clipboard className="w-6 h-6 text-neutral-400" />
                Paste Text
              </h2>
              <textarea 
                className="field flex-1 resize-none w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm"
                placeholder="Paste your notes, articles, or text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
              <div className="mt-4 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setView('menu')}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => handleCreateSource('Pasted Text', text)}
                  disabled={!text.trim() || loading}
                  className="btn-primary"
                >
                  {loading ? 'Saving...' : 'Add Source'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
