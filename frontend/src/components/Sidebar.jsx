import { BarChart3, BookOpen, CalendarClock, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/revision', label: 'Revision', icon: CalendarClock },
  { to: '/profile', label: 'Profile', icon: User },
];

export { links };

export default function Sidebar({ mobile = false }) {
  return (
    <aside className={mobile ? 'block border-t border-white/60 bg-white/70 px-3 py-2 backdrop-blur-xl lg:hidden' : 'hidden min-h-screen w-64 border-r border-white/60 bg-white/55 px-4 py-5 backdrop-blur-xl lg:block'}>
      <div className={mobile ? 'hidden' : 'mb-8 flex items-center gap-3'}>
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
      <nav className={mobile ? 'grid grid-cols-4 gap-1' : 'space-y-1'}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${mobile ? 'flex-col justify-center gap-1 px-2 py-2 text-xs' : 'gap-3 px-3 py-2.5 text-sm'} flex items-center rounded-xl font-semibold transition ${
                isActive ? 'nav-active' : 'text-slate-600 hover:bg-white/80 hover:text-ink'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
