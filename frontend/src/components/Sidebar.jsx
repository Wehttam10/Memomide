import { useState } from 'react';
import { BarChart3, BookOpen, CalendarClock, User, Trophy, LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/revision', label: 'Revision', icon: CalendarClock },
  { to: '/awards', label: 'Awards', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];

export { links };

export default function Sidebar({ mobile = false }) {
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(() => {
    if (mobile) return false;
    return localStorage.getItem('sidebar-minimized') === 'true';
  });

  const toggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-minimized', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (mobile) {
    return (
      <aside className="block border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 lg:hidden">
        <nav className="grid grid-cols-5 gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition-all duration-200 ${
                  isActive ? 'nav-active rounded-md' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 pointer-events-none" />
              <span className="truncate max-w-full text-center font-display">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className={`sticky top-0 h-[100dvh] border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-4 py-5 hidden lg:flex flex-col justify-between transition-all duration-300 ${
        isMinimized ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col">
        {/* Brand & Toggle Header */}
        <div className={`mb-8 flex items-center justify-between gap-3 ${isMinimized ? 'flex-col' : ''}`}>
          {!isMinimized ? (
            <div className="flex items-center gap-3 overflow-hidden transition-all">
              <img
                className="h-10 w-10 rounded-lg bg-white dark:bg-neutral-900 object-contain p-1 border border-neutral-200 dark:border-neutral-800"
                src="/memomind-logo.jpeg"
                alt="MemoMind logo"
              />
              <div className="transition-all duration-300 hover:tracking-wide">
                <p className="brand-gradient text-lg font-black leading-tight font-display text-neutral-900 dark:text-white">MemoMind</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Study coach</p>
              </div>
            </div>
          ) : (
            <img
              className="h-10 w-10 mx-auto rounded-lg bg-white dark:bg-neutral-900 object-contain p-1 border border-neutral-200 dark:border-neutral-800"
              src="/memomind-logo.jpeg"
              alt="MemoMind logo"
            />
          )}
          <button
            onClick={toggleMinimize}
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all duration-200 ${
              isMinimized ? 'mt-2' : ''
            }`}
            type="button"
            aria-label={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isMinimized ? (
              <ChevronsRight className="h-4 w-4 pointer-events-none" />
            ) : (
              <ChevronsLeft className="h-4 w-4 pointer-events-none" />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center rounded-lg font-medium transition-all duration-200 ${
                  isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm hover:translate-x-1'
                } ${isActive ? 'nav-active' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white font-display'}`
              }
              title={isMinimized ? label : undefined}
            >
              <Icon className="h-4 w-4 pointer-events-none" />
              {!isMinimized && <span className="font-display tracking-tight">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg font-medium text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 ${
            isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm hover:translate-x-1'
          }`}
          title={isMinimized ? "Logout" : undefined}
          type="button"
        >
          <LogOut className="h-4 w-4 pointer-events-none" />
          {!isMinimized && <span className="font-display tracking-tight">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
