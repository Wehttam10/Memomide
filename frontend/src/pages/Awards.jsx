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
        <h2 className="text-2xl font-black text-neutral-900 font-display tracking-tight">My Achievements</h2>
        <p className="text-neutral-500 text-xs mt-1 font-light">Track your daily study goals and earn specialized study badges.</p>
      </div>

      {/* Activity Rings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ring Graphic Card */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 rounded-xl border border-neutral-200 bg-white">
          <h3 className="text-xs font-bold text-neutral-450 uppercase tracking-wider mb-6 font-display">Daily Progress</h3>
          <div className="relative h-48 w-48">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Note Ring Background & Progress */}
              <circle cx="100" cy="100" r={r1} fill="transparent" stroke="#f5f5f5" strokeWidth="12" />
              <circle 
                cx="100" 
                cy="100" 
                r={r1} 
                fill="transparent" 
                stroke="#09090b" 
                strokeWidth="12" 
                strokeDasharray={c1}
                strokeDashoffset={o1}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* Questions Ring Background & Progress */}
              <circle cx="100" cy="100" r={r2} fill="transparent" stroke="#f5f5f5" strokeWidth="12" />
              <circle 
                cx="100" 
                cy="100" 
                r={r2} 
                fill="transparent" 
                stroke="#404040" 
                strokeWidth="12" 
                strokeDasharray={c2}
                strokeDashoffset={o2}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* Topics Ring Background & Progress */}
              <circle cx="100" cy="100" r={r3} fill="transparent" stroke="#f5f5f5" strokeWidth="12" />
              <circle 
                cx="100" 
                cy="100" 
                r={r3} 
                fill="transparent" 
                stroke="#737373" 
                strokeWidth="12" 
                strokeDasharray={c3}
                strokeDashoffset={o3}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-neutral-900 font-display">
                {Math.round((rings.notes.percentage + rings.questions.percentage + rings.topics.percentage) / 3)}%
              </span>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Average</span>
            </div>
          </div>
        </div>

        {/* Ring Metrics Legend Card */}
        <div className="lg:col-span-2 flex flex-col justify-center p-6 rounded-xl border border-neutral-200 bg-white space-y-6">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-display">Today's Activity Metrics</h3>
          
          <div className="space-y-4">
            {/* Notes Ring */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-neutral-900 ring-4 ring-neutral-200 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-neutral-900 font-display text-sm sm:text-base">Notes Written</h4>
                  <p className="text-neutral-500 text-xs font-light">Summarize subjects and capture core concepts.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-neutral-900 font-display">{rings.notes.current}</span>
                <span className="text-neutral-400 text-xs sm:text-sm"> / {rings.notes.goal}</span>
                <span className="block text-[10px] font-bold text-neutral-500 font-mono tracking-tighter">{rings.notes.percentage}%</span>
              </div>
            </div>

            {/* Questions Ring */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-neutral-600 ring-4 ring-neutral-200 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-neutral-900 font-display text-sm sm:text-base">Questions Answered</h4>
                  <p className="text-neutral-500 text-xs font-light">Verify your knowledge through active recall attempts.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-neutral-900 font-display">{rings.questions.current}</span>
                <span className="text-neutral-400 text-xs sm:text-sm"> / {rings.questions.goal}</span>
                <span className="block text-[10px] font-bold text-neutral-500 font-mono tracking-tighter">{rings.questions.percentage}%</span>
              </div>
            </div>

            {/* Topics Ring */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-neutral-400 ring-4 ring-neutral-200 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-neutral-900 font-display text-sm sm:text-base">Topics Practiced</h4>
                  <p className="text-neutral-500 text-xs font-light">Broaden your study base across multiple areas.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-neutral-900 font-display">{rings.topics.current}</span>
                <span className="text-neutral-400 text-xs sm:text-sm"> / {rings.topics.goal}</span>
                <span className="block text-[10px] font-bold text-neutral-500 font-mono tracking-tighter">{rings.topics.percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-neutral-900 tracking-tight">Unlockable Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const BadgeIcon = iconMap[badge.icon] || Award;
            return (
              <div 
                key={badge.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:translate-y-[-2px] ${
                  badge.unlocked 
                    ? 'border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm' 
                    : 'border-neutral-200 bg-neutral-50/50 opacity-60'
                }`}
              >
                {!badge.unlocked && (
                  <Lock className="h-4 w-4 text-neutral-400 absolute top-4 right-4" />
                )}
                
                <div className="space-y-4">
                  {/* Badge Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                    badge.unlocked 
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-800' 
                      : 'border-neutral-200 bg-neutral-100 text-neutral-400'
                  }`}>
                    <BadgeIcon className="h-6 w-6 pointer-events-none" />
                  </div>

                  {/* Badge Text */}
                  <div>
                    <h4 className="font-bold text-neutral-900 font-display text-base">{badge.name}</h4>
                    <p className="text-neutral-550 text-xs mt-1 leading-relaxed font-light">{badge.description}</p>
                  </div>
                </div>

                {/* Unlock status */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono">
                  {badge.unlocked ? (
                    <span className="text-neutral-800 flex items-center gap-1 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-neutral-450">Locked</span>
                  )}
                  {badge.unlocked && badge.unlock_date && (
                    <span className="text-neutral-400">
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
