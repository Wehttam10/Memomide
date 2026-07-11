import React, { useState } from 'react';
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

const Sidebar = React.memo(function Sidebar({ mobile = false }) {
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
      <aside className="block border-t border-slate-200 bg-white px-3 py-2 lg:hidden">
        <nav className="grid grid-cols-5 gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition-all duration-300 ease-elegant ${
                  isActive ? 'bg-teal-50 text-teal-700 rounded-md font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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
      className={`sticky top-0 h-[100dvh] border-r border-slate-200 bg-white pt-0 pb-5 px-4 hidden lg:flex flex-col justify-between transition-all duration-300 ease-elegant ${
        isMinimized ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col">
        {/* Brand & Toggle Header */}
        <div className={`h-16 flex items-center justify-between border-b border-slate-200/80 -mx-4 px-4 mb-6 ${isMinimized ? 'flex-col justify-center py-2 h-20 gap-2 border-b-0' : ''}`}>
          {!isMinimized ? (
            <div className="flex items-center gap-3 overflow-hidden transition-all">
              <img
                className="h-10 w-10 rounded-lg bg-white object-contain p-1 border border-slate-200"
                src="/memomind-logo.jpeg"
                alt="MemoMind logo"
              />
              <div className="transition-all duration-300">
                <p className="brand-gradient text-lg font-black leading-tight font-display text-slate-900">MemoMind</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Study coach</p>
              </div>
            </div>
          ) : (
            <img
              className="h-10 w-10 mx-auto rounded-lg bg-white object-contain p-1 border border-slate-200"
              src="/memomind-logo.jpeg"
              alt="MemoMind logo"
            />
          )}
          <button
            onClick={toggleMinimize}
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-all duration-300 ease-elegant ${
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
                `group relative flex items-center rounded-lg font-medium transition-all duration-300 ease-elegant ${
                  isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm hover:translate-x-0.5'
                } ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-500 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-display'
                }`
              }
            >
              <Icon className="h-4 w-4 pointer-events-none shrink-0" />
              {!isMinimized ? (
                <span className="font-display tracking-tight">{label}</span>
              ) : (
                <span className="absolute left-full ml-2 scale-95 opacity-0 rounded bg-slate-900 px-2 py-1 text-xs text-white transition-all group-hover:scale-100 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={`group relative flex w-full items-center rounded-lg font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 ease-elegant ${
            isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm hover:translate-x-0.5'
          }`}
          type="button"
        >
          <LogOut className="h-4 w-4 pointer-events-none shrink-0" />
          {!isMinimized ? (
            <span className="font-display tracking-tight">Logout</span>
          ) : (
            <span className="absolute left-full ml-2 scale-95 opacity-0 rounded bg-slate-900 px-2 py-1 text-xs text-white transition-all group-hover:scale-100 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
