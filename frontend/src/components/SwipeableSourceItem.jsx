import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';

export default function SwipeableSourceItem({ topic, isSelected, onClick, onDelete }) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);

  const THRESHOLD = -60; // swipe distance required to trigger delete

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX.current;
    if (diff < 0) { // Only swipe left
      setOffset(Math.max(diff, -100)); 
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (offset <= THRESHOLD) {
      onDelete(topic.id);
    }
    setOffset(0); // bounce back
  };

  return (
    <div className="relative overflow-hidden rounded-lg group mb-1.5">
      {/* Delete Background (Visible during swipe left) */}
      <div className="absolute inset-y-0 right-0 w-full bg-rose-500 rounded-lg flex items-center justify-end px-4 z-0">
        <Trash2 className="w-4 h-4 text-white" />
      </div>

      {/* Swipeable Foreground */}
      <button
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${offset}px)` }}
        className={`relative z-10 w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between gap-2 
          ${isSwiping ? 'transition-none' : 'transition-transform duration-200'} 
          ${isSelected ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-500 font-semibold shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-50'}
        `}
      >
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate">{topic.title}</span>
          <span className={`text-xs truncate ${isSelected ? 'text-teal-600/80 font-mono' : 'text-slate-500'}`}>{topic.status}</span>
        </div>
        
        {/* Desktop hover delete button */}
        <div 
          onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}
          className={`shrink-0 p-1.5 rounded-md hover:bg-rose-500 hover:text-white transition-colors hidden md:group-hover:flex
            ${isSelected ? 'text-neutral-300 hover:text-white hover:bg-rose-500' : 'text-slate-400 hover:text-white hover:bg-rose-500'}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
}
