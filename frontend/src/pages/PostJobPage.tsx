import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jobsApi } from '../lib/api';
import { useNavigate } from '../lib/router';
import {
  Briefcase, MapPin, DollarSign, Clock, Tag, Plus, X, Loader2,
  CheckCircle, ArrowRight, Building2
} from 'lucide-react';

const JOB_TYPES = ['full_time', 'part_time', 'remote', 'contract', 'internship'];
const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'AWS', 'Docker', 'SQL', 'Machine Learning', 'Kubernetes'];

export default function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'full_time',
    experience_min: 0,
    experience_max: 5,
    salary_min: '',
    salary_max: '',
    description: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function addSkill(s: string) {
    if (!s.trim() || skills.includes(s.trim())) return;
    setSkills(prev => [...prev, s.trim()]);
    setSkillInput('');
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Job title is required';
    if (!form.company_name.trim()) e.company_name = 'Company name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (skills.length === 0) e.skills = 'At least one skill is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !user) return;
    setPosting(true);
    try {
      await jobsApi.create({
        ...form,
        skills_required: skills,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        posted_by: user.id,
      });
      setPosted(true);
    } catch (error) {
      console.error('Failed to post job:', error);
    }
    setPosting(false);
  }

  if (posted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Job Posted!</h2>
        <p className="text-slate-400 mb-8">Your job listing is now live and candidates can apply or request referrals.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => { setPosted(false); setForm({ title: '', company_name: '', location: '', job_type: 'full_time', experience_min: 0, experience_max: 5, salary_min: '', salary_max: '', description: '' }); setSkills([]); }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-6 py-3 rounded-xl transition-all">
            Post Another
          </button>
          <button onClick={() => navigate('/jobs')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
            View Job Board <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Post a Job</h1>
        <p className="text-slate-400 text-sm mt-1">Reach thousands of qualified, AI-scored candidates</p>
      </div>

      <form onSubmit={handlePost} className="space-y-6">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" /> Job Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Job Title *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${errors.title ? 'border-rose-500' : 'border-slate-700'}`} />
              {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Company Name *</label>
              <input type="text" value={form.company_name} onChange={e => set('company_name', e.target.value)}
                placeholder="e.g. Google"
                className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${errors.company_name ? 'border-rose-500' : 'border-slate-700'}`} />
              {errors.company_name && <p className="text-rose-400 text-xs mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Location</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Job Type</label>
              <select value={form.job_type} onChange={e => set('job_type', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all capitalize">
                {JOB_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Compensation & Experience
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Min Experience (yrs)', field: 'experience_min', type: 'number' },
              { label: 'Max Experience (yrs)', field: 'experience_max', type: 'number' },
              { label: 'Min Salary (LPA)', field: 'salary_min', type: 'number' },
              { label: 'Max Salary (LPA)', field: 'salary_max', type: 'number' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="text-slate-300 text-sm font-medium mb-2 block">{label}</label>
                <input type={type} value={(form as any)[field]} onChange={e => set(field, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" /> Required Skills *
          </h2>
          <div className="flex gap-2">
            <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
              placeholder="Add required skill..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            <button type="button" onClick={() => addSkill(skillInput)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.skills && <p className="text-rose-400 text-xs">{errors.skills}</p>}
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full px-3 py-1 text-sm">
                {s}
                <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            ))}
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                <button type="button" key={s} onClick={() => addSkill(s)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-full px-3 py-1 transition-all">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Job Description *</h2>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={8} placeholder="Describe the role, responsibilities, and what makes it exciting..."
            className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none ${errors.description ? 'border-rose-500' : 'border-slate-700'}`} />
          {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description}</p>}
        </div>

        <button type="submit" disabled={posting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-60">
          {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
          {posting ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
