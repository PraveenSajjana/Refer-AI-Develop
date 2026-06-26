import React, { useState } from 'react';
import { Link, useNavigate } from '../../lib/router';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  User, Users, Search, GraduationCap, ShieldCheck
} from 'lucide-react';

const ROLES = [
  {
    value: 'candidate',
    label: 'Job Seeker',
    icon: User,
    desc: 'Looking for a job or career switch',
    color: 'blue',
  },
  {
    value: 'employee',
    label: 'Employee Referrer',
    icon: Users,
    desc: 'Refer candidates at your company',
    color: 'emerald',
  },
  {
    value: 'recruiter',
    label: 'Recruiter / HR',
    icon: Search,
    desc: 'Source and hire top talent',
    color: 'amber',
  },
  {
    value: 'student',
    label: 'Student',
    icon: GraduationCap,
    desc: 'Seeking internships and first job',
    color: 'violet',
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'border-blue-500 bg-blue-500/10',
  emerald: 'border-emerald-500 bg-emerald-500/10',
  amber: 'border-amber-500 bg-amber-500/10',
  violet: 'border-violet-500 bg-violet-500/10',
};

const ICON_COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  violet: 'text-violet-400',
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('candidate');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xl font-bold">ReferAI</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step >= s ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {s}
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-blue-500' : 'bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Choose your role</h1>
            <p className="text-slate-400 mb-8">Select the option that best describes you</p>
            <div className="grid grid-cols-2 gap-4">
              {ROLES.map(({ value, label, icon: Icon, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setRole(value)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] 
                    ${role === value ? COLOR_MAP[color] : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${role === value ? ICON_COLOR_MAP[color] : 'text-slate-500'}`} />
                  <div className={`font-semibold mb-1 ${role === value ? 'text-white' : 'text-slate-300'}`}>{label}</div>
                  <div className="text-slate-400 text-sm">{desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-slate-400 text-center mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400 mb-8">
              Signing up as <span className="text-blue-400 font-medium">
                {ROLES.find(r => r.value === role)?.label}
              </span>
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-xs">Your data is encrypted and never shared without consent. Free to join, no credit card required.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
