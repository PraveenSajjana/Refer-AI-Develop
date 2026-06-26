import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { badgesApi } from '../lib/api';
import {
  Award, Star, Zap, Shield, Trophy, Target, Users, MessageSquare,
  CheckCircle, Lock, TrendingUp, Briefcase, GraduationCap
} from 'lucide-react';

const ALL_BADGES = [
  { id: 'first_referral', name: 'First Referral', desc: 'Sent your first referral request', icon: Users, color: 'blue', earned: false },
  { id: 'profile_complete', name: 'Profile Pro', desc: 'Completed 100% of your profile', icon: CheckCircle, color: 'emerald', earned: false },
  { id: 'resume_uploaded', name: 'Resume Ready', desc: 'Uploaded and analyzed your resume', icon: Briefcase, color: 'amber', earned: false },
  { id: 'mock_interview', name: 'Interview Ace', desc: 'Completed first mock interview', icon: MessageSquare, color: 'violet', earned: false },
  { id: 'assessment_passed', name: 'Assessment Star', desc: 'Scored 70%+ in an assessment', icon: Star, color: 'rose', earned: false },
  { id: 'referral_accepted', name: 'Well Connected', desc: 'Had a referral request accepted', icon: Shield, color: 'cyan', earned: false },
  { id: 'hired', name: 'Dream Hired!', desc: 'Got placed through ReferAI', icon: Trophy, color: 'amber', earned: false },
  { id: 'community_contributor', name: 'Community Voice', desc: 'Made 10+ forum posts', icon: Users, color: 'blue', earned: false },
  { id: 'top_scorer', name: 'Top Scorer', desc: 'Scored 90+ in any assessment', icon: TrendingUp, color: 'emerald', earned: false },
  { id: 'referral_readiness_75', name: 'Referral Ready', desc: 'Reached Referral Readiness Score of 75+', icon: Target, color: 'violet', earned: false },
];

const LEVELS = [
  { level: 1, name: 'Newcomer', min: 0, max: 100, color: 'slate' },
  { level: 2, name: 'Explorer', min: 100, max: 300, color: 'blue' },
  { level: 3, name: 'Achiever', min: 300, max: 600, color: 'emerald' },
  { level: 4, name: 'Pro', min: 600, max: 1000, color: 'amber' },
  { level: 5, name: 'Elite', min: 1000, max: 99999, color: 'rose' },
];

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  slate: { bg: 'bg-slate-700', text: 'text-slate-400', border: 'border-slate-600' },
};

export default function BadgesPage() {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    badgesApi.getAll().then(data => {
      setUserBadges(data ?? []);
      setLoading(false);
    }).catch(() => {
      setUserBadges([]);
      setLoading(false);
    });
  }, [user]);

  const earnedIds = userBadges.map(b => b.badge_type);
  const badges = ALL_BADGES.map(b => ({ ...b, earned: earnedIds.includes(b.id) }));

  const currentLevel = LEVELS.find(l => (user?.points ?? 0) >= l.min && (user?.points ?? 0) < l.max) ?? LEVELS[0];
  const nextLevel = LEVELS[currentLevel.level] ?? null;
  const progressPct = nextLevel
    ? Math.round(((user?.points ?? 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100)
    : 100;

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Badges & Achievements</h1>
        <p className="text-slate-400 text-sm mt-1">Complete activities to earn badges and level up on ReferAI</p>
      </div>

      {/* Level card */}
      <div className={`bg-gradient-to-r from-slate-900 to-slate-800 border border-amber-500/20 rounded-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="text-slate-400 text-sm">Current Level</div>
              <div className="text-2xl font-bold text-white">Level {currentLevel.level}: {currentLevel.name}</div>
              <div className="text-amber-400 font-bold">{user.points} Points</div>
            </div>
          </div>
          {nextLevel && (
            <div className="text-right">
              <div className="text-slate-400 text-sm">Next: Level {nextLevel.level}</div>
              <div className="text-white font-medium">{nextLevel.min - (user.points ?? 0)} points away</div>
            </div>
          )}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="h-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between text-slate-500 text-xs mt-2">
          <span>{currentLevel.min} pts</span>
          {nextLevel && <span>{nextLevel.min} pts</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 text-center">
          <Trophy className="w-7 h-7 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{badges.filter(b => b.earned).length}</div>
          <div className="text-slate-400 text-sm">Earned</div>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 text-center">
          <Lock className="w-7 h-7 text-slate-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{badges.filter(b => !b.earned).length}</div>
          <div className="text-slate-400 text-sm">Remaining</div>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 text-center">
          <Zap className="w-7 h-7 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{user.points}</div>
          <div className="text-slate-400 text-sm">Total Points</div>
        </div>
      </div>

      {/* Badges grid */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">All Badges</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map(({ id, name, desc, icon: Icon, color, earned }) => {
            const c = COLOR_CLASSES[color] ?? COLOR_CLASSES.blue;
            return (
              <div key={id}
                className={`rounded-2xl p-5 border transition-all text-center
                  ${earned
                    ? `${c.bg} ${c.border} hover:scale-[1.02]`
                    : 'bg-slate-900 border-white/5 opacity-50'}`}>
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${earned ? c.bg : 'bg-slate-800'}`}>
                  {earned
                    ? <Icon className={`w-7 h-7 ${c.text}`} />
                    : <Lock className="w-7 h-7 text-slate-600" />
                  }
                </div>
                <div className={`font-bold text-sm mb-1 ${earned ? 'text-white' : 'text-slate-500'}`}>{name}</div>
                <div className={`text-xs ${earned ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</div>
                {earned && (
                  <div className="mt-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
