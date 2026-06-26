import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assessmentsApi, profilesApi } from '../lib/api';
import {
  Target, CheckCircle, Clock, Loader2, ArrowRight, BarChart2,
  Brain, Code, AlertCircle, Trophy, RefreshCw
} from 'lucide-react';

const MOCK_ASSESSMENTS = [
  {
    type: 'aptitude',
    title: 'Aptitude & Reasoning',
    desc: 'Logical reasoning, quantitative aptitude, and verbal ability',
    questions: 20,
    time: 30,
    icon: Brain,
    color: 'blue',
  },
  {
    type: 'coding',
    title: 'Coding Assessment',
    desc: 'Data structures, algorithms, and problem solving',
    questions: 10,
    time: 60,
    icon: Code,
    color: 'emerald',
  },
  {
    type: 'domain',
    title: 'Domain Knowledge',
    desc: 'Subject matter expertise in your field',
    questions: 15,
    time: 25,
    icon: Target,
    color: 'amber',
  },
];

const SAMPLE_QUESTIONS = [
  {
    q: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correct: 1,
  },
  {
    q: 'Which data structure is used in BFS traversal?',
    options: ['Stack', 'Queue', 'Heap', 'Tree'],
    correct: 1,
  },
  {
    q: 'In JavaScript, what does "=== " mean?',
    options: ['Assignment', 'Equality without type check', 'Strict equality with type check', 'Comparison'],
    correct: 2,
  },
  {
    q: 'Which HTTP method is idempotent?',
    options: ['POST', 'PUT', 'PATCH', 'DELETE only'],
    correct: 1,
  },
  {
    q: 'What is the purpose of a reverse proxy?',
    options: ['Route traffic from clients to backend servers', 'Increase database speed', 'Compress CSS files', 'Handle DNS queries'],
    correct: 0,
  },
];

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'list' | 'taking' | 'result'>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    assessmentsApi.getAll().then(data => setHistory(data ?? [])).catch(() => setHistory([]));
  }, [user]);

  useEffect(() => {
    if (mode !== 'taking' || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, timeLeft]);

  function startAssessment(assessment: any) {
    setSelectedAssessment(assessment);
    setCurrentQ(0);
    setAnswers([]);
    setTimeLeft(assessment.time * 60);
    setMode('taking');
  }

  function selectAnswer(optionIdx: number) {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
  }

  async function submitAssessment() {
    const correct = answers.filter((a, i) => a === SAMPLE_QUESTIONS[i % SAMPLE_QUESTIONS.length].correct).length;
    const pct = Math.round((correct / SAMPLE_QUESTIONS.length) * 100);
    setScore(pct);

    if (user) {
      try {
        await assessmentsApi.create({
          assessment_type: selectedAssessment.type,
          title: selectedAssessment.title,
          total_questions: SAMPLE_QUESTIONS.length,
          status: 'completed',
          score: pct,
          completed_at: new Date().toISOString(),
        });
        await profilesApi.saveCandidate({ assessment_score: pct });
      } catch (error) {
        console.error('Failed to save assessment:', error);
      }
    }
    setMode('result');
  }

  if (mode === 'list') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessments</h1>
          <p className="text-slate-400 text-sm mt-1">Complete assessments to boost your Referral Readiness Score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_ASSESSMENTS.map((assessment) => {
            const { type, title, desc, questions, time, icon: Icon, color } = assessment;
            const done = history.find(h => h.assessment_type === type && h.status === 'completed');
            return (
              <div key={type} className="bg-slate-900 border border-white/10 hover:border-blue-500/30 rounded-2xl p-6 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-10 h-10 text-${color}-400`} />
                  {done && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm mb-4">{desc}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {questions} questions</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {time} min</span>
                </div>
                {done ? (
                  <div className="flex items-center justify-between">
                    <div className="text-emerald-400 font-bold">Score: {done.score}%</div>
                    <button onClick={() => startAssessment(assessment)}
                      className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Retake
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startAssessment(assessment)}
                    className={`w-full bg-${color}-600 hover:bg-${color}-500 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2`}>
                    Start <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {history.length > 0 && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Assessment History</h3>
            <div className="space-y-3">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white text-sm font-medium">{h.title}</p>
                    <p className="text-slate-400 text-xs">{new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${h.score >= 70 ? 'text-emerald-400' : h.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {h.score}%
                    </div>
                    <div className="text-slate-500 text-xs capitalize">{h.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'taking') {
    const q = SAMPLE_QUESTIONS[currentQ % SAMPLE_QUESTIONS.length];
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const progress = ((currentQ) / SAMPLE_QUESTIONS.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold">{selectedAssessment.title}</h2>
            <p className="text-slate-400 text-sm">Question {currentQ + 1} of {SAMPLE_QUESTIONS.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg
            ${timeLeft < 60 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-white'}`}>
            <Clock className="w-4 h-4" />
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-lg mb-6">{q.q}</h3>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => selectAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                  ${answers[currentQ] === i
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-slate-700 hover:border-slate-600 text-slate-300 hover:bg-white/5'}`}>
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {currentQ > 0 && (
            <button onClick={() => setCurrentQ(q => q - 1)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl transition-all">
              Previous
            </button>
          )}
          {currentQ < SAMPLE_QUESTIONS.length - 1 ? (
            <button onClick={() => setCurrentQ(q => q + 1)} disabled={answers[currentQ] === undefined}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submitAssessment} disabled={answers.length < SAMPLE_QUESTIONS.length}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Submit Assessment
            </button>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Practice';
    const gradeColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-blue-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400';
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-10">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">{selectedAssessment.title}</h2>
          <p className="text-slate-400 mb-6">Assessment Complete</p>
          <div className={`text-6xl font-bold mb-2 ${gradeColor}`}>{score}%</div>
          <div className={`text-xl font-semibold ${gradeColor} mb-4`}>{grade}</div>
          <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm">
            {score >= 70 ? 'Great performance! Your assessment score has been updated in your Referral Readiness profile.' : 'Keep practicing! Retake the assessment after reviewing the topics to improve your score.'}
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setMode('list')}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all">
            Back to Assessments
          </button>
          <button onClick={() => startAssessment(selectedAssessment)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retake
          </button>
        </div>
      </div>
    );
  }

  return null;
}
