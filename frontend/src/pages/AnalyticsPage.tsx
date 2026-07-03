// import React, { useEffect, useState } from 'react';
// import {
//   BarChart2, Users, Briefcase, TrendingUp, ArrowUp, Building2,
//   Calendar, Activity, Globe, Star, Clock, CheckCircle
// } from 'lucide-react';

// export default function AnalyticsPage() {
//   const [stats, setStats] = useState({ users: 1247, jobs: 342, referrals: 856, companies: 89 });

//   useEffect(() => {
//     // Using static placeholder data for analytics
//     // In production, this would call analyticsApi.getStats()
//   }, []);

//   const CHART_DATA = [
//     { month: 'Jan', users: 820, referrals: 142, placements: 32 },
//     { month: 'Feb', users: 1200, referrals: 198, placements: 51 },
//     { month: 'Mar', users: 1650, referrals: 267, placements: 78 },
//     { month: 'Apr', users: 2100, referrals: 341, placements: 95 },
//     { month: 'May', users: 2900, referrals: 412, placements: 124 },
//     { month: 'Jun', users: 3800, referrals: 521, placements: 167 },
//   ];

//   const maxVal = Math.max(...CHART_DATA.map(d => d.users));

//   return (
//     <div className="max-w-6xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
//         <p className="text-slate-400 text-sm mt-1">Platform-wide metrics and trends</p>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           { label: 'Total Users', value: stats.users, icon: Users, color: 'blue', trend: '+12%' },
//           { label: 'Active Jobs', value: stats.jobs, icon: Briefcase, color: 'emerald', trend: '+8%' },
//           { label: 'Referrals', value: stats.referrals, icon: TrendingUp, color: 'amber', trend: '+23%' },
//           { label: 'Companies', value: stats.companies, icon: Building2, color: 'violet', trend: '+5%' },
//         ].map(({ label, value, icon: Icon, color, trend }) => (
//           <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
//             <div className="flex items-center justify-between mb-3">
//               <Icon className={`w-5 h-5 text-${color}-400`} />
//               <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
//                 <ArrowUp className="w-3 h-3" /> {trend}
//               </span>
//             </div>
//             <div className="text-3xl font-bold text-white mb-1">{value}</div>
//             <div className="text-slate-400 text-sm">{label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Growth chart */}
//       <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
//         <h3 className="text-white font-bold mb-6 flex items-center gap-2">
//           <Activity className="w-5 h-5 text-blue-400" /> User Growth (6 months)
//         </h3>
//         <div className="flex items-end gap-4 h-48">
//           {CHART_DATA.map(({ month, users }) => (
//             <div key={month} className="flex-1 flex flex-col items-center gap-2">
//               <div className="text-slate-400 text-xs font-mono">{users}</div>
//               <div className="w-full bg-blue-500/80 rounded-t-lg transition-all hover:bg-blue-400"
//                 style={{ height: `${(users / maxVal) * 160}px` }} />
//               <div className="text-slate-400 text-xs">{month}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Key metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
//           <h3 className="text-white font-bold mb-4 flex items-center gap-2">
//             <Star className="w-4 h-4 text-amber-400" /> Key Performance
//           </h3>
//           <div className="space-y-4">
//             {[
//               { label: 'Referral Success Rate', value: 68, color: 'emerald' },
//               { label: 'Average ATS Score', value: 72, color: 'blue' },
//               { label: 'Profile Completion Rate', value: 54, color: 'amber' },
//               { label: 'Mock Interview Completion', value: 41, color: 'violet' },
//             ].map(({ label, value, color }) => (
//               <div key={label}>
//                 <div className="flex justify-between mb-1.5">
//                   <span className="text-slate-300 text-sm">{label}</span>
//                   <span className={`text-${color}-400 font-bold text-sm`}>{value}%</span>
//                 </div>
//                 <div className="w-full bg-slate-800 rounded-full h-1.5">
//                   <div className={`h-1.5 rounded-full bg-${color}-500`} style={{ width: `${value}%` }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
//           <h3 className="text-white font-bold mb-4 flex items-center gap-2">
//             <Globe className="w-4 h-4 text-emerald-400" /> Top Companies
//           </h3>
//           <div className="space-y-3">
//             {[
//               { company: 'Google', referrals: 342, color: 'blue' },
//               { company: 'Microsoft', referrals: 278, color: 'emerald' },
//               { company: 'Amazon', referrals: 245, color: 'amber' },
//               { company: 'Flipkart', referrals: 198, color: 'violet' },
//               { company: 'Razorpay', referrals: 156, color: 'rose' },
//             ].map(({ company, referrals, color }) => (
//               <div key={company} className="flex items-center gap-3">
//                 <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center text-${color}-400 font-bold text-xs`}>
//                   {company[0]}
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex justify-between mb-1">
//                     <span className="text-slate-300 text-sm">{company}</span>
//                     <span className="text-slate-400 text-xs">{referrals} referrals</span>
//                   </div>
//                   <div className="w-full bg-slate-800 rounded-full h-1">
//                     <div className={`h-1 rounded-full bg-${color}-500`} style={{ width: `${(referrals / 342) * 100}%` }} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import {
  BarChart2, Users, Briefcase, TrendingUp, ArrowUp, Building2,
  Calendar, Activity, Globe, Star, Clock, CheckCircle, Loader2
} from 'lucide-react';
import { analyticsApi } from '../lib/api';

export default function AnalyticsPage() {
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

  const maxVal = Math.max(...stats.monthlyGrowth.map(d => d.users), 1);
  const totalReferrals = Object.values(stats.referralStatuses).reduce((a, b) => a + b, 0);
  const successReferrals = (stats.referralStatuses['referred'] || 0) + (stats.referralStatuses['hired'] || 0);
  const referralSuccessRate = totalReferrals > 0 ? Math.round((successReferrals / totalReferrals) * 100) : 0;

  // Key performance metrics
  const performanceMetrics = [
    { label: 'Referral Success Rate', value: referralSuccessRate, color: 'emerald' },
    { label: 'Candidates with Profiles', value: stats.totals.users > 0 ? Math.round((stats.usersByRole.candidates / stats.totals.users) * 100) : 0, color: 'blue' },
    { label: 'Active Referral Requests', value: totalReferrals > 0 ? Math.round(((stats.referralStatuses['requested'] || 0) / totalReferrals) * 100) : 0, color: 'amber' },
    { label: 'Employees Verified', value: stats.totals.users > 0 ? Math.round((stats.usersByRole.employees / stats.totals.users) * 100) : 0, color: 'violet' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide metrics and trends</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totals.users, icon: Users, color: 'blue', trend: `+${stats.recentActivity.newUsersWeek} this week` },
          { label: 'Active Jobs', value: stats.totals.jobs, icon: Briefcase, color: 'emerald', trend: null },
          { label: 'Referrals', value: stats.totals.referrals, icon: TrendingUp, color: 'amber', trend: `+${stats.recentActivity.newReferralsWeek} this week` },
          { label: 'Companies', value: stats.totals.companies, icon: Building2, color: 'violet', trend: null },
        ].map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 text-${color}-400`} />
              {trend && (
                <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" /> {trend}
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" /> User Growth (6 months)
        </h3>
        {stats.monthlyGrowth.length > 0 ? (
          <div className="flex items-end gap-4 h-48">
            {stats.monthlyGrowth.map(({ month, users }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-slate-400 text-xs font-mono">{users}</div>
                <div className="w-full bg-blue-500/80 rounded-t-lg transition-all hover:bg-blue-400"
                  style={{ height: `${(users / maxVal) * 160}px` }} />
                <div className="text-slate-400 text-xs">{month}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500">
            No growth data available yet
          </div>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Key Performance
          </h3>
          <div className="space-y-4">
            {performanceMetrics.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 text-sm">{label}</span>
                  <span className={`text-${color}-400 font-bold text-sm`}>{value}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full bg-${color}-500`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> Users by Role
          </h3>
          <div className="space-y-3">
            {[
              { role: 'Candidates', count: stats.usersByRole.candidates, color: 'blue' },
              { role: 'Employees', count: stats.usersByRole.employees, color: 'emerald' },
              { role: 'Recruiters', count: stats.usersByRole.recruiters, color: 'amber' },
              { role: 'Students', count: stats.usersByRole.students, color: 'violet' },
            ].map(({ role, count, color }) => {
              const pct = stats.totals.users > 0 ? Math.round((count / stats.totals.users) * 100) : 0;
              return (
                <div key={role} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center text-${color}-400 font-bold text-xs`}>
                    {role[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">{role}</span>
                      <span className="text-slate-400 text-xs">{count} users</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1">
                      <div className={`h-1 rounded-full bg-${color}-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Referral Status Overview */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Referral Status Overview
        </h3>
        {Object.entries(stats.referralStatuses).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.referralStatuses).map(([status, count]) => {
              const statusColors: Record<string, string> = {
                requested: 'bg-amber-500',
                accepted: 'bg-blue-500',
                rejected: 'bg-rose-500',
                referred: 'bg-cyan-500',
                hired: 'bg-emerald-500',
              };
              const pct = totalReferrals > 0 ? Math.round((count / totalReferrals) * 100) : 0;
              return (
                <div key={status} className="bg-white/5 rounded-xl p-4 text-center">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-slate-500'} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-slate-400 text-xs capitalize">{status}</div>
                  <div className="text-slate-500 text-xs">{pct}%</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No referral data available yet
          </div>
        )}
      </div>
    </div>
  );
}
