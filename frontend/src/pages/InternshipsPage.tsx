import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, MapPin, GraduationCap, Clock, DollarSign, Building2,
  ExternalLink, TrendingUp, ChevronDown, Loader2, BookOpen
} from 'lucide-react';

const MOCK_INTERNSHIPS = [
  { id: '1', title: 'Software Engineering Intern', company_name: 'Google', location: 'Bangalore, India', is_remote: false, duration: '6 months', stipend_min: 80000, stipend_max: 100000, skills_required: ['Python', 'Algorithms', 'Data Structures'], openings: 5, description: 'Work on real Google products with SWE mentorship. PPO available.' },
  { id: '2', title: 'Product Management Intern', company_name: 'Microsoft', location: 'Hyderabad, India', is_remote: false, duration: '3 months', stipend_min: 60000, stipend_max: 80000, skills_required: ['Product Thinking', 'SQL', 'Excel'], openings: 3, description: 'Drive product roadmap for Azure services alongside senior PMs.' },
  { id: '3', title: 'Data Science Intern', company_name: 'Flipkart', location: 'Remote', is_remote: true, duration: '4 months', stipend_min: 40000, stipend_max: 60000, skills_required: ['Python', 'ML', 'Pandas'], openings: 8, description: 'Apply ML to improve product recommendations for 400M users.' },
  { id: '4', title: 'Frontend Engineering Intern', company_name: 'Swiggy', location: 'Bangalore, India', is_remote: false, duration: '6 months', stipend_min: 35000, stipend_max: 50000, skills_required: ['React', 'TypeScript', 'CSS'], openings: 4, description: 'Build the next-gen food delivery interface used by millions.' },
  { id: '5', title: 'Backend Engineering Intern', company_name: 'Razorpay', location: 'Bangalore, India', is_remote: false, duration: '4 months', stipend_min: 50000, stipend_max: 70000, skills_required: ['Node.js', 'SQL', 'REST APIs'], openings: 6, description: 'Work on payments infrastructure powering millions of transactions.' },
  { id: '6', title: 'ML Engineering Intern', company_name: 'PhonePe', location: 'Remote', is_remote: true, duration: '3 months', stipend_min: 45000, stipend_max: 65000, skills_required: ['Python', 'TensorFlow', 'Statistics'], openings: 2, description: 'Build fraud detection and risk models for digital payments.' },
];

export default function InternshipsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const filtered = MOCK_INTERNSHIPS.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.title.toLowerCase().includes(q) || i.company_name.toLowerCase().includes(q) || i.skills_required.some(s => s.toLowerCase().includes(q));
    const matchRemote = !remoteOnly || i.is_remote;
    return matchSearch && matchRemote;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Internship Board</h1>
        <p className="text-slate-400 text-sm mt-1">Find internships at top companies and kickstart your career</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search internships, companies, skills..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
        <label className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-violet-500/30 transition-all">
          <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="rounded" />
          <span className="text-slate-300 text-sm">Remote only</span>
        </label>
      </div>

      <div className="flex gap-6">
        <div className={`space-y-3 ${selected ? 'w-full lg:w-1/2' : 'w-full'}`}>
          <div className="text-slate-400 text-sm">{filtered.length} internships found</div>
          {filtered.map(internship => (
            <div key={internship.id}
              onClick={() => setSelected(internship)}
              className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:border-violet-500/30
                ${selected?.id === internship.id ? 'border-violet-500 bg-violet-500/5' : 'border-white/10'}`}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">
                  {internship.company_name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{internship.title}</div>
                  <div className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" /> {internship.company_name}
                  </div>
                </div>
                {internship.is_remote && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-medium">Remote</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {internship.location}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {internship.duration}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> ₹{(internship.stipend_min / 1000).toFixed(0)}K-{(internship.stipend_max / 1000).toFixed(0)}K/mo
                </span>
                <span className="text-violet-400 text-xs font-medium">{internship.openings} openings</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {internship.skills_required.map(s => (
                  <span key={s} className="bg-slate-800 text-slate-300 text-xs rounded-full px-2.5 py-0.5">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="hidden lg:block flex-1 sticky top-6 self-start">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-xl">{selected.title}</h2>
                  <p className="text-slate-400 mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> {selected.company_name}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xl leading-none">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">Duration</div>
                  <div className="text-white font-semibold">{selected.duration}</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">Stipend</div>
                  <div className="text-white font-semibold">₹{(selected.stipend_min / 1000).toFixed(0)}K-{(selected.stipend_max / 1000).toFixed(0)}K/mo</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">Location</div>
                  <div className="text-white font-semibold">{selected.location}</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">Openings</div>
                  <div className="text-white font-semibold">{selected.openings}</div>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{selected.description}</p>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.skills_required.map((s: string) => (
                    <span key={s} className="bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs rounded-full px-3 py-1">{s}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  Apply Now <ExternalLink className="w-4 h-4" />
                </button>
                <button className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Request Referral
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
