import React, { useState } from 'react';
import { Link, useRouter, useNavigate } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';
import {
  Briefcase, LayoutDashboard, User, Users, Search, FileText,
  MessageSquare, Award, Bell, Settings, LogOut, Menu, X,
  ChevronDown, TrendingUp, Building2, GraduationCap, BarChart2,
  Zap, Target, BookOpen,
  AlertTriangle
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['candidate', 'employee', 'recruiter', 'admin', 'student'] },
  { label: 'My Profile', icon: User, path: '/profile', roles: ['candidate', 'student'] },
  { label: 'Resume & ATS', icon: FileText, path: '/resume', roles: ['candidate', 'student'] },
  { label: 'Referrals', icon: Users, path: '/referrals', roles: ['candidate', 'employee'] },
  { label: 'Mock Interview', icon: MessageSquare, path: '/interview', roles: ['candidate', 'student'] },
  { label: 'Assessments', icon: Target, path: '/assessments', roles: ['candidate', 'student'] },
  { label: 'Job Board', icon: Search, path: '/jobs', roles: ['candidate', 'employee', 'recruiter', 'student'] },
  { label: 'Internships', icon: GraduationCap, path: '/internships', roles: ['student', 'recruiter'] },
  { label: 'Talent Search', icon: TrendingUp, path: '/talent', roles: ['recruiter'] },
  { label: 'Post a Job', icon: Building2, path: '/post-job', roles: ['recruiter', 'employee'] },
  { label: 'Analytics', icon: BarChart2, path: '/analytics', roles: ['admin', 'recruiter'] },
  { label: 'Community', icon: BookOpen, path: '/community', roles: ['candidate', 'employee', 'recruiter', 'admin', 'student'] },
  { label: 'Badges', icon: Award, path: '/badges', roles: ['candidate', 'employee', 'student'] },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['candidate', 'employee', 'recruiter', 'admin', 'student'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { path: currentPath } = useRouter();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const visibleNav = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  async function confirmSignOut() {
    await signOut();
    setShowLogoutModal(false);
    navigate('/');
  }

  const roleColors: Record<string, string> = {
    candidate: 'bg-blue-500/20 text-blue-300',
    employee: 'bg-emerald-500/20 text-emerald-300',
    recruiter: 'bg-amber-500/20 text-amber-300',
    admin: 'bg-rose-500/20 text-rose-300',
    student: 'bg-violet-500/20 text-violet-300',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Sign Out?</h3>
                <p className="text-slate-400 text-sm">Are you sure you want to sign out?</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={confirmSignOut} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-xl transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-72 bg-slate-900 border-r border-white/5 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">ReferAI</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 font-bold flex-shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{user.full_name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${roleColors[user.role] ?? 'bg-slate-700 text-slate-300'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleNav.map(({ label, icon: Icon, path }) => {
            const active = currentPath === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Points + Sign out */}
        {user && (
          <div className="p-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">Points</span>
              </div>
              <span className="text-amber-400 font-bold">{user.points}</span>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-white font-semibold text-lg capitalize">
                {currentPath.replace('/', '').replace(/-/g, ' ') || 'Dashboard'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-white font-semibold">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { msg: 'Your referral request was accepted!', time: '2m ago', type: 'success' },
                      { msg: 'Resume analysis complete — Score: 78/100', time: '1h ago', type: 'info' },
                      { msg: 'New job match found: SDE-2 @ Google', time: '3h ago', type: 'info' },
                    ].map(({ msg, time, type }) => (
                      <div key={msg} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/8 cursor-pointer transition-all">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                        <div>
                          <p className="text-white text-sm">{msg}</p>
                          <p className="text-slate-500 text-xs mt-1">{time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Plan badge */}
            {user && (
              <Link to="/settings" className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold capitalize
                ${user.plan === 'free' ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {user.plan !== 'free' && <Zap className="w-3 h-3" />}
                {user.plan}
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
