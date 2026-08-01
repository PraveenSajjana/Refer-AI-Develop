import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { referralsApi } from '../lib/api';
import {
  Users, Search, MessageSquare, CheckCircle, XCircle, Clock,
  ArrowRight, Star, Building2, Briefcase, Loader2, Send, Award,
  ChevronRight, Sparkles, TrendingUp, Phone, Calendar, Gift,
  PartyPopper, FileCheck, UserCheck, Zap, MoreHorizontal,
  CheckCheck, AlertCircle, Eye, Filter
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; description: string }> = {
  requested:  { label: 'Requested',   color: 'text-amber-300',   bg: 'bg-amber-500/20 border-amber-500/30',   icon: Clock,       description: 'Waiting for employee to review your request' },
  accepted:   { label: 'Accepted',    color: 'text-blue-300',    bg: 'bg-blue-500/20 border-blue-500/30',     icon: CheckCircle, description: 'Employee has accepted your request and will refer you' },
  rejected:   { label: 'Rejected',    color: 'text-rose-300',    bg: 'bg-rose-500/20 border-rose-500/30',     icon: XCircle,     description: 'Request was not accepted this time' },
  referred:   { label: 'Referred',    color: 'text-cyan-300',    bg: 'bg-cyan-500/20 border-cyan-500/30',     icon: Send,        description: 'You have been referred to the company' },
  shortlisted:{ label: 'Shortlisted', color: 'text-violet-300',  bg: 'bg-violet-500/20 border-violet-500/30', icon: Sparkles,    description: 'Amazing! You have been shortlisted by the recruiter' },
  interview:  { label: 'Interview',   color: 'text-amber-300',   bg: 'bg-amber-500/20 border-amber-500/30',   icon: Phone,       description: 'You have an interview scheduled' },
  offer:      { label: 'Offer',       color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30',icon: Gift,       description: 'Congratulations! You have received a job offer' },
  hired:      { label: 'Hired',       color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30',icon: PartyPopper,description: 'You are hired! Welcome to your new role' },
};

const PIPELINE_STAGES = ['requested', 'accepted', 'referred', 'shortlisted', 'interview', 'offer', 'hired'];

const CELEBRATION_STAGES = ['shortlisted', 'interview', 'offer', 'hired'];

// Next valid transitions an employee can trigger
const EMPLOYEE_TRANSITIONS: Record<string, { status: string; label: string; color: string }[]> = {
  requested:   [{ status: 'accepted', label: 'Accept',      color: 'bg-blue-600 hover:bg-blue-500 text-white' },
                { status: 'rejected', label: 'Decline',     color: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30' }],
  accepted:    [{ status: 'referred', label: 'Mark Referred', color: 'bg-cyan-600 hover:bg-cyan-500 text-white' }],
  referred:    [{ status: 'shortlisted', label: 'Shortlist', color: 'bg-violet-600 hover:bg-violet-500 text-white' },
                { status: 'rejected',   label: 'Reject',    color: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30' }],
  shortlisted: [{ status: 'interview', label: 'Schedule Interview', color: 'bg-amber-600 hover:bg-amber-500 text-white' }],
  interview:   [{ status: 'offer',    label: 'Send Offer',   color: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
                { status: 'rejected', label: 'Reject',       color: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30' }],
  offer:       [{ status: 'hired',    label: 'Mark Hired',   color: 'bg-emerald-600 hover:bg-emerald-500 text-white' }],
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function CelebrationBanner({ status }: { status: string }) {
  if (!CELEBRATION_STAGES.includes(status)) return null;

  const messages: Record<string, { title: string; sub: string; gradient: string }> = {
    shortlisted: {
      title: 'You\'ve been Shortlisted!',
      sub: 'Your profile stood out! The recruiter has shortlisted you for further review.',
      gradient: 'from-violet-600/20 via-violet-500/10 to-transparent border-violet-500/30',
    },
    interview: {
      title: 'Interview Scheduled!',
      sub: 'Get ready — an interview has been scheduled. Prepare with our AI mock interview tool.',
      gradient: 'from-amber-600/20 via-amber-500/10 to-transparent border-amber-500/30',
    },
    offer: {
      title: 'Offer Received!',
      sub: 'Congratulations! You\'ve received a job offer. Review and respond promptly.',
      gradient: 'from-emerald-600/20 via-emerald-500/10 to-transparent border-emerald-500/30',
    },
    hired: {
      title: 'You\'re Hired!',
      sub: 'Welcome to your new role! Celebrate this milestone — you earned it.',
      gradient: 'from-emerald-600/30 via-emerald-500/15 to-transparent border-emerald-500/40',
    },
  };

  const m = messages[status];
  const Icon = STATUS_CONFIG[status].icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r ${m.gradient} p-5 flex items-center gap-4`}>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-40"
            style={{
              background: status === 'shortlisted' ? '#a78bfa' : status === 'hired' ? '#34d399' : '#fbbf24',
              top: `${10 + i * 11}%`,
              left: `${5 + i * 12}%`,
              animation: `ping ${1 + i * 0.3}s cubic-bezier(0,0,0.2,1) infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${STATUS_CONFIG[status].bg}`}>
        <Icon className={`w-7 h-7 ${STATUS_CONFIG[status].color}`} />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg">{m.title}</h3>
        <p className="text-slate-300 text-sm mt-0.5">{m.sub}</p>
      </div>
    </div>
  );
}

function PipelineTimeline({ status, compact = false }: { status: string; compact?: boolean }) {
  const currentIdx = PIPELINE_STAGES.indexOf(status);
  const isRejected = status === 'rejected';

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <span className="text-rose-400 text-xs font-medium">Request declined</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-0.5 overflow-x-auto ${compact ? 'mt-3' : 'mt-4'}`}>
      {PIPELINE_STAGES.map((stage, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        const Icon = STATUS_CONFIG[stage].icon;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`flex items-center justify-center rounded-full transition-all
                ${compact ? 'w-6 h-6' : 'w-8 h-8'}
                ${isCurrent
                  ? `${STATUS_CONFIG[stage].bg} border ring-2 ring-offset-1 ring-offset-slate-900`
                  : isPast
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-800 border-slate-700'
                } border`}
              >
                {isPast
                  ? <CheckCheck className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                  : <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} ${isCurrent ? STATUS_CONFIG[stage].color : 'text-slate-600'}`} />
                }
              </div>
              {!compact && (
                <span className={`text-xs capitalize whitespace-nowrap font-medium
                  ${isCurrent ? STATUS_CONFIG[stage].color : isPast ? 'text-slate-400' : 'text-slate-600'}`}>
                  {STATUS_CONFIG[stage].label}
                </span>
              )}
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-3 transition-all
                ${isPast ? 'bg-blue-600' : 'bg-slate-800'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RequestModal({
  employee, onClose, onSubmit, submitting
}: {
  employee: any; onClose: () => void;
  onSubmit: (msg: string) => void; submitting: boolean;
}) {
  const [message, setMessage] = useState('');
  const name = employee.full_name || 'Employee';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-lg">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Request Referral</h3>
            <p className="text-slate-400 text-sm">{employee.designation} at {employee.company}</p>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-400 text-xs">A personal, well-crafted message significantly increases your acceptance rate. Mention your skills and why you want to join.</p>
        </div>

        <label className="text-slate-300 text-sm font-medium mb-2 block">Your Message (optional)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder={`Hi ${name.split(' ')[0]}! I'm a software engineer with 4 years in React & Node.js. I admire your company's work in fintech and would love to be considered for open roles. My skills align well with your tech stack...`}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none mb-4 text-sm"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(message)}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeCard({
  emp, onRequest, sending
}: {
  emp: any; onRequest: () => void; sending: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-white/10 hover:border-blue-500/30 rounded-2xl p-5 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-white font-bold text-lg">
            {emp.full_name?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <div className="text-white font-semibold">{emp.full_name}</div>
            <div className="text-slate-400 text-sm">{emp.designation}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-500" />
              <span className="text-slate-400 text-xs">{emp.company}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-white font-bold text-sm">{emp.trust_score || 0}</span>
          </div>
          <div className="text-slate-500 text-xs">Trust Score</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {emp.linkedin_verified && (
          <span className="bg-blue-500/15 border border-blue-500/20 text-blue-300 rounded-full px-2.5 py-0.5 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> LinkedIn Verified
          </span>
        )}
        {emp.company_email_verified && (
          <span className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 rounded-full px-2.5 py-0.5 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Work Email
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-xs">
          <span className="text-emerald-400 font-semibold">{emp.successful_referrals || 0}</span>
          <span className="text-slate-600">/{emp.total_referrals || 0}</span>
          <span className="ml-1">placed</span>
        </div>
        <button
          onClick={onRequest}
          disabled={sending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
          Request Referral
        </button>
      </div>
    </div>
  );
}

function CandidateRequestCard({ req }: { req: any }) {
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG['requested'];
  const isCelebration = CELEBRATION_STAGES.includes(req.status);

  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 transition-all
      ${isCelebration ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10'}`}>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold">
            {req.employee_name?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{req.employee_name || 'Employee'}</p>
            <p className="text-slate-400 text-xs">{req.employee_company || req.company_name || 'Company'}</p>
            {req.job_title && (
              <div className="flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3 h-3 text-slate-500" />
                <span className="text-slate-500 text-xs">{req.job_title}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${cfg.bg} ${cfg.color}`}>
            <cfg.icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
          <span className="text-slate-600 text-xs">{new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {isCelebration && <CelebrationBanner status={req.status} />}

      {!isCelebration && req.candidate_message && (
        <div className="bg-white/5 rounded-xl p-3 mb-4 text-slate-300 text-sm italic">
          "{req.candidate_message}"
        </div>
      )}

      {req.status !== 'rejected' && (
        <div className="mt-4">
          <p className="text-slate-500 text-xs mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Application Progress
          </p>
          <PipelineTimeline status={req.status} />
        </div>
      )}

      {req.status === 'rejected' && (
        <div className="mt-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <p className="text-rose-300 text-sm">This request was not accepted. Keep trying — persistence pays off!</p>
        </div>
      )}

      {req.status === 'shortlisted' && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-center">
            <Calendar className="w-5 h-5 text-violet-400 mx-auto mb-1" />
            <p className="text-white text-xs font-semibold">Interview Soon</p>
            <p className="text-slate-400 text-xs mt-0.5">Prepare with AI mock interviews</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <FileCheck className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-white text-xs font-semibold">Resume Polished</p>
            <p className="text-slate-400 text-xs mt-0.5">Make sure your resume is updated</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeRequestCard({
  req, onUpdateStatus, updating
}: {
  req: any; onUpdateStatus: (id: string, status: string) => void; updating: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG['requested'];
  const transitions = EMPLOYEE_TRANSITIONS[req.status] || [];

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all
      ${req.status === 'shortlisted' ? 'border-violet-500/30' : 'border-white/10'}`}>

      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold">
              {req.candidate_name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <p className="text-white font-semibold">{req.candidate_name || 'Candidate'}</p>
              <p className="text-slate-400 text-xs mt-0.5">{req.candidate_email || ''}</p>
              {req.job_title && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-500 text-xs">{req.job_title}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${cfg.bg} ${cfg.color}`}>
              <cfg.icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
            <span className="text-slate-600 text-xs">
              {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Compact timeline */}
        {req.status !== 'rejected' && (
          <PipelineTimeline status={req.status} compact />
        )}
      </div>

      {/* Expandable message */}
      {req.candidate_message && (
        <div className="border-t border-white/5 px-5 py-3">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-slate-400 text-xs flex items-center gap-1.5 hover:text-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            {expanded ? 'Hide message' : 'View candidate message'}
          </button>
          {expanded && (
            <div className="mt-2 bg-white/5 rounded-xl p-3 text-slate-300 text-sm italic">
              "{req.candidate_message}"
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {transitions.length > 0 && (
        <div className="border-t border-white/5 px-5 py-4 bg-slate-900/50">
          <p className="text-slate-500 text-xs mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Next actions for this candidate
          </p>
          <div className="flex flex-wrap gap-2">
            {transitions.map(t => (
              <button
                key={t.status}
                onClick={() => onUpdateStatus(req.id, t.status)}
                disabled={updating === req.id}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60 ${t.color}`}
              >
                {updating === req.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <ChevronRight className="w-3.5 h-3.5" />
                }
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {req.status === 'hired' && (
        <div className="border-t border-emerald-500/20 px-5 py-4 bg-emerald-500/5 flex items-center gap-3">
          <PartyPopper className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">Candidate hired! Your referral was successful.</p>
        </div>
      )}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function EmployeeStats({ requests }: { requests: any[] }) {
  const counts: Record<string, number> = {};
  for (const r of requests) counts[r.status] = (counts[r.status] || 0) + 1;

  const stats = [
    { label: 'Pending',     value: counts['requested'] || 0,   color: 'text-amber-400' },
    { label: 'Shortlisted', value: counts['shortlisted'] || 0, color: 'text-violet-400' },
    { label: 'In Interview',value: counts['interview'] || 0,   color: 'text-blue-400' },
    { label: 'Hired',       value: counts['hired'] || 0,       color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-slate-500 text-xs mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isRecruiter = user?.role === 'recruiter';
  const canManage = isEmployee || isRecruiter;

  const [tab, setTab] = useState<'find' | 'requests' | 'manage'>(canManage ? 'manage' : 'find');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [newBadge, setNewBadge] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  function showToast(message: string, type: 'success' | 'info' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    if (!user) return;
    setLoadingRequests(true);
    referralsApi.getAll()
      .then(data => setRequests(data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoadingRequests(false));
  }, [user]);

  useEffect(() => {
    if (!user || canManage) return;
    setLoadingEmployees(true);
    referralsApi.getEmployees(search ? { search } : undefined)
      .then(data => setEmployees(data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmployees(false));
  }, [user, search, canManage]);

  async function sendReferralRequest(message: string) {
    if (!user || !selectedEmployee) return;
    setSending(true);
    try {
      const result = await referralsApi.create({
        employee_id: selectedEmployee.id,
        candidate_message: message,
      });
      setRequests(prev => [result, ...prev]);
      if (result.badge_awarded) {
        setNewBadge(result.badge_awarded);
        setTimeout(() => setNewBadge(null), 4000);
      }
      showToast('Referral request sent!', 'success');
      setTab('requests');
    } catch (err: any) {
      showToast(err.message || 'Failed to send request', 'info');
    }
    setSending(false);
    setSelectedEmployee(null);
  }

  async function updateStatus(requestId: string, status: string) {
    setUpdating(requestId);
    try {
      await referralsApi.updateStatus(requestId, status);
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      const msgs: Record<string, string> = {
        accepted: 'Request accepted',
        rejected: 'Request declined',
        referred: 'Candidate marked as referred',
        shortlisted: 'Candidate shortlisted!',
        interview: 'Interview scheduled',
        offer: 'Offer sent to candidate',
        hired: 'Candidate marked as hired!',
      };
      showToast(msgs[status] || 'Status updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'info');
    }
    setUpdating(null);
  }

  const filteredRequests = requests.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search && canManage) {
      const q = search.toLowerCase();
      return (
        r.candidate_name?.toLowerCase().includes(q) ||
        r.job_title?.toLowerCase().includes(q) ||
        r.candidate_email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const shortlistedCount = requests.filter(r => r.status === 'shortlisted').length;
  const pendingCount = requests.filter(r => r.status === 'requested').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl border animate-in slide-in-from-right duration-300
          ${toast.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-200'
            : 'bg-slate-800/90 border-white/10 text-slate-200'}`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Badge toast */}
      {newBadge && (
        <div className="fixed top-16 right-4 z-50 bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Badge Earned!</p>
            <p className="text-amber-300 text-xs">{newBadge.badge_name} (+{newBadge.points} pts)</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Referrals</h1>
          <p className="text-slate-400 text-sm mt-1">
            {canManage
              ? 'Manage referral requests and track candidates through your pipeline'
              : 'Find verified employees and get referred to top companies'}
          </p>
        </div>
        {canManage && shortlistedCount > 0 && (
          <div className="flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 rounded-xl px-4 py-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-violet-300 text-sm font-semibold">{shortlistedCount} shortlisted</span>
          </div>
        )}
      </div>

      {/* Stats (employees only) */}
      {canManage && requests.length > 0 && <EmployeeStats requests={requests} />}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
        {!canManage && (
          <button
            onClick={() => setTab('find')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
              ${tab === 'find' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Find Referrers
          </button>
        )}
        <button
          onClick={() => setTab(canManage ? 'manage' : 'requests')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative
            ${(tab === 'requests' || tab === 'manage') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          {canManage ? 'Manage Requests' : 'My Requests'}
          {canManage && pendingCount > 0 && (
            <span className="ml-2 bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-5 inline-block text-center">
              {pendingCount}
            </span>
          )}
          {!canManage && requests.some(r => CELEBRATION_STAGES.includes(r.status)) && (
            <span className="ml-2 bg-violet-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">!</span>
          )}
        </button>
      </div>

      {/* ── Find Referrers tab ─────────────────────────────────────── */}
      {tab === 'find' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, company, or designation..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {loadingEmployees ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-white/10 rounded-2xl">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No employees found</h3>
              <p className="text-slate-400 text-sm">
                {search ? 'Try different search terms.' : 'No verified employees are available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  emp={emp}
                  onRequest={() => setSelectedEmployee(emp)}
                  sending={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── My Requests tab (candidate view) ──────────────────────── */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {/* Shortlisted highlight */}
          {requests.some(r => r.status === 'shortlisted') && (
            <div className="bg-gradient-to-r from-violet-600/15 to-violet-400/5 border border-violet-500/30 rounded-2xl p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">You have been shortlisted!</p>
                <p className="text-violet-300 text-xs mt-0.5">An employee has shortlisted your profile. An interview may be coming soon.</p>
              </div>
            </div>
          )}

          {loadingRequests ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-white/10 rounded-2xl">
              <Send className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No referral requests yet</h3>
              <p className="text-slate-400 text-sm mb-5">Find a verified employee and send your first request!</p>
              <button
                onClick={() => setTab('find')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2"
              >
                Find Referrers <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            requests.map(req => (
              <CandidateRequestCard key={req.id} req={req} />
            ))
          )}
        </div>
      )}

      {/* ── Manage Requests tab (employee/recruiter view) ──────────── */}
      {tab === 'manage' && (
        <div className="space-y-4">
          {/* Search + filter bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {PIPELINE_STAGES.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loadingRequests ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-white/10 rounded-2xl">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">
                {requests.length === 0 ? 'No requests yet' : 'No requests match this filter'}
              </h3>
              <p className="text-slate-400 text-sm">
                {requests.length === 0
                  ? 'Candidate referral requests will appear here once you are verified.'
                  : 'Try clearing the filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Shortlisted section highlight */}
              {filteredRequests.some(r => r.status === 'shortlisted') && !statusFilter && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-violet-300 text-sm font-semibold">Shortlisted Candidates</span>
                  </div>
                  {filteredRequests
                    .filter(r => r.status === 'shortlisted')
                    .map(req => (
                      <EmployeeRequestCard
                        key={req.id}
                        req={req}
                        onUpdateStatus={updateStatus}
                        updating={updating}
                      />
                    ))
                  }
                  {filteredRequests.some(r => r.status !== 'shortlisted') && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-slate-600 text-xs">Other requests</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                  )}
                </div>
              )}

              {/* All other requests */}
              {filteredRequests
                .filter(r => !(!statusFilter && r.status === 'shortlisted'))
                .map(req => (
                  <EmployeeRequestCard
                    key={req.id}
                    req={req}
                    onUpdateStatus={updateStatus}
                    updating={updating}
                  />
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Request modal */}
      {selectedEmployee && (
        <RequestModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSubmit={sendReferralRequest}
          submitting={sending}
        />
      )}
    </div>
  );
}
