import React, { useEffect, useState } from 'react';
import {
  Search, Star, MapPin, ChevronDown, Loader2, Users, CheckCircle,
  Code, Briefcase, X, Mail, Github, Linkedin, Globe
} from 'lucide-react';

function parseJSON(val: any, fallback: any = []) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return fallback; } }
  return fallback;
}

export default function TalentSearchPage() {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [recFilter, setRecFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (skillFilter) params.set('skill', skillFilter);
    if (expFilter) params.set('exp', expFilter);
    if (recFilter) params.set('recommendation', recFilter);

    const token = sessionStorage.getItem('token');
    fetch(`http://localhost:3001/api/talent?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setCandidates(data || []))
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  }, [search, skillFilter, expFilter, recFilter]);

  const highlyRecommended = candidates.filter(c => c.recommendation === 'Highly Recommended').length;
  const available = candidates.filter(c => (c.referral_readiness_score ?? 0) >= 60).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Talent Search</h1>
        <p className="text-slate-400 text-sm mt-1">Find AI-scored candidates with verified profiles and referral readiness scores</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Candidates', value: candidates.length, icon: Users, color: 'blue' },
          { label: 'Highly Recommended', value: highlyRecommended, icon: Star, color: 'emerald' },
          { label: 'Score 60+', value: available, icon: CheckCircle, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
            <Icon className={`w-5 h-5 text-${color}-400 mb-2`} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, role, or skill..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
        </div>
        <input type="text" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
          placeholder="Skill filter..."
          className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-40" />
        <div className="relative">
          <select value={expFilter} onChange={e => setExpFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none pr-9 cursor-pointer">
            <option value="">Any Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6+">6+ years</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={recFilter} onChange={e => setRecFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none pr-9 cursor-pointer">
            <option value="">All Ratings</option>
            <option value="Highly Recommended">Highly Recommended</option>
            <option value="Recommended">Recommended</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-6">
        <div className={`space-y-3 ${selected ? 'w-full lg:w-1/2' : 'w-full'}`}>
          <div className="text-slate-400 text-sm">{candidates.length} candidates found</div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-white/10 rounded-2xl">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No candidates found matching your filters.</p>
            </div>
          ) : candidates.map(c => {
            const skills = parseJSON(c.skills);
            const rrs = c.referral_readiness_score ?? 0;
            return (
              <div key={c.id}
                onClick={() => setSelected(c)}
                className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:border-blue-500/30
                  ${selected?.id === c.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-lg flex-shrink-0">
                    {c.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{c.full_name}</span>
                      {rrs >= 60 && <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full">Available</span>}
                    </div>
                    <p className="text-slate-400 text-sm">{c.current_role_title ?? 'Candidate'}{c.years_experience ? ` · ${c.years_experience} yrs exp` : ''}</p>
                    {c.location && <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${rrs >= 80 ? 'text-emerald-400' : rrs >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>{rrs}</div>
                    <div className="text-slate-500 text-xs">RRS Score</div>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.slice(0, 5).map((s: string) => <span key={s} className="bg-slate-800 text-slate-300 text-xs rounded-full px-2.5 py-0.5">{s}</span>)}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs font-medium ${c.recommendation === 'Highly Recommended' ? 'text-emerald-400' : c.recommendation === 'Recommended' ? 'text-amber-400' : 'text-slate-500'}`}>
                    {c.recommendation ?? 'Not Rated'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="hidden lg:block flex-1 sticky top-6 self-start">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-2xl">
                    {selected.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{selected.full_name}</h2>
                    <p className="text-slate-400 text-sm">{selected.current_role_title ?? 'Candidate'}</p>
                    {selected.location && <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{selected.location}</p>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${(selected.referral_readiness_score ?? 0) >= 80 ? 'text-emerald-400' : 'text-blue-400'}`}>{selected.referral_readiness_score ?? 0}</div>
                  <div className="text-slate-400 text-xs">RRS Score</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-white">{selected.years_experience ?? 0}y</div>
                  <div className="text-slate-400 text-xs">Experience</div>
                </div>
              </div>

              {selected.ats_score != null && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'ATS', value: selected.ats_score },
                    { label: 'Resume', value: selected.resume_score },
                    { label: 'Interview', value: selected.interview_score },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-800 rounded-xl p-3 text-center">
                      <div className="text-white font-bold">{value ?? 0}</div>
                      <div className="text-slate-500 text-xs">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">AI Recommendation</span>
                  <span className={`font-bold text-sm ${selected.recommendation === 'Highly Recommended' ? 'text-emerald-400' : selected.recommendation === 'Recommended' ? 'text-amber-400' : 'text-slate-500'}`}>
                    {selected.recommendation ?? 'Not Rated'}
                  </span>
                </div>
              </div>

              {parseJSON(selected.skills).length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseJSON(selected.skills).map((s: string) => (
                      <span key={s} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-full px-3 py-1">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.bio && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm">About</h4>
                  <p className="text-slate-400 text-sm">{selected.bio}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                {selected.linkedin_url && (
                  <a href={selected.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors"><Linkedin className="w-5 h-5" /></a>
                )}
                {selected.github_url && (
                  <a href={selected.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                )}
                {selected.portfolio_url && (
                  <a href={selected.portfolio_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
                )}
              </div>

              <a href={`mailto:${selected.email}`}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Contact Candidate
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
