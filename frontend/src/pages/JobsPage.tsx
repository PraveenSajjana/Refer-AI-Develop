import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, MapPin, Briefcase, Clock, Star, Filter, ChevronDown,
  Building2, TrendingUp, ArrowRight, Bookmark, ExternalLink, Loader2
} from 'lucide-react';

const MOCK_JOBS = [
  { id: '1', title: 'Senior Software Engineer', company_name: 'Google', location: 'Bangalore, India', job_type: 'full_time', experience_min: 3, experience_max: 8, salary_min: 25, salary_max: 45, skills_required: ['React', 'Node.js', 'GCP'], is_featured: true, application_count: 234, created_at: new Date().toISOString(), description: 'Build and maintain large-scale distributed systems. Work with a world-class team.' },
  { id: '2', title: 'Product Manager', company_name: 'Microsoft', location: 'Hyderabad, India', job_type: 'full_time', experience_min: 4, experience_max: 10, salary_min: 30, salary_max: 55, skills_required: ['Product Strategy', 'SQL', 'Agile'], is_featured: true, application_count: 189, created_at: new Date().toISOString(), description: 'Lead product development for Azure cloud services.' },
  { id: '3', title: 'Data Scientist', company_name: 'Amazon', location: 'Remote', job_type: 'remote', experience_min: 2, experience_max: 6, salary_min: 20, salary_max: 40, skills_required: ['Python', 'ML', 'SQL', 'AWS'], is_featured: false, application_count: 312, created_at: new Date().toISOString(), description: 'Apply ML to improve customer experience at scale.' },
  { id: '4', title: 'Full Stack Developer', company_name: 'Flipkart', location: 'Bangalore, India', job_type: 'full_time', experience_min: 1, experience_max: 4, salary_min: 12, salary_max: 22, skills_required: ['React', 'Java', 'MySQL'], is_featured: false, application_count: 445, created_at: new Date().toISOString(), description: 'Build and scale e-commerce features used by millions.' },
  { id: '5', title: 'Backend Engineer', company_name: 'Razorpay', location: 'Bangalore, India', job_type: 'full_time', experience_min: 2, experience_max: 6, salary_min: 18, salary_max: 35, skills_required: ['Go', 'Microservices', 'Kafka'], is_featured: true, application_count: 127, created_at: new Date().toISOString(), description: 'Build the payments infrastructure that powers millions of transactions.' },
  { id: '6', title: 'DevOps Engineer', company_name: 'PhonePe', location: 'Bangalore, India', job_type: 'full_time', experience_min: 3, experience_max: 7, salary_min: 20, salary_max: 38, skills_required: ['Kubernetes', 'Docker', 'AWS', 'CI/CD'], is_featured: false, application_count: 98, created_at: new Date().toISOString(), description: 'Drive infrastructure automation at scale.' },
];

const JOB_TYPES: Record<string, { label: string; color: string }> = {
  full_time: { label: 'Full Time', color: 'bg-blue-500/20 text-blue-300' },
  remote: { label: 'Remote', color: 'bg-emerald-500/20 text-emerald-300' },
  part_time: { label: 'Part Time', color: 'bg-amber-500/20 text-amber-300' },
  contract: { label: 'Contract', color: 'bg-violet-500/20 text-violet-300' },
  internship: { label: 'Internship', color: 'bg-cyan-500/20 text-cyan-300' },
};

export default function JobsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading] = useState(false);

  const filtered = MOCK_JOBS.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q) || j.skills_required.some(s => s.toLowerCase().includes(q));
    const matchLoc = !locationFilter || j.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchType = !typeFilter || j.job_type === typeFilter;
    return matchSearch && matchLoc && matchType;
  });

  function toggleSave(id: string) {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Job Board</h1>
        <p className="text-slate-400 text-sm mt-1">Discover opportunities at top companies — apply or request a referral</p>
      </div>

      {/* Filters */}
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
        {/* Job list */}
        <div className={`space-y-3 ${selected ? 'w-full lg:w-1/2 xl:w-2/5' : 'w-full'}`}>
          <div className="text-slate-400 text-sm">{filtered.length} jobs found</div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-white/10 rounded-2xl">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No jobs match your search.</p>
            </div>
          ) : filtered.map(job => (
            <div key={job.id}
              onClick={() => setSelected(job)}
              className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:border-blue-500/30
                ${selected?.id === job.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">
                    {job.company_name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{job.title}</div>
                    <div className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {job.company_name}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {job.is_featured && (
                    <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">Featured</span>
                  )}
                  <button onClick={e => { e.stopPropagation(); toggleSave(job.id); }}
                    className={`transition-colors ${saved.includes(job.id) ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}>
                    <Bookmark className="w-4 h-4" fill={saved.includes(job.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${JOB_TYPES[job.job_type]?.color ?? 'bg-slate-700 text-slate-300'}`}>
                  {JOB_TYPES[job.job_type]?.label ?? job.job_type}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
                {job.salary_min && (
                  <span className="text-slate-400 text-xs">
                    ₹{job.salary_min}-{job.salary_max} LPA
                  </span>
                )}
                <span className="text-slate-400 text-xs">
                  {job.experience_min}-{job.experience_max} yrs
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills_required.slice(0, 4).map(s => (
                  <span key={s} className="bg-slate-800 text-slate-300 text-xs rounded-full px-2.5 py-0.5">{s}</span>
                ))}
              </div>
              <div className="mt-3 text-slate-500 text-xs">{job.application_count} applicants</div>
            </div>
          ))}
        </div>

        {/* Job detail */}
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
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg leading-none">&times;</button>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${JOB_TYPES[selected.job_type]?.color}`}>
                  {JOB_TYPES[selected.job_type]?.label}
                </span>
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {selected.location}
                </span>
                {selected.salary_min && (
                  <span className="text-slate-400 text-sm">₹{selected.salary_min}-{selected.salary_max} LPA</span>
                )}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{selected.description}</p>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.skills_required.map((s: string) => (
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
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
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
