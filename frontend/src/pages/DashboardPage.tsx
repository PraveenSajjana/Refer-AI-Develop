import React, { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';
import { profilesApi, referralsApi, analyticsApi } from '../lib/api';
import {
  TrendingUp, Users, Briefcase, Target, FileText, MessageSquare,
  ArrowRight, Award, Zap, Star, CheckCircle, Clock, Bell,
  BarChart2, Building2, GraduationCap, Search, Activity, Loader2
} from 'lucide-react';


function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const colorMap: Record<string, string> = {
    blue: '#3b82f6', emerald: '#10b981', amber: '#f59e0b',
    rose: '#f43f5e', cyan: '#06b6d4', violet: '#8b5cf6',
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={colorMap[color] ?? '#3b82f6'} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xl">{score}</span>
        </div>
      </div>
      <span className="text-slate-400 text-xs text-center leading-tight">{label}</span>
    </div>
  );
}

function CandidateDashboard({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    profilesApi.getCandidate().then(data => setProfile(data)).catch(() => {});
  }, [user.id]);

  const rrs = profile?.referral_readiness_score ?? 0;
  const recColor = rrs >= 75 ? 'emerald' : rrs >= 50 ? 'amber' : 'rose';

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-900/60 to-slate-900 border border-blue-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user.full_name.split(' ')[0]}!</h1>
          <p className="text-slate-400">Complete your profile to unlock your best Referral Readiness Score.</p>
        </div>
        <Link to="/profile"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
          Complete Profile <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Referral Readiness Score */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">Referral Readiness Score</h2>
            <p className="text-slate-400 text-sm">Composite score across 5 dimensions</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
            profile?.recommendation === 'Highly Recommended' ? 'bg-emerald-500/20 text-emerald-300' :
            profile?.recommendation === 'Recommended' ? 'bg-amber-500/20 text-amber-300' :
            'bg-rose-500/20 text-rose-300'
          }`}>
            {profile?.recommendation ?? 'Not Recommended'}
          </div>
        </div>
        <div className="flex flex-wrap justify-around gap-4">
          <ScoreRing score={profile?.resume_score ?? 0} label="Resume Quality" color="blue" />
          <ScoreRing score={profile?.ats_score ?? 0} label="ATS Score" color="emerald" />
          <ScoreRing score={profile?.linkedin_score ?? 0} label="LinkedIn" color="amber" />
          <ScoreRing score={profile?.assessment_score ?? 0} label="Assessment" color="rose" />
          <ScoreRing score={profile?.interview_score ?? 0} label="Mock Interview" color="violet" />
        </div>
        <div className="mt-6 bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-medium">Overall Score</span>
            <span className={`font-bold text-xl ${recColor === 'emerald' ? 'text-emerald-400' : recColor === 'amber' ? 'text-amber-400' : 'text-rose-400'}`}>{rrs}/100</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${recColor === 'emerald' ? 'bg-emerald-500' : recColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${rrs}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Upload Resume', icon: FileText, path: '/resume', color: 'blue', desc: 'Get ATS score' },
          { label: 'Find Referrers', icon: Users, path: '/referrals', color: 'emerald', desc: 'Browse employees' },
          { label: 'Mock Interview', icon: MessageSquare, path: '/interview', color: 'amber', desc: 'Practice now' },
          { label: 'Browse Jobs', icon: Briefcase, path: '/jobs', color: 'rose', desc: 'Find openings' },
        ].map(({ label, icon: Icon, path, color, desc }) => (
          <Link key={label} to={path}
            className={`bg-${color}-500/10 border border-${color}-500/20 hover:border-${color}-500/40 rounded-2xl p-5 group transition-all hover:scale-[1.02]`}>
            <Icon className={`w-8 h-8 text-${color}-400 mb-3 group-hover:scale-110 transition-transform`} />
            <div className="text-white font-semibold text-sm">{label}</div>
            <div className="text-slate-400 text-xs mt-1">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              { msg: 'Profile created', time: 'Just now', icon: CheckCircle, color: 'emerald' },
              { msg: 'Upload your resume to get started', time: 'Pending', icon: FileText, color: 'blue' },
              { msg: 'Complete mock interview', time: 'Pending', icon: MessageSquare, color: 'amber' },
            ].map(({ msg, time, icon: Icon, color }) => (
              <div key={msg} className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 text-${color}-400 flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">{msg}</p>
                  <p className="text-slate-500 text-xs">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" /> Profile Completeness
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Basic Info', done: true },
              { label: 'Resume Upload', done: !!profile?.resume_url },
              { label: 'Skills Added', done: (profile?.skills?.length ?? 0) > 0 },
              { label: 'Education', done: false },
              { label: 'Work Experience', done: false },
              { label: 'Mock Interview', done: profile?.interview_score > 0 },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                  {done && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${done ? 'text-slate-300 line-through' : 'text-slate-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    profilesApi.getEmployee().then(data => setProfile(data)).catch(() => {});
    referralsApi.getAll().then(data => setRequests(data || [])).catch(() => setRequests([]));
  }, [user.id]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome, {user.full_name.split(' ')[0]}!</h1>
          <p className="text-slate-400">You have <span className="text-emerald-400 font-bold">{requests.filter(r => r.status === 'requested').length}</span> pending referral requests.</p>
        </div>
        <Link to="/referrals"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
          View Requests <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: requests.length, icon: Bell, color: 'blue' },
          { label: 'Pending', value: requests.filter(r => r.status === 'requested').length, icon: Clock, color: 'amber' },
          { label: 'Referred', value: requests.filter(r => r.status === 'referred').length, icon: CheckCircle, color: 'emerald' },
          { label: 'Trust Score', value: profile?.trust_score ?? 0, icon: Star, color: 'violet' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
            <Icon className={`w-6 h-6 text-${color}-400 mb-3`} />
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {!profile && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4">
          <Bell className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium">Complete your employee profile to get verified</p>
            <p className="text-slate-400 text-sm mt-1">Add your company details and verify your work email to start receiving referral requests.</p>
            <Link to="/profile" className="text-amber-400 text-sm font-medium hover:underline mt-2 inline-block">
              Complete Profile →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Recent Referral Requests</h3>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No referral requests yet.</p>
            <p className="text-slate-500 text-sm">Once you're verified, candidates will start reaching out.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/8 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-sm">C</div>
                  <div>
                    <p className="text-white text-sm font-medium">Referral Request</p>
                    <p className="text-slate-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize
                  ${r.status === 'requested' ? 'bg-amber-500/20 text-amber-300' :
                    r.status === 'accepted' ? 'bg-blue-500/20 text-blue-300' :
                    r.status === 'referred' ? 'bg-emerald-500/20 text-emerald-300' :
                    'bg-slate-700 text-slate-400'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecruiterDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-900/30 to-slate-900 border border-amber-500/20 rounded-2xl p-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Recruiter Dashboard</h1>
          <p className="text-slate-400">Find and hire top talent with AI-powered matching.</p>
        </div>
        <Link to="/post-job"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
          Post a Job <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: 0, icon: Briefcase, color: 'blue' },
          { label: 'Applicants', value: 0, icon: Users, color: 'emerald' },
          { label: 'Shortlisted', value: 0, icon: Star, color: 'amber' },
          { label: 'Hired', value: 0, icon: Award, color: 'violet' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
            <Icon className={`w-6 h-6 text-${color}-400 mb-3`} />
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/talent" className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
          <Search className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-white font-bold mb-2">Talent Search</h3>
          <p className="text-slate-400 text-sm">Browse AI-scored candidate profiles with skill matching.</p>
        </Link>
        <Link to="/analytics" className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
          <BarChart2 className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-white font-bold mb-2">Analytics</h3>
          <p className="text-slate-400 text-sm">Track hiring pipeline metrics and conversion rates.</p>
        </Link>
      </div>
    </div>
  );
}

function StudentDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-violet-900/30 to-slate-900 border border-violet-500/20 rounded-2xl p-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Hello, {user.full_name.split(' ')[0]}!</h1>
          <p className="text-slate-400">Your launchpad for internships and first jobs.</p>
        </div>
        <Link to="/internships"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
          Find Internships <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Browse Jobs', icon: Briefcase, path: '/jobs', color: 'blue' },
          { label: 'Internships', icon: GraduationCap, path: '/internships', color: 'violet' },
          { label: 'Mock Interview', icon: MessageSquare, path: '/interview', color: 'amber' },
          { label: 'Resume Check', icon: FileText, path: '/resume', color: 'emerald' },
        ].map(({ label, icon: Icon, path, color }) => (
          <Link key={label} to={path}
            className={`bg-${color}-500/10 border border-${color}-500/20 hover:border-${color}-500/40 rounded-2xl p-5 group transition-all hover:scale-[1.02] text-center`}>
            <Icon className={`w-8 h-8 text-${color}-400 mb-3 mx-auto group-hover:scale-110 transition-transform`} />
            <div className="text-white font-semibold text-sm">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totals: { users: 0, jobs: 0, referrals: 0, companies: 0 },
    usersByRole: { candidates: 0, employees: 0, recruiters: 0, students: 0 },
    referralStatuses: {} as Record<string, number>,
    recentActivity: { newUsersWeek: 0, newReferralsWeek: 0 },
    topCompanies: [] as Array<{ name: string; referral_count: number }>,
    monthlyGrowth: [] as Array<{ month: string; users: number }>,
  });

  useEffect(() => {
    analyticsApi.getStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch stats:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const maxUsers = Math.max(...stats.monthlyGrowth.map(d => d.users), 1);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-rose-900/30 to-slate-900 border border-rose-500/20 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400">Platform overview and management.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totals.users, icon: Users, color: 'blue', trend: `+${stats.recentActivity.newUsersWeek} this week` },
          { label: 'Active Jobs', value: stats.totals.jobs, icon: Briefcase, color: 'emerald' },
          { label: 'Referrals', value: stats.totals.referrals, icon: TrendingUp, color: 'amber', trend: `+${stats.recentActivity.newReferralsWeek} this week` },
          { label: 'Companies', value: stats.totals.companies, icon: Building2, color: 'rose' },
        ].map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
            <Icon className={`w-6 h-6 text-${color}-400 mb-3`} />
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
            {trend && <div className="text-emerald-400 text-xs mt-1">{trend}</div>}
          </div>
        ))}
      </div>

      {/* Users by Role */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" /> Users by Role
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Candidates', value: stats.usersByRole.candidates, color: 'blue' },
            { label: 'Employees', value: stats.usersByRole.employees, color: 'emerald' },
            { label: 'Recruiters', value: stats.usersByRole.recruiters, color: 'amber' },
            { label: 'Students', value: stats.usersByRole.students, color: 'violet' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Status & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" /> Referral Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.referralStatuses).length > 0 ? Object.entries(stats.referralStatuses).map(([status, count]) => {
              const statusColors: Record<string, string> = {
                requested: 'bg-amber-500',
                accepted: 'bg-blue-500',
                rejected: 'bg-rose-500',
                referred: 'bg-cyan-500',
                shortlisted: 'bg-violet-500',
                interview: 'bg-amber-500',
                offer: 'bg-emerald-500',
                hired: 'bg-emerald-500',
              };
              const total = Object.values(stats.referralStatuses).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-slate-500'}`} />
                  <span className="text-slate-300 text-sm capitalize flex-1">{status}</span>
                  <span className="text-white font-medium">{count}</span>
                  <span className="text-slate-500 text-xs w-12 text-right">{pct}%</span>
                </div>
              );
            }) : (
              <p className="text-slate-500 text-sm">No referral data yet</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> User Growth (6 months)
          </h3>
          {stats.monthlyGrowth.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {stats.monthlyGrowth.map(({ month, users }) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-slate-400 text-xs font-mono">{users}</div>
                  <div
                    className="w-full bg-blue-500/80 rounded-t transition-all hover:bg-blue-400"
                    style={{ height: `${(users / maxUsers) * 80}px` }}
                  />
                  <div className="text-slate-500 text-xs">{month}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No growth data yet</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/analytics" className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
          <BarChart2 className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-white font-bold mb-2">Platform Analytics</h3>
          <p className="text-slate-400 text-sm">Detailed platform metrics and reporting.</p>
        </Link>
        <Link to="/community" className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
          <MessageSquare className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-white font-bold mb-2">Community Moderation</h3>
          <p className="text-slate-400 text-sm">Manage forum posts and community guidelines.</p>
        </Link>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'candidate': return <CandidateDashboard user={user} />;
    case 'employee': return <EmployeeDashboard user={user} />;
    case 'recruiter': return <RecruiterDashboard user={user} />;
    case 'student': return <StudentDashboard user={user} />;
    case 'admin': return <AdminDashboard user={user} />;
    default: return <CandidateDashboard user={user} />;
  }
}
