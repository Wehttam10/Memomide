import { useState, useEffect } from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/90 backdrop-blur-md transition-all duration-300">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
        <div>
          <h1 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg font-display tracking-tight">Study workspace</h1>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-48 sm:w-80 items-center gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-sm text-neutral-500 focus-within:border-neutral-400 focus-within:dark:border-neutral-700 focus-within:bg-white focus-within:dark:bg-neutral-950 transition-all duration-200"
          >
            <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspace..."
              className="w-full bg-transparent text-neutral-850 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-550 outline-none text-xs sm:text-sm font-display tracking-tight"
            />
          </form>

          {/* Minimalist Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 active:scale-95 transition-all duration-200"
            type="button"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 pointer-events-none" />
            ) : (
              <Sun className="h-4 w-4 pointer-events-none" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
