import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { referralsApi } from '../lib/api';
import {
  Users, Search, Filter, MessageSquare, CheckCircle, XCircle,
  Clock, ArrowRight, Star, Building2, Briefcase, Loader2,
  TrendingUp, Send, ChevronDown, Award
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  requested: { label: 'Requested', color: 'bg-amber-500/20 text-amber-300' },
  accepted: { label: 'Accepted', color: 'bg-blue-500/20 text-blue-300' },
  rejected: { label: 'Rejected', color: 'bg-rose-500/20 text-rose-300' },
  referred: { label: 'Referred', color: 'bg-cyan-500/20 text-cyan-300' },
  shortlisted: { label: 'Shortlisted', color: 'bg-violet-500/20 text-violet-300' },
  interview: { label: 'Interview', color: 'bg-amber-500/20 text-amber-300' },
  offer: { label: 'Offer', color: 'bg-emerald-500/20 text-emerald-300' },
  hired: { label: 'Hired', color: 'bg-emerald-500/20 text-emerald-300' },
};

const REFERRAL_STAGES = ['requested', 'accepted', 'referred', 'shortlisted', 'interview', 'offer', 'hired'];

function RequestModal({ employee, onClose, onSubmit }: { employee: any; onClose: () => void; onSubmit: (msg: string) => void }) {
  const [message, setMessage] = useState('');
  const employeeName = employee.full_name || employee.name || 'Employee';
  const employeeRole = employee.designation || employee.role || '';
  const employeeCompany = employee.company || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-lg">
            {employeeName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Request Referral from {employeeName}</h3>
            <p className="text-slate-400 text-sm">{employeeRole} at {employeeCompany}</p>
          </div>
        </div>
        <label className="text-slate-300 text-sm font-medium mb-2 block">Message (optional)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Hi! I'm a senior engineer with 4 years of experience in React and Node.js. I've been following your company's work and I'd love to be considered for any open roles..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={() => onSubmit(message)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'find' | 'my_requests' | 'manage'>('find');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [newBadge, setNewBadge] = useState<any>(null);

  // Load referral requests
  useEffect(() => {
    if (!user) return;
    setLoadingRequests(true);
    referralsApi.getAll().then(data => {
      setRequests(data || []);
      setLoadingRequests(false);
    }).catch(() => {
      setRequests([]);
      setLoadingRequests(false);
    });
  }, [user]);

  // Load employees for "Find Referrers" tab
  useEffect(() => {
    if (!user || user.role === 'employee') return;
    setLoadingEmployees(true);
    referralsApi.getEmployees(search ? { search } : undefined).then(data => {
      setEmployees(data || []);
      setLoadingEmployees(false);
    }).catch(() => {
      setEmployees([]);
      setLoadingEmployees(false);
    });
  }, [user, search]);

  async function sendReferralRequest(message: string) {
    if (!user || !selectedEmployee) return;
    setSending(selectedEmployee.id);
    try {
      const result = await referralsApi.create({
        employee_id: selectedEmployee.id,
        candidate_message: message,
      });
      // Add to requests list
      setRequests(prev => [result, ...prev]);
      // Show badge notification if awarded
      if (result.badge_awarded) {
        setNewBadge(result.badge_awarded);
        setTimeout(() => setNewBadge(null), 4000);
      }
    } catch (error) {
      console.error('Failed to send referral request:', error);
    }
    setSending(null);
    setSelectedEmployee(null);
    if (user.role === 'candidate') setTab('my_requests');
  }

  async function updateStatus(requestId: string, status: string) {
    try {
      await referralsApi.updateStatus(requestId, status);
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  const isEmployee = user?.role === 'employee';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Badge notification toast */}
      {newBadge && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Badge Earned!</p>
            <p className="text-amber-300 text-xs">{newBadge.badge_name} (+{newBadge.points} pts)</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
        <p className="text-slate-400 text-sm mt-1">
          {isEmployee ? 'Manage incoming referral requests from candidates' : 'Find verified employees and request referrals'}
        </p>
      </div>

      <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
        {!isEmployee && <button onClick={() => setTab('find')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === 'find' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Find Referrers</button>}
        <button onClick={() => setTab(isEmployee ? 'manage' : 'my_requests')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${(tab === 'my_requests' || tab === 'manage') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          {isEmployee ? `Manage Requests (${requests.filter(r => r.status === 'requested').length})` : 'My Requests'}
        </button>
      </div>

      {tab === 'find' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, company, or designation..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {loadingEmployees ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-white/10 rounded-2xl">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No employees found</h3>
              <p className="text-slate-400 text-sm">
                {search ? 'Try adjusting your search terms.' : 'No verified employees available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map(emp => (
                <div key={emp.id} className="bg-slate-900 border border-white/10 hover:border-blue-500/30 rounded-2xl p-5 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-lg">
                        {emp.full_name?.charAt(0).toUpperCase() || 'E'}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{emp.full_name}</div>
                        <div className="text-slate-400 text-sm">{emp.designation}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-400 text-xs">{emp.company}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white font-bold text-sm">{emp.trust_score || 0}</span>
                      </div>
                      <div className="text-slate-500 text-xs">Trust Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {emp.linkedin_verified && (
                      <span className="bg-blue-500/20 text-blue-300 rounded-full px-2.5 py-0.5 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> LinkedIn Verified
                      </span>
                    )}
                    {emp.company_email_verified && (
                      <span className="bg-emerald-500/20 text-emerald-300 rounded-full px-2.5 py-0.5 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Work Email Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 text-xs">
                      <span className="text-emerald-400 font-medium">{emp.successful_referrals || 0}</span>/{emp.total_referrals || 0} placed
                    </div>
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      disabled={sending === emp.id}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60"
                    >
                      {sending === emp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      Request Referral
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(tab === 'my_requests' || tab === 'manage') && (
        <div className="space-y-4">
          {loadingRequests ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-white/10 rounded-2xl">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">
                {isEmployee ? 'No requests yet' : 'No referral requests yet'}
              </h3>
              <p className="text-slate-400 text-sm">
                {isEmployee ? 'Requests from candidates will appear here once you\'re verified.' : 'Find an employee referrer and send your first request!'}
              </p>
              {!isEmployee && (
                <button onClick={() => setTab('find')} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2">
                  Find Referrers <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-slate-900 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold">
                      {isEmployee ? 'C' : 'E'}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {isEmployee ? 'Candidate Request' : 'Referral Request'}
                      </p>
                      <p className="text-slate-400 text-xs">{new Date(req.created_at).toLocaleDateString()}</p>
                      {req.candidate_message && (
                        <p className="text-slate-300 text-sm mt-2 bg-white/5 rounded-lg p-3">{req.candidate_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_CONFIG[req.status]?.color ?? 'bg-slate-700 text-slate-400'}`}>
                      {STATUS_CONFIG[req.status]?.label ?? req.status}
                    </span>
                    {isEmployee && req.status === 'requested' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(req.id, 'accepted')}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button onClick={() => updateStatus(req.id, 'rejected')}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                    {isEmployee && req.status === 'accepted' && (
                      <button onClick={() => updateStatus(req.id, 'referred')}
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                        Mark as Referred
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
                  {REFERRAL_STAGES.map((stage, i) => {
                    const stageIdx = REFERRAL_STAGES.indexOf(req.status);
                    const isPast = i <= stageIdx;
                    return (
                      <React.Fragment key={stage}>
                        <div className={`flex flex-col items-center gap-1 flex-shrink-0`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                            ${isPast ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            {i + 1}
                          </div>
                          <span className={`text-xs capitalize ${isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                            {stage}
                          </span>
                        </div>
                        {i < REFERRAL_STAGES.length - 1 && (
                          <div className={`flex-1 h-0.5 min-w-4 ${isPast && i < stageIdx ? 'bg-blue-500' : 'bg-slate-800'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedEmployee && (
        <RequestModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} onSubmit={sendReferralRequest} />
      )}
    </div>
  );
}