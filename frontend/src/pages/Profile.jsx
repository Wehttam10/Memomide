import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { me, logout, updateAvatar } from '../api/auth';
import { getProfileStats } from '../api/dashboard';
import Loading from '../components/Loading';
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Layers, 
  FileText, 
  ClipboardList, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck,
  LogOut,
  Camera
} from 'lucide-react';

function resizeAndCompressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max_size = 128;
      let width = img.width;
      let height = img.height;

      // Crop/Scale to a square of max_size x max_size
      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG at 0.75 quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      callback(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-input').click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    resizeAndCompressImage(file, (base64Data) => {
      updateAvatar(base64Data)
        .then((updatedUser) => {
          setUser(updatedUser);
        })
        .catch((err) => {
          alert(err.message || "Failed to update profile picture");
        });
    });
  };



  useEffect(() => {
    Promise.all([me(), getProfileStats()])
      .then(([userData, statsData]) => {
        setUser(userData);
        setStats(statsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load profile details');
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading label="Loading profile and statistics" />;
  if (error) return <div className="panel text-rose-700 font-semibold text-center py-8">{error}</div>;
  if (!user || !stats) return null;

  // Get user initials for avatar
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const statItems = [
    {
      label: 'Subjects',
      value: stats.total_subjects,
      hint: 'Created areas',
      icon: BookOpen,
      color: 'text-teal-600 bg-teal-50 border-teal-100'
    },
    {
      label: 'Topics',
      value: stats.total_topics,
      hint: 'Tracked concepts',
      icon: Layers,
      color: 'text-violet-600 bg-violet-50 border-violet-100'
    },
    {
      label: 'Notes',
      value: stats.total_notes,
      hint: 'Written summaries',
      icon: FileText,
      color: 'text-pink-600 bg-pink-50 border-pink-100'
    },
    {
      label: 'AI Questions',
      value: stats.total_questions,
      hint: 'Generated keys',
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    },
    {
      label: 'Attempts Logged',
      value: stats.total_attempts,
      hint: 'Practice sessions',
      icon: ClipboardList,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100'
    },
    {
      label: 'Average Score',
      value: `${stats.average_score}/10`,
      hint: 'Historical performance',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-ink">My Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your account information and view your all-time learning stats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Account Details Card */}
        <div className="lg:col-span-1 w-full max-w-md mx-auto lg:max-w-none rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-md flex flex-col items-center text-center space-y-6">
          {/* Avatar with smooth gradient / upload overlay */}
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile avatar" 
                className="h-24 w-24 rounded-2xl object-cover shadow-lg shadow-violet-200 ring-2 ring-violet-200/50 group-hover:ring-violet-400 transition duration-300"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-teal flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-violet-200 group-hover:from-violet-600 group-hover:to-teal/90 transition duration-300">
                {initials}
              </div>
            )}
            
            {/* Hover Camera Overlay */}
            <div className="absolute inset-0 bg-black/45 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera className="h-5 w-5" />
            </div>

            <span className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-sm z-10" title="Verified Account">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            id="avatar-input" 
            accept="image/*" 
            className="hidden" 
            onChange={handleAvatarChange}
          />

          {/* User Basic Info */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-ink">{user.name}</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">MemoMind Learner</p>
          </div>

          <div className="w-full border-t border-slate-100/80 pt-5 space-y-4 text-left text-sm">
            {/* Name Row */}
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-violet-500 flex-shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</span>
                <span className="font-semibold text-slate-700">{user.name}</span>
              </div>
            </div>

            {/* Email Row */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-violet-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                <span className="font-semibold text-slate-700 truncate block">{user.email}</span>
              </div>
            </div>

            {/* Joined Row */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-violet-500 flex-shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Joined Date</span>
                <span className="font-semibold text-slate-700">
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-rose-600 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-700 border border-rose-100/50 shadow-sm transition-all"
            type="button"
          >
            <LogOut className="h-4 w-4 pointer-events-none" />
            Logout
          </button>
        </div>

        {/* Right Column: Statistics Grid Card */}
        <div className="lg:col-span-2 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-ink">All-Time Statistics</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">Cumulative</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {statItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-white/95 border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-ink">{item.value}</span>
                    <span className={`p-2 rounded-xl border flex items-center justify-center ${item.color}`}>
                      <Icon className="h-4 w-4 pointer-events-none" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-slate-700 text-sm leading-tight">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}




