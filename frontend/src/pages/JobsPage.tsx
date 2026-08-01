import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jobsApi, referralsApi } from '../lib/api';
import { useNavigate } from '../lib/router';
import {
  Search, MapPin, Briefcase, ChevronDown,
  Building2, ArrowRight, Bookmark, ExternalLink, Loader2,
  Send, CheckCircle, X, AlertCircle, MessageSquare, Users, Star
} from 'lucide-react';

const JOB_TYPES: Record<string, { label: string; color: string }> = {
  full_time:  { label: 'Full Time',  color: 'bg-blue-500/20 text-blue-300' },
  remote:     { label: 'Remote',     color: 'bg-emerald-500/20 text-emerald-300' },
  part_time:  { label: 'Part Time',  color: 'bg-amber-500/20 text-amber-300' },
  contract:   { label: 'Contract',   color: 'bg-violet-500/20 text-violet-300' },
  internship: { label: 'Internship', color: 'bg-cyan-500/20 text-cyan-300' },
};

function parseSkills(skills: any): string[] {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    try { return JSON.parse(skills); } catch { return []; }
  }
  return [];
}

function ReferralModal({ job, onClose }: { job: any; onClose: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'find' | 'message' | 'done'>('find');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    referralsApi.getEmployees(search ? { search } : undefined)
      .then(data => setEmployees(data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmps(false));
  }, [search]);

  async function submit() {
    if (!selected) return;
    setSending(true);
    setError('');
    try {
      await referralsApi.create({ employee_id: selected.id, job_id: job.id, candidate_message: message });
      setStep('done');
    } catch (e: any) {
      setError(e.message || 'Failed to send request');
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between mb-5 flex-shrink-0">
          <div>
            <h3 className="text-white font-bold text-xl">Request a Referral</h3>
            <p className="text-slate-400 text-sm mt-0.5">{job.title} at {job.company_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'done' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-white font-bold text-xl mb-2">Request Sent!</h4>
            <p className="text-slate-400 text-sm mb-1">Your referral request has been sent to</p>
            <p className="text-white font-semibold mb-1">{selected?.full_name}</p>
            <p className="text-slate-400 text-sm mb-6">at <span className="text-white">{selected?.company}</span></p>
            <p className="text-slate-500 text-xs mb-6 max-w-xs">Track progress in My Referrals.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition-all">Close</button>
              <button onClick={() => { onClose(); navigate('/referrals'); }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
                Track Request <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : step === 'find' ? (
          <>
            <div className="relative mb-4 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search employees..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {loadingEmps ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
              ) : employees.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  <Users className="w-8 h-8 mx-auto mb-3 text-slate-600" />No verified employees found.
                </div>
              ) : employees.map(emp => (
                <div key={emp.id} onClick={() => setSelected(emp)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${selected?.id === emp.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-blue-500/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {emp.full_name?.charAt(0).toUpperCase() || 'E'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{emp.full_name}</p>
                      <p className="text-slate-400 text-xs">{emp.designation} · {emp.company}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-white text-sm font-semibold">{emp.trust_score || 0}</span>
                    </div>
                    {selected?.id === emp.id && <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5 flex-shrink-0">
              <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-all">Cancel</button>
              <button onClick={() => selected && setStep('message')} disabled={!selected}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5 bg-slate-800/60 rounded-xl p-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold flex-shrink-0">
                {selected?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{selected?.full_name}</p>
                <p className="text-slate-400 text-xs">{selected?.designation} at {selected?.company}</p>
              </div>
              <button onClick={() => setStep('find')} className="ml-auto text-slate-500 hover:text-white text-xs transition-colors">Change</button>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3 mb-4 flex items-start gap-2 flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-400 text-xs">A personal message significantly improves your acceptance rate.</p>
            </div>
            <label className="text-slate-300 text-sm font-medium mb-2 block flex-shrink-0">Your Message (optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
              placeholder={`Hi ${selected?.full_name?.split(' ')[0]}! I came across the ${job.title} role at ${job.company_name} and would love a referral. I have strong experience in ${parseSkills(job.skills_required).slice(0, 2).join(' and ')}...`}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none mb-4 text-sm flex-shrink-0" />
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-xl px-4 py-2 mb-4 flex-shrink-0">{error}</div>
            )}
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => setStep('find')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-all">Back</button>
              <button onClick={submit} disabled={sending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralJob, setReferralJob] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    jobsApi.getAll({ search, location: locationFilter, type: typeFilter })
      .then(data => setJobs(data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [search, locationFilter, typeFilter]);

  const isCandidate = !user?.role || user.role === 'candidate' || user.role === 'student';

  function toggleSave(id: string) {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Job Board</h1>
        <p className="text-slate-400 text-sm mt-1">Discover opportunities at top companies — apply or request a referral</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, companies, skills..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
            placeholder="Location"
            className="bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-40" />
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none pr-9 cursor-pointer">
            <option value="">All Types</option>
            {Object.entries(JOB_TYPES).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-6">
        <div className={`space-y-3 ${selected ? 'w-full lg:w-1/2 xl:w-2/5' : 'w-full'}`}>
          <div className="text-slate-400 text-sm">{jobs.length} jobs found</div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-white/10 rounded-2xl">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No jobs found. Try adjusting your filters.</p>
            </div>
          ) : jobs.map(job => (
            <div key={job.id} onClick={() => setSelected(job)}
              className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:border-blue-500/30 ${selected?.id === job.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">
                    {job.company_name?.[0] ?? 'J'}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{job.title}</div>
                    <div className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {job.company_name}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {job.is_featured && <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">Featured</span>}
                  <button onClick={e => { e.stopPropagation(); toggleSave(job.id); }}
                    className={`transition-colors ${savedJobs.includes(job.id) ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}>
                    <Bookmark className="w-4 h-4" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${JOB_TYPES[job.job_type]?.color ?? 'bg-slate-700 text-slate-300'}`}>
                  {JOB_TYPES[job.job_type]?.label ?? job.job_type}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                {job.salary_min && <span className="text-slate-400 text-xs">₹{job.salary_min}-{job.salary_max} LPA</span>}
                <span className="text-slate-400 text-xs">{job.experience_min}-{job.experience_max} yrs</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {parseSkills(job.skills_required).slice(0, 4).map((s: string) => (
                  <span key={s} className="bg-slate-800 text-slate-300 text-xs rounded-full px-2.5 py-0.5">{s}</span>
                ))}
              </div>
              <div className="mt-3 text-slate-500 text-xs">{job.application_count} applicants</div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="hidden lg:block flex-1 sticky top-6 self-start">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-xl">{selected.title}</h2>
                  <p className="text-slate-400 mt-1 flex items-center gap-2"><Building2 className="w-4 h-4" /> {selected.company_name}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${JOB_TYPES[selected.job_type]?.color}`}>
                  {JOB_TYPES[selected.job_type]?.label}
                </span>
                <span className="text-slate-400 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selected.location}</span>
                {selected.salary_min && <span className="text-slate-400 text-sm">₹{selected.salary_min}-{selected.salary_max} LPA</span>}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{selected.description}</p>
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {parseSkills(selected.skills_required).map((s: string) => (
                    <span key={s} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-full px-3 py-1">{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-white font-bold">{selected.experience_min}-{selected.experience_max}</div>
                  <div className="text-slate-400 text-xs">Years Exp.</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-white font-bold">{selected.application_count}</div>
                  <div className="text-slate-400 text-xs">Applicants</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <a href="#" onClick={e => e.preventDefault()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
                {isCandidate && (
                  <button onClick={() => setReferralJob(selected)}
                    className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Request Referral
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {referralJob && <ReferralModal job={referralJob} onClose={() => setReferralJob(null)} />}
    </div>
  );
}
