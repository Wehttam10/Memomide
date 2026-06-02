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
      <aside className="block border-t border-white/60 bg-white/70 px-3 py-2 backdrop-blur-xl lg:hidden">
        <nav className="grid grid-cols-5 gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition ${
                  isActive ? 'nav-active' : 'text-slate-600 hover:bg-white/80 hover:text-ink'
                }`
              }
            >
              <Icon className="h-4 w-4 pointer-events-none" />
              <span className="truncate max-w-full text-center">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className={`sticky top-0 h-[100dvh] border-r border-white/60 bg-white/55 px-4 py-5 backdrop-blur-xl hidden lg:flex flex-col justify-between transition-all duration-300 ${
        isMinimized ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col">
        {/* Brand & Toggle Header */}
        <div className={`mb-8 flex items-center justify-between gap-3 ${isMinimized ? 'flex-col' : ''}`}>
          {!isMinimized ? (
            <div className="flex items-center gap-3 overflow-hidden transition-all">
              <img
                className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm ring-2 ring-violet-200"
                src="/memomind-logo.jpeg"
                alt="MemoMind logo"
              />
              <div>
                <p className="brand-gradient text-lg font-black leading-tight">MemoMind</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Study coach</p>
              </div>
            </div>
          ) : (
            <img
              className="h-10 w-10 mx-auto rounded-xl bg-white object-contain p-1 shadow-sm ring-2 ring-violet-200"
              src="/memomind-logo.jpeg"
              alt="MemoMind logo"
            />
          )}
          <button
            onClick={toggleMinimize}
            className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/60 hover:bg-white border border-violet-100/50 shadow-sm text-violet-600 transition ${
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
                `flex items-center rounded-xl font-semibold transition ${
                  isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm'
                } ${isActive ? 'nav-active' : 'text-slate-600 hover:bg-white/80 hover:text-ink'}`
              }
              title={isMinimized ? label : undefined}
            >
              <Icon className="h-4 w-4 pointer-events-none" />
              {!isMinimized && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-violet-100/30">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-xl font-semibold text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition ${
            isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm'
          }`}
          title={isMinimized ? "Logout" : undefined}
          type="button"
        >
          <LogOut className="h-4 w-4 pointer-events-none" />
          {!isMinimized && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
