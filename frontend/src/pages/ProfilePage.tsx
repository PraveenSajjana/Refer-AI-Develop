import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profilesApi } from '../lib/api';
import {
  User, MapPin, Linkedin, Github, Globe, Briefcase, Plus, Trash2,
  Save, Edit3, CheckCircle, Loader2, GraduationCap, Award, Code
} from 'lucide-react';

type Section = 'basic' | 'skills' | 'education' | 'experience' | 'projects' | 'certifications';

const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'AWS', 'Docker', 'SQL', 'Machine Learning', 'Go', 'Rust', 'Flutter'];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [profile, setProfile] = useState<any>({});
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    profilesApi.getCandidate().then(data => {
      if (data) setProfile(data);
    }).catch(() => {});

    profilesApi.getEducation().then(data => setEducation(data || [])).catch(() => setEducation([]));
    profilesApi.getExperience().then(data => setExperience(data || [])).catch(() => setExperience([]));
    profilesApi.getProjects().then(data => setProjects(data || [])).catch(() => setProjects([]));
    profilesApi.getCertifications().then(data => setCertifications(data || [])).catch(() => setCertifications([]));
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      await profilesApi.saveCandidate(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
    setSaving(false);
  }

  function addSkill(skill: string) {
    if (!skill.trim()) return;
    const skills = profile.skills ?? [];
    if (!skills.includes(skill.trim())) {
      setProfile((p: any) => ({ ...p, skills: [...skills, skill.trim()] }));
    }
    setSkillInput('');
  }

  function removeSkill(skill: string) {
    setProfile((p: any) => ({ ...p, skills: (p.skills ?? []).filter((s: string) => s !== skill) }));
  }

  async function addEducation() {
    try {
      const data = await profilesApi.addEducation({ institution: 'New Institution', degree: 'Degree' });
      setEducation(prev => [...prev, data]);
    } catch (error) {
      console.error('Failed to add education:', error);
    }
  }

  async function updateEducation(id: string, field: string, value: string) {
    setEducation(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    try {
      await profilesApi.updateEducation(id, { [field]: value });
    } catch (error) {
      console.error('Failed to update education:', error);
    }
  }

  async function deleteEducation(id: string) {
    try {
      await profilesApi.deleteEducation(id);
      setEducation(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete education:', error);
    }
  }

  async function addExperience() {
    try {
      const data = await profilesApi.addExperience({ company: 'Company', role: 'Role' });
      setExperience(prev => [...prev, data]);
    } catch (error) {
      console.error('Failed to add experience:', error);
    }
  }

  async function updateExperience(id: string, field: string, value: string | boolean) {
    setExperience(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    try {
      await profilesApi.updateExperience(id, { [field]: value });
    } catch (error) {
      console.error('Failed to update experience:', error);
    }
  }

  async function deleteExperience(id: string) {
    try {
      await profilesApi.deleteExperience(id);
      setExperience(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  }

  async function addProject() {
    try {
      const data = await profilesApi.addProject({ title: 'New Project' });
      setProjects(prev => [...prev, data]);
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  }

  async function updateProject(id: string, field: string, value: string | string[]) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    try {
      await profilesApi.updateProject(id, { [field]: value });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }

  async function deleteProject(id: string) {
    try {
      await profilesApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  async function addCertification() {
    try {
      const data = await profilesApi.addCertification({ name: 'New Certification' });
      setCertifications(prev => [...prev, data]);
    } catch (error) {
      console.error('Failed to add certification:', error);
    }
  }

  async function updateCertification(id: string, field: string, value: string) {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    try {
      await profilesApi.addCertification({ id, [field]: value });
    } catch (error) {
      console.error('Failed to update certification:', error);
    }
  }

  async function deleteCertification(id: string) {
    try {
      await profilesApi.deleteCertification(id);
      setCertifications(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete certification:', error);
    }
  }

  const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Globe },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Build a strong profile to maximize your Referral Readiness Score</p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeSection === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl p-6">
          {activeSection === 'basic' && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', field: 'full_name', placeholder: 'Your full name', type: 'text', fromUser: true },
                  { label: 'Email', field: 'email', placeholder: 'Email', type: 'email', fromUser: true, disabled: true },
                ].map(({ label, field, placeholder, type, fromUser, disabled }) => (
                  <div key={field}>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">{label}</label>
                    <input
                      type={type}
                      value={fromUser ? (user as any)[field] ?? '' : profile[field] ?? ''}
                      disabled={disabled}
                      onChange={e => !fromUser && setProfile((p: any) => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Headline', field: 'headline', placeholder: 'e.g. Senior Software Engineer' },
                  { label: 'Location', field: 'location', placeholder: 'e.g. Bangalore, India' },
                  { label: 'Phone', field: 'phone', placeholder: '+91 98765 43210' },
                  { label: 'Current Role', field: 'current_role_title', placeholder: 'e.g. SDE-2' },
                  { label: 'Current Company', field: 'current_company', placeholder: 'e.g. Infosys' },
                  { label: 'Years of Experience', field: 'years_experience', placeholder: '3', type: 'number' },
                ].map(({ label, field, placeholder, type }) => (
                  <div key={field}>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">{label}</label>
                    <input
                      type={type ?? 'text'}
                      value={profile[field] ?? ''}
                      onChange={e => setProfile((p: any) => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Bio</label>
                <textarea
                  value={profile.bio ?? ''}
                  onChange={e => setProfile((p: any) => ({ ...p, bio: e.target.value }))}
                  placeholder="Write a brief bio about yourself..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'LinkedIn URL', field: 'linkedin_url', icon: Linkedin, placeholder: 'linkedin.com/in/...' },
                  { label: 'GitHub URL', field: 'github_url', icon: Github, placeholder: 'github.com/...' },
                  { label: 'Portfolio URL', field: 'portfolio_url', icon: Globe, placeholder: 'yoursite.com' },
                ].map(({ label, field, icon: Icon, placeholder }) => (
                  <div key={field}>
                    <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </label>
                    <input
                      type="url"
                      value={profile[field] ?? ''}
                      onChange={e => setProfile((p: any) => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg">Skills</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
                  placeholder="Add a skill..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button onClick={() => addSkill(skillInput)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.skills ?? []).map((skill: string) => (
                  <span key={skill} className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full px-3 py-1 text-sm">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-white ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-3">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(s => !(profile.skills ?? []).includes(s)).map(s => (
                    <button key={s} onClick={() => addSkill(s)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-full px-3 py-1 text-sm transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Education</h2>
                <button onClick={addEducation}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {education.map(edu => (
                <div key={edu.id} className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => deleteEducation(edu.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: 'Institution', field: 'institution' },
                      { label: 'Degree', field: 'degree' },
                      { label: 'Field of Study', field: 'field' },
                      { label: 'Grade/CGPA', field: 'grade' },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                        <input
                          type="text"
                          value={edu[field] ?? ''}
                          onChange={e => updateEducation(edu.id, field, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    ))}
                    {[
                      { label: 'Start Year', field: 'start_year' },
                      { label: 'End Year', field: 'end_year' },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                        <input
                          type="number"
                          value={edu[field] ?? ''}
                          onChange={e => updateEducation(edu.id, field, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {education.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No education entries yet. Add your academic background.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Work Experience</h2>
                <button onClick={addExperience}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {experience.map(exp => (
                <div key={exp.id} className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={exp.is_current ?? false}
                        onChange={e => updateExperience(exp.id, 'is_current', e.target.checked)}
                        className="rounded border-slate-600" />
                      <span className="text-slate-400 text-sm">Currently working here</span>
                    </label>
                    <button onClick={() => deleteExperience(exp.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: 'Company', field: 'company' },
                      { label: 'Role', field: 'role' },
                      { label: 'Location', field: 'location' },
                      { label: 'Start Date', field: 'start_date', type: 'date' },
                    ].map(({ label, field, type }) => (
                      <div key={field}>
                        <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                        <input
                          type={type ?? 'text'}
                          value={exp[field] ?? ''}
                          onChange={e => updateExperience(exp.id, field, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    ))}
                    {!exp.is_current && (
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">End Date</label>
                        <input
                          type="date"
                          value={exp.end_date ?? ''}
                          onChange={e => updateExperience(exp.id, 'end_date', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Description</label>
                    <textarea
                      value={exp.description ?? ''}
                      onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      placeholder="Key responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
              {experience.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No experience entries yet.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Projects</h2>
                <button onClick={addProject}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {projects.map(proj => (
                <div key={proj.id} className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => deleteProject(proj.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: 'Project Title', field: 'title' },
                      { label: 'Live URL', field: 'url' },
                      { label: 'GitHub URL', field: 'github_url' },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                        <input
                          type="text"
                          value={proj[field] ?? ''}
                          onChange={e => updateProject(proj.id, field, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Tech Stack (comma-separated)</label>
                      <input
                        type="text"
                        value={(proj.tech_stack ?? []).join(', ')}
                        onChange={e => updateProject(proj.id, 'tech_stack', e.target.value.split(',').map((s: string) => s.trim()))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="React, Node.js, PostgreSQL"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Description</label>
                    <textarea
                      value={proj.description ?? ''}
                      onChange={e => updateProject(proj.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      placeholder="Describe your project..."
                    />
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No projects yet. Add your best work!</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'certifications' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Certifications</h2>
                <button onClick={addCertification}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {certifications.map(cert => (
                <div key={cert.id} className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => deleteCertification(cert.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: 'Certification Name', field: 'name' },
                      { label: 'Issuing Organization', field: 'issuer' },
                      { label: 'Issue Date', field: 'issue_date', type: 'date' },
                      { label: 'Expiry Date', field: 'expiry_date', type: 'date' },
                      { label: 'Credential ID', field: 'credential_id' },
                      { label: 'Credential URL', field: 'credential_url' },
                    ].map(({ label, field, type }) => (
                      <div key={field}>
                        <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                        <input
                          type={type ?? 'text'}
                          value={cert[field] ?? ''}
                          onChange={e => updateCertification(cert.id, field, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {certifications.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No certifications yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
