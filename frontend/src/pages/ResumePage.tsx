import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { resumeApi, profilesApi } from '../lib/api';
import {
  Upload, FileText, CheckCircle, AlertCircle, XCircle, Zap,
  TrendingUp, Target, BarChart2, Download, RefreshCw, Loader2
} from 'lucide-react';

const MOCK_ANALYSIS = {
  resume_score: 72,
  ats_score: 65,
  extracted_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
  missing_skills: ['AWS', 'Kubernetes', 'GraphQL'],
  suggestions: [
    'Add quantifiable achievements with numbers (e.g., "Improved performance by 40%")',
    'Include keywords from job descriptions to improve ATS matching',
    'Add a professional summary section',
    'Use action verbs at the start of each bullet point',
    'Ensure consistent date formatting throughout',
  ],
  ats_keywords_missing: ['microservices', 'CI/CD', 'agile', 'REST API', 'cloud computing'],
  ats_suggestions: [
    'Add "microservices" and "CI/CD" to your experience descriptions',
    'Include cloud platform experience (AWS/GCP/Azure)',
    'Mention agile/scrum methodology explicitly',
  ],
};

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const colorClass = {
    blue: 'text-blue-400', emerald: 'text-emerald-400',
    amber: 'text-amber-400', rose: 'text-rose-400',
  }[color] ?? 'text-blue-400';
  const barClass = {
    blue: 'bg-blue-500', emerald: 'bg-emerald-500',
    amber: 'bg-amber-500', rose: 'bg-rose-500',
  }[color] ?? 'bg-blue-500';
  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className={`text-2xl font-bold ${colorClass}`}>{score}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${barClass} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-slate-500 text-xs mt-2">
        {score >= 80 ? 'Excellent' : score >= 60 ? 'Good — room for improvement' : 'Needs improvement'}
      </p>
    </div>
  );
}

export default function ResumePage() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'ats' | 'suggestions'>('upload');

  useEffect(() => {
    if (!user) return;
    resumeApi.getAll().then(data => {
      if (data && data.length > 0) {
        setAnalysis(data[0]);
        setActiveTab('ats');
      }
    }).catch(() => {});
  }, [user]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  // setError('');
  setFileName(file.name);
  setUploading(true);

  try {
    setUploading(false);
    setAnalyzing(true);

    const data = await resumeApi.upload(file);  // ← Real API call
    setAnalysis(data);
    setActiveTab('ats');
  } catch (err: any) {
    // setError(err.message || 'Failed to analyze resume');
  } finally {
    setUploading(false);
    setAnalyzing(false);
  }
}


  const TABS: { id: 'upload' | 'ats' | 'suggestions'; label: string; disabled?: boolean }[] = [
    { id: 'upload', label: 'Upload Resume' },
    { id: 'ats', label: 'ATS Score', disabled: !analysis },
    { id: 'suggestions', label: 'Suggestions', disabled: !analysis },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Resume & ATS Checker</h1>
        <p className="text-slate-400 text-sm mt-1">Upload your resume for AI-powered analysis and ATS optimization</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
        {TABS.map(({ id, label, disabled }) => (
          <button
            key={id}
            disabled={disabled}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
              ${activeTab === id ? 'bg-blue-600 text-white' : disabled ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-6">
          <label className={`block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${uploading || analyzing ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5'}`}>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            {!uploading && !analyzing ? (
              <>
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">Drop your resume here</h3>
                <p className="text-slate-400 text-sm mb-4">or click to browse</p>
                <p className="text-slate-500 text-xs">Supports PDF, DOC, DOCX (max 5MB)</p>
              </>
            ) : uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-white font-semibold text-lg mb-2">Uploading {fileName}...</h3>
                <p className="text-slate-400 text-sm">Please wait</p>
              </>
            ) : (
              <>
                <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-white font-semibold text-lg mb-2">AI is analyzing your resume...</h3>
                <p className="text-slate-400 text-sm">Checking ATS compatibility, extracting skills, generating suggestions</p>
              </>
            )}
          </label>

          {analysis && (
            <div className="grid grid-cols-2 gap-4">
              <ScoreGauge score={analysis.resume_score ?? 0} label="Resume Quality" color="blue" />
              <ScoreGauge score={analysis.ats_score ?? 0} label="ATS Score" color="emerald" />
            </div>
          )}

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" /> What we analyze
            </h3>
            <ul className="space-y-2">
              {[
                'ATS keyword compatibility scoring',
                'Skill extraction and gap analysis',
                'Formatting and structure quality',
                'Quantifiable achievement detection',
                'Industry-specific recommendations',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'ats' && analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <ScoreGauge score={analysis.resume_score ?? 0} label="Resume Quality Score" color="blue" />
            <ScoreGauge score={analysis.ats_score ?? 0} label="ATS Compatibility Score" color="emerald" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.extracted_skills ?? []).map((skill: string) => (
                  <span key={skill} className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full px-3 py-1 text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.missing_skills ?? []).map((skill: string) => (
                  <span key={skill} className="bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full px-3 py-1 text-sm">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" /> ATS Keywords Missing
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {(analysis.ats_keywords_missing ?? []).map((kw: string) => (
                <span key={kw} className="bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-full px-3 py-1 text-sm">
                  {kw}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              {(analysis.ats_suggestions ?? []).map((sug: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  {sug}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && analysis && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" /> Improvement Suggestions
            </h3>
            <div className="space-y-3">
              {(analysis.suggestions ?? []).map((sug: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 text-sm">{sug}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Re-upload Improved Resume
          </button>
        </div>
      )}
    </div>
  );
}
