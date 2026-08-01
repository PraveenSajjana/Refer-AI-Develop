import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import {
  User, Bell, Shield, Palette, Trash2, Save, Loader2, CheckCircle,
  LogOut, Eye, EyeOff, Zap, Crown, ArrowRight, CreditCard
} from 'lucide-react';
import { Link } from '../lib/router';
import config from "../config";


type Tab = 'profile' | 'notifications' | 'security' | 'plan';

export default function SettingsPage() {
  const { user, refreshUser, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState(user?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [notifications, setNotifications] = useState({
    referral_updates: true,
    job_matches: true,
    community: false,
    newsletter: false,
  });

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      await authApi.updateProfile({ full_name: name });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
    setSaving(false);
  }

  const PLAN_DETAILS = {
    free: { name: 'Free', color: 'slate', price: '₹0', features: ['3 referrals/month', '3 mock interviews', 'Basic ATS', 'Job board access'] },
    premium: { name: 'Premium', color: 'blue', price: '₹499/mo', features: ['Unlimited referrals', 'Unlimited interviews', 'Advanced ATS', 'Priority matching'] },
    recruiter_basic: { name: 'Recruiter Basic', color: 'amber', price: '₹1999/mo', features: ['10 job posts', '50 candidates/month', 'Basic analytics'] },
    recruiter_pro: { name: 'Recruiter Pro', color: 'rose', price: '₹4999/mo', features: ['Unlimited posts', 'Unlimited candidates', 'Advanced analytics', 'ATS integration'] },
    enterprise: { name: 'Enterprise', color: 'violet', price: 'Custom', features: ['White-label', 'API access', 'Dedicated support', 'Custom integrations'] },
  };

  if (!user) return null;

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'plan', label: 'Plan & Billing', icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${tab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl p-6">
          {tab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Profile Settings</h2>
                <button onClick={saveProfile} disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60 text-sm">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {saved ? 'Saved!' : 'Save'}
                </button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-2xl">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{user.full_name}</p>
                  <p className="text-slate-400 text-sm capitalize">{user.role} · {user.plan} plan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Email</label>
                  <input type="email" value={user.email} disabled
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Role</label>
                  <input type="text" value={user.role} disabled
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-400 capitalize cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Member Since</label>
                  <input type="text" value={new Date(user.created_at).toLocaleDateString()} disabled
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed" />
                </div>
              </div>

              <div className="border-t border-white/5 pt-5">
                <h3 className="text-rose-400 font-semibold mb-3">Danger Zone</h3>
                <p className="text-slate-500 text-xs mb-3">This will permanently delete your account, all referrals, profiles, and data. This cannot be undone.</p>
              <button onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-medium px-4 py-2 rounded-xl transition-all text-sm">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg">Notification Preferences</h2>
              {Object.entries(notifications).map(([key, value]) => {
                const labels: Record<string, { title: string; desc: string }> = {
                  referral_updates: { title: 'Referral Updates', desc: 'Get notified when your referral status changes' },
                  job_matches: { title: 'Job Matches', desc: 'Receive personalized job recommendations' },
                  community: { title: 'Community Activity', desc: 'Replies and mentions in the community forum' },
                  newsletter: { title: 'Newsletter', desc: 'Weekly tips on job search and career growth' },
                };
                const { title, desc } = labels[key] ?? { title: key, desc: '' };
                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div>
                      <p className="text-white font-medium text-sm">{title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg">Security</h2>
              <div className="bg-slate-800/50 rounded-2xl p-5 space-y-4">
                <h3 className="text-white font-medium">Change Password</h3>
                {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                  <div key={label}>
                    <label className="text-slate-400 text-sm mb-1.5 block">{label}</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                  </div>
                ))}
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                  Update Password
                </button>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5">
                <h3 className="text-white font-medium mb-3">Active Sessions</h3>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white text-sm">Current Session</p>
                    <p className="text-slate-400 text-xs">Browser — Active now</p>
                  </div>
                  <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === 'plan' && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg">Plan & Billing</h2>
              <div className={`bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <Crown className="w-7 h-7 text-amber-400" />
                  <div>
                    <p className="text-white font-bold capitalize">{user.plan} Plan</p>
                    <p className="text-slate-400 text-sm">{user.plan === 'free' ? 'Upgrade to unlock more features' : 'Active subscription'}</p>
                  </div>
                </div>
                {user.plan === 'free' && (
                  <Link to="/pricing" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm">
                    Upgrade <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(['premium', 'recruiter_basic', 'recruiter_pro'] as const).map(plan => {
                  const d = PLAN_DETAILS[plan];
                  return (
                    <div key={plan} className={`bg-slate-800/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4
                      ${user.plan === plan ? 'border-blue-500/50 bg-blue-500/5' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold">{d.name}</p>
                          {user.plan === plan && <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">Current</span>}
                        </div>
                        <p className="text-blue-400 font-bold mb-2">{d.price}</p>
                        <div className="flex flex-wrap gap-2">
                          {d.features.map(f => (
                            <span key={f} className="text-slate-400 text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400" /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      {user.plan !== plan && (
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm flex-shrink-0">
                          {user.plan === 'free' ? 'Upgrade' : 'Switch'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">Delete Account?</h3>
            <p className="text-slate-400 text-sm mb-4">This will permanently delete your account, all referrals, resume data, and activity. This <span className="text-rose-400 font-semibold">cannot be undone</span>.</p>
            <div className="mb-4">
              <label className="text-slate-300 text-sm mb-2 block">Type <span className="font-mono text-rose-400">DELETE</span> to confirm</label>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-800 border border-rose-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button
                disabled={deleteInput !== 'DELETE' || deleting}
                onClick={async () => {
                  if (deleteInput !== 'DELETE') return;
                  setDeleting(true);
                  try {
                    const token = sessionStorage.getItem('token');
                    const res = await fetch(`${config.apiUrl}/auth/delete-account`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      await signOut();
                    }
                  } catch {}
                  setDeleting(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
