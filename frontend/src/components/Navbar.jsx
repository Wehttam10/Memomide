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
    <header className="sticky top-0 z-10 border-b border-slate-200/85 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
        <div>
          <h1 className="text-base font-bold text-slate-900 sm:text-lg font-display tracking-tight">Study workspace</h1>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex w-48 sm:w-64 md:w-80 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm text-slate-500 transition-all duration-300 ease-elegant focus-within:w-56 sm:focus-within:w-80 md:focus-within:w-96 focus-within:border-teal-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-teal-500/20"
        >
          <Search className="h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspace..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm font-sans tracking-tight"
          />
        </form>

        {/* Right side spacer to keep the layout balanced */}
        <div className="hidden sm:block w-12"></div>
      </div>
    </header>
  );
}

