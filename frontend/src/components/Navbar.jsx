import { useState } from 'react';
import { Bell, CalendarClock, LogOut, Search, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/65 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <img className="h-7 w-16 rounded bg-white object-contain px-1 ring-1 ring-violet-200" src="/memomind-logo.jpeg" alt="MemoMind logo" />
            <p className="brand-gradient text-sm font-black uppercase tracking-wider">MemoMind</p>
          </div>
          <h1 className="text-base font-bold text-ink sm:text-lg">Study workspace</h1>
        </div>
        <div className="hidden w-80 items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm xl:flex">
          <Search className="h-4 w-4 text-violet-500" />
          Review smarter, remember longer
        </div>
        <div className="relative flex items-center gap-2">
          <button
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-violet-100 bg-white/80 text-violet-600 shadow-sm transition hover:bg-white sm:inline-flex"
            type="button"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications((open) => !open)}
          >
            <Bell className="h-4 w-4" />
          </button>
          {showNotifications ? (
            <div className="absolute right-20 top-12 hidden w-72 overflow-hidden rounded-xl border border-violet-100 bg-white shadow-xl sm:block">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-ink">Notifications</p>
                <p className="text-xs text-slate-500">Quick study reminders</p>
              </div>
              <Link
                className="flex items-start gap-3 px-4 py-3 text-sm transition hover:bg-violet-50"
                to="/revision"
                onClick={() => setShowNotifications(false)}
              >
                <CalendarClock className="mt-0.5 h-4 w-4 text-coral" />
                <span>
                  <span className="block font-semibold text-ink">Check revision queue</span>
                  <span className="text-xs text-slate-500">See topics that are ready to review.</span>
                </span>
              </Link>
              <Link
                className="flex items-start gap-3 px-4 py-3 text-sm transition hover:bg-violet-50"
                to="/profile"
                onClick={() => setShowNotifications(false)}
              >
                <User className="mt-0.5 h-4 w-4 text-violet-600" />
                <span>
                  <span className="block font-semibold text-ink">View profile</span>
                  <span className="text-xs text-slate-500">Confirm your account details.</span>
                </span>
              </Link>
            </div>
          ) : null}
          <button className="btn-secondary px-3 sm:px-4" type="button" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
