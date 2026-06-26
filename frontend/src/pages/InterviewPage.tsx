import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { interviewsApi, profilesApi } from '../lib/api';
import {
  MessageSquare, Mic, Send, Bot, User, Loader2, BarChart2,
  CheckCircle, ArrowRight, RefreshCw, Zap, Clock, Star
} from 'lucide-react';

const TECHNICAL_QUESTIONS = [
  'Tell me about yourself and your technical background.',
  'Explain the difference between REST and GraphQL APIs.',
  'What is your approach to handling state management in large React applications?',
  'Describe a challenging technical problem you solved recently.',
  'What are the principles of SOLID design patterns?',
  'How do you ensure code quality in your projects?',
  'Explain the concept of database indexing and when to use it.',
  'What is your experience with microservices architecture?',
  'How do you approach performance optimization in web applications?',
  'Describe your experience with CI/CD pipelines.',
];

const HR_QUESTIONS = [
  'Why are you looking to change your current role?',
  'What are your salary expectations?',
  'Where do you see yourself in 5 years?',
  'What is your greatest professional achievement?',
  'How do you handle tight deadlines and pressure?',
  'Describe a conflict at work and how you resolved it.',
  'What motivates you professionally?',
  'Why do you want to work at our company?',
];

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  const colorClass = { blue: 'text-blue-400', emerald: 'text-emerald-400', amber: 'text-amber-400', violet: 'text-violet-400' }[color] ?? 'text-blue-400';
  const barClass = { blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', violet: 'bg-violet-500' }[color] ?? 'bg-blue-500';
  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
      <div className="flex justify-between mb-2">
        <span className="text-slate-300 text-sm">{label}</span>
        <span className={`font-bold ${colorClass}`}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full">
        <div className={`h-1.5 rounded-full ${barClass}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'select' | 'interview' | 'report'>('select');
  const [interviewType, setInterviewType] = useState<'technical' | 'hr' | 'mixed'>('technical');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [report, setReport] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const questions = interviewType === 'hr' ? HR_QUESTIONS :
    interviewType === 'technical' ? TECHNICAL_QUESTIONS :
    [...TECHNICAL_QUESTIONS.slice(0, 5), ...HR_QUESTIONS.slice(0, 5)];

  useEffect(() => {
    if (mode === 'interview') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function formatTimer(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  function startInterview() {
    setMessages([{ role: 'ai', text: questions[0] }]);
    setCurrentQ(0);
    setMode('interview');
    setTimer(0);
    setAnswers([]);
  }

  async function sendAnswer() {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAnswers(prev => [...prev, userMsg]);
    setThinking(true);

    await new Promise(r => setTimeout(r, 1500));

    const nextQ = currentQ + 1;
    let aiResponse = '';
    if (nextQ < questions.length) {
      const followUps = [
        `Great answer! Let me dig deeper — ${questions[nextQ]}`,
        `Interesting perspective. Now, ${questions[nextQ]}`,
        `Thank you for that. Next: ${questions[nextQ]}`,
        `Good. Moving on — ${questions[nextQ]}`,
      ];
      aiResponse = followUps[Math.floor(Math.random() * followUps.length)];
      setCurrentQ(nextQ);
    } else {
      aiResponse = "That concludes our interview! Thank you for your time. I'll now generate your performance report with detailed feedback.";
      await new Promise(r => setTimeout(r, 1000));
      finishInterview([...answers, userMsg]);
    }

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setThinking(false);
  }

  async function finishInterview(allAnswers: string[]) {
    clearInterval(timerRef.current);
    const mockReport = {
      technical_score: Math.floor(60 + Math.random() * 30),
      communication_score: Math.floor(65 + Math.random() * 25),
      confidence_score: Math.floor(55 + Math.random() * 35),
      problem_solving_score: Math.floor(60 + Math.random() * 30),
      overall_score: Math.floor(62 + Math.random() * 28),
      strengths: ['Good technical depth', 'Clear communication', 'Structured thinking'],
      improvements: ['Work on conciseness', 'Add more metrics to achievements', 'Practice STAR format for behavioral questions'],
    };
    mockReport.overall_score = Math.round((mockReport.technical_score + mockReport.communication_score + mockReport.confidence_score + mockReport.problem_solving_score) / 4);

    if (user) {
      try {
        await interviewsApi.create({
          interview_type: interviewType,
          questions: questions.slice(0, allAnswers.length),
          answers: allAnswers,
          ...mockReport,
          status: 'completed',
          completed_at: new Date().toISOString(),
          report: mockReport,
        });
        await profilesApi.saveCandidate({ interview_score: mockReport.overall_score });
      } catch (error) {
        console.error('Failed to save interview session:', error);
      }
    }

    setReport(mockReport);
    setTimeout(() => setMode('report'), 500);
  }

  if (mode === 'select') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Mock Interview</h1>
          <p className="text-slate-400 text-sm mt-1">Practice with AI-powered interviews and get detailed feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([['technical', 'Technical Interview', 'Algorithms, system design, coding concepts', 'blue'],
             ['hr', 'HR Interview', 'Behavioral questions, culture fit, motivation', 'emerald'],
             ['mixed', 'Mixed Interview', 'Full round combining technical and HR', 'amber']] as const).map(([type, title, desc, color]) => (
            <button key={type} onClick={() => setInterviewType(type)}
              className={`p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02]
                ${interviewType === type
                  ? `border-${color}-500 bg-${color}-500/10`
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}>
              <MessageSquare className={`w-8 h-8 mb-3 ${interviewType === type ? `text-${color}-400` : 'text-slate-500'}`} />
              <div className={`font-bold mb-1 ${interviewType === type ? 'text-white' : 'text-slate-300'}`}>{title}</div>
              <div className="text-slate-400 text-sm">{desc}</div>
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Interview Details</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{questions.length}</div>
              <div className="text-slate-400 text-sm">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">~{questions.length * 2}m</div>
              <div className="text-slate-400 text-sm">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">4</div>
              <div className="text-slate-400 text-sm">Score Metrics</div>
            </div>
          </div>
          <button onClick={startInterview}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" /> Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'interview') {
    return (
      <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-slate-900 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">AI Interviewer</div>
              <div className="text-slate-400 text-xs capitalize">{interviewType} Interview</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              {formatTimer(timer)}
            </div>
            <div className="text-slate-400 text-sm">{Math.min(currentQ + 1, questions.length)}/{questions.length}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
          <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'ai' ? 'bg-slate-900 border border-white/10 text-slate-200' : 'bg-blue-600 text-white'
              }`}>
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
          {thinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendAnswer()}
            placeholder="Type your answer..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <button onClick={sendAnswer} disabled={!input.trim() || thinking}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'report' && report) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-slate-400">Here's your detailed performance report</p>
          <div className="mt-4">
            <div className="text-5xl font-bold text-white">{report.overall_score}</div>
            <div className="text-slate-400">Overall Score / 100</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ScoreCard label="Technical Knowledge" score={report.technical_score} color="blue" />
          <ScoreCard label="Communication" score={report.communication_score} color="emerald" />
          <ScoreCard label="Confidence" score={report.confidence_score} color="amber" />
          <ScoreCard label="Problem Solving" score={report.problem_solving_score} color="violet" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Strengths
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((s: string) => (
                <li key={s} className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" /> Areas to Improve
            </h3>
            <ul className="space-y-2">
              {report.improvements.map((s: string) => (
                <li key={s} className="flex items-start gap-2 text-slate-300 text-sm">
                  <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button onClick={() => { setMode('select'); setMessages([]); setAnswers([]); setReport(null); }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
          <RefreshCw className="w-4 h-4" /> Start Another Interview
        </button>
      </div>
    );
  }

  return null;
}
