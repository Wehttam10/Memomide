import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Moon, 
  Award, 
  Sparkles, 
  CheckCircle, 
  Calendar, 
  PenTool, 
  TrendingUp, 
  Flame, 
  Lock,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { getAwards } from '../api/dashboard';
import Loading from '../components/Loading';

const iconMap = {
  BookOpen: BookOpen,
  Moon: Moon,
  Award: Award,
  Sparkles: Sparkles,
  CheckCircle: CheckCircle,
  Calendar: Calendar,
  PenTool: PenTool,
  TrendingUp: TrendingUp,
  Flame: Flame
};

export default function Awards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAwards()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load awards');
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="text-center text-rose-600 py-10 font-semibold">{error}</div>;
  if (!data) return null;

  const { rings, badges } = data;

  // SVG Ring Calculations
  // Circumference = 2 * Math.PI * radius
  // 1. Notes Ring (Radius = 80, Circumference ≈ 502.65)
  const r1 = 80;
  const c1 = 2 * Math.PI * r1;
  const o1 = c1 - (rings.notes.percentage / 100) * c1;

  // 2. Questions Ring (Radius = 62, Circumference ≈ 389.55)
  const r2 = 62;
  const c2 = 2 * Math.PI * r2;
  const o2 = c2 - (rings.questions.percentage / 100) * c2;

  // 3. Topics Ring (Radius = 44, Circumference ≈ 276.46)
  const r3 = 44;
  const c3 = 2 * Math.PI * r3;
  const o3 = c3 - (rings.topics.percentage / 100) * c3;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-ink">My Achievements</h2>
        <p className="text-slate-500 text-sm mt-1">Track your daily study goals and earn specialized study badges.</p>
      </div>

      {/* Activity Rings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ring Graphic Card */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Daily Progress</h3>
          <div className="relative h-48 w-48">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Note Ring Background & Progress */}
              <circle cx="100" cy="100" r={r1} fill="transparent" stroke="#fce7f3" strokeWidth="12" />
              <circle 
                cx="100" 
                cy="100" 
                r={r1} 
                fill="transparent" 
                stroke="#ec4899" 
                strokeWidth="12" 
                strokeDasharray={c1}
                strokeDashoffset={o1}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* Questions Ring Background & Progress */}
              <circle cx="100" cy="100" r={r2} fill="transparent" stroke="#e0e7ff" strokeWidth="12" />
              <circle 
                cx="100" 
                cy="100" 
                r={r2} 
                fill="transparent" 
                stroke="#8b5cf6" 
                strokeWidth="12" 
                strokeDasharray={c2}
                strokeDashoffset={o2}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* Topics Ring Background & Progress */}
              <circle cx="100" cy="100" r={r3} fill="transparent" stroke="#ecfeff" strokeWidth="12" />
              <circle 
                cx="100" 
                cy="100" 
                r={r3} 
                fill="transparent" 
                stroke="#06b6d4" 
                strokeWidth="12" 
                strokeDasharray={c3}
                strokeDashoffset={o3}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-ink">
                {Math.round((rings.notes.percentage + rings.questions.percentage + rings.topics.percentage) / 3)}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average</span>
            </div>
          </div>
        </div>

        {/* Ring Metrics Legend Card */}
        <div className="lg:col-span-2 flex flex-col justify-center p-6 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-md space-y-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Today's Activity Metrics</h3>
          
          <div className="space-y-4">
            {/* Notes Ring */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 border border-white/40 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-pink-500 ring-4 ring-pink-100 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-ink text-sm sm:text-base">Notes Written</h4>
                  <p className="text-slate-500 text-xs">Summarize subjects and capture core concepts.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-ink">{rings.notes.current}</span>
                <span className="text-slate-400 text-xs sm:text-sm"> / {rings.notes.goal}</span>
                <span className="block text-[10px] font-bold text-pink-600 uppercase tracking-widest">{rings.notes.percentage}%</span>
              </div>
            </div>

            {/* Questions Ring */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 border border-white/40 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-violet-500 ring-4 ring-violet-100 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-ink text-sm sm:text-base">Questions Answered</h4>
                  <p className="text-slate-500 text-xs">Verify your knowledge through active recall attempts.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-ink">{rings.questions.current}</span>
                <span className="text-slate-400 text-xs sm:text-sm"> / {rings.questions.goal}</span>
                <span className="block text-[10px] font-bold text-violet-600 uppercase tracking-widest">{rings.questions.percentage}%</span>
              </div>
            </div>

            {/* Topics Ring */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 border border-white/40 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-cyan-500 ring-4 ring-cyan-100 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-ink text-sm sm:text-base">Topics Practiced</h4>
                  <p className="text-slate-500 text-xs">Broaden your study base across multiple areas.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-ink">{rings.topics.current}</span>
                <span className="text-slate-400 text-xs sm:text-sm"> / {rings.topics.goal}</span>
                <span className="block text-[10px] font-bold text-cyan-600 uppercase tracking-widest">{rings.topics.percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-ink">Unlockable Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const BadgeIcon = iconMap[badge.icon] || Award;
            return (
              <div 
                key={badge.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 ${
                  badge.unlocked 
                    ? 'border-violet-100 bg-white/95 shadow-md hover:shadow-lg hover:scale-[1.02]' 
                    : 'border-slate-200/50 bg-slate-50/50 grayscale opacity-60'
                }`}
              >
                {!badge.unlocked && (
                  <Lock className="h-4 w-4 text-slate-400 absolute top-4 right-4" />
                )}
                
                <div className="space-y-4">
                  {/* Badge Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    badge.unlocked 
                      ? 'bg-violet-100 text-violet-600' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    <BadgeIcon className="h-6 w-6 pointer-events-none" />
                  </div>

                  {/* Badge Text */}
                  <div>
                    <h4 className="font-black text-ink text-base">{badge.name}</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{badge.description}</p>
                  </div>
                </div>

                {/* Unlock status */}
                <div className="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between text-[11px] font-semibold">
                  {badge.unlocked ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-slate-400">Locked</span>
                  )}
                  {badge.unlocked && badge.unlock_date && (
                    <span className="text-slate-400">
                      {new Date(badge.unlock_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
