import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, Filter, TrendingUp, Star, MapPin, Code, Briefcase,
  Building2, CheckCircle, ChevronDown, Loader2, Users, SlidersHorizontal
} from 'lucide-react';

const MOCK_CANDIDATES = [
  { id: 'c1', name: 'Aarav Shah', role: 'Software Engineer', location: 'Bangalore', skills: ['React', 'Node.js', 'TypeScript'], exp: 3, rrs: 82, recommendation: 'Highly Recommended', education: 'IIT Bombay', available: true },
  { id: 'c2', name: 'Meera Nair', role: 'Data Scientist', location: 'Hyderabad', skills: ['Python', 'ML', 'SQL', 'AWS'], exp: 4, rrs: 76, recommendation: 'Recommended', education: 'NIT Trichy', available: true },
  { id: 'c3', name: 'Raj Patel', role: 'Backend Developer', location: 'Pune', skills: ['Java', 'Spring Boot', 'MySQL'], exp: 5, rrs: 88, recommendation: 'Highly Recommended', education: 'BITS Pilani', available: true },
  { id: 'c4', name: 'Divya Krishnan', role: 'DevOps Engineer', location: 'Chennai', skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD'], exp: 2, rrs: 65, recommendation: 'Recommended', education: 'VIT Vellore', available: false },
  { id: 'c5', name: 'Rohan Gupta', role: 'Full Stack Developer', location: 'Mumbai', skills: ['React', 'Python', 'PostgreSQL', 'Redis'], exp: 6, rrs: 91, recommendation: 'Highly Recommended', education: 'IIT Delhi', available: true },
  { id: 'c6', name: 'Preethi Agarwal', role: 'Product Engineer', location: 'Bangalore', skills: ['JavaScript', 'GraphQL', 'MongoDB'], exp: 3, rrs: 72, recommendation: 'Recommended', education: 'NSIT Delhi', available: true },
];

export default function TalentSearchPage() {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [recFilter, setRecFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const filtered = MOCK_CANDIDATES.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q));
    const matchSkill = !skillFilter || c.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    const matchExp = !expFilter || (expFilter === '0-2' ? c.exp <= 2 : expFilter === '3-5' ? c.exp >= 3 && c.exp <= 5 : c.exp >= 6);
    const matchRec = !recFilter || c.recommendation === recFilter;
    return matchSearch && matchSkill && matchExp && matchRec;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Talent Search</h1>
        <p className="text-slate-400 text-sm mt-1">Find AI-scored candidates with verified profiles and referral readiness scores</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Candidates', value: MOCK_CANDIDATES.length, icon: Users, color: 'blue' },
          { label: 'Highly Recommended', value: MOCK_CANDIDATES.filter(c => c.recommendation === 'Highly Recommended').length, icon: Star, color: 'emerald' },
          { label: 'Available Now', value: MOCK_CANDIDATES.filter(c => c.available).length, icon: CheckCircle, color: 'amber' },
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
            placeholder="Search candidates by name, role, or skill..."
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
          <div className="text-slate-400 text-sm">{filtered.length} candidates found</div>
          {filtered.map(c => (
            <div key={c.id}
              onClick={() => setSelected(c)}
              className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:border-blue-500/30
                ${selected?.id === c.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-lg">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold">{c.name}</span>
                    {c.available && <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full">Available</span>}
                  </div>
                  <p className="text-slate-400 text-sm">{c.role} · {c.exp} yrs exp</p>
                  <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-lg font-bold ${c.rrs >= 80 ? 'text-emerald-400' : c.rrs >= 65 ? 'text-blue-400' : 'text-amber-400'}`}>{c.rrs}</div>
                  <div className="text-slate-500 text-xs">RRS Score</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {c.skills.map(s => <span key={s} className="bg-slate-800 text-slate-300 text-xs rounded-full px-2.5 py-0.5">{s}</span>)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs font-medium ${c.recommendation === 'Highly Recommended' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {c.recommendation}
                </span>
                <span className="text-slate-500 text-xs">{c.education}</span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="hidden lg:block flex-1 sticky top-6 self-start">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-2xl">
                    {selected.name[0]}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{selected.name}</h2>
                    <p className="text-slate-400 text-sm">{selected.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xl">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${selected.rrs >= 80 ? 'text-emerald-400' : 'text-blue-400'}`}>{selected.rrs}</div>
                  <div className="text-slate-400 text-xs">RRS Score</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-white">{selected.exp}y</div>
                  <div className="text-slate-400 text-xs">Experience</div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">AI Recommendation</span>
                  <span className={`font-bold text-sm ${selected.recommendation === 'Highly Recommended' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selected.recommendation}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((s: string) => (
                    <span key={s} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-full px-3 py-1">{s}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-400">Education: </span><span className="text-white">{selected.education}</span></div>
                <div><span className="text-slate-400">Location: </span><span className="text-white">{selected.location}</span></div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
                Contact Candidate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
