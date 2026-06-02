import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/65 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
        <div>
          <h1 className="text-base font-bold text-ink sm:text-lg">Study workspace</h1>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex w-64 sm:w-80 items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm transition-all focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100"
        >
          <Search className="h-4 w-4 text-violet-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspace..."
            className="w-full bg-transparent text-ink placeholder-slate-400 outline-none text-xs sm:text-sm"
          />
        </form>

        {/* Right side spacer to keep the layout balanced */}
        <div className="hidden sm:block w-12"></div>
      </div>
    </header>
  );
}
