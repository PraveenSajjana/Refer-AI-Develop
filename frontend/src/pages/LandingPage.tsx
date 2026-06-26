import React, { useState } from 'react';
import { Link } from '../lib/router';
import {
  Briefcase, Star, ArrowRight, Check, Zap, Users, User, TrendingUp, Shield,
  Brain, Target, Award, ChevronDown, ChevronUp, Globe, BarChart2,
  MessageSquare, FileText, Search, Sparkles, Building2, GraduationCap
} from 'lucide-react';

const NAV_LINKS = ['Features', 'For Candidates', 'For Employees', 'Pricing', 'Community'];

const STATS = [
  { value: '50K+', label: 'Active Referrers', icon: Users },
  { value: '10K+', label: 'Successful Placements', icon: Award },
  { value: '500+', label: 'Partner Companies', icon: Building2 },
  { value: '95%', label: 'Satisfaction Rate', icon: Star },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Resume Analysis',
    desc: 'Get deep insights on your resume with ATS scoring, skill gap analysis, and personalized improvement tips.',
    color: 'blue',
  },
  {
    icon: Target,
    title: 'Smart Referral Matching',
    desc: 'Our AI matches you with the perfect employee referrer based on skills, company fit, and JD alignment.',
    color: 'emerald',
  },
  {
    icon: MessageSquare,
    title: 'AI Mock Interviews',
    desc: 'Practice with realistic AI-driven technical and HR interviews with detailed performance analytics.',
    color: 'amber',
  },
  {
    icon: FileText,
    title: 'ATS Optimization',
    desc: 'Ensure your resume passes ATS systems with keyword optimization and formatting recommendations.',
    color: 'rose',
  },
  {
    icon: BarChart2,
    title: 'Referral Readiness Score',
    desc: 'Know exactly how ready you are for referrals with a composite score across 5 key dimensions.',
    color: 'cyan',
  },
  {
    icon: Shield,
    title: 'Verified Employee Network',
    desc: 'All employee referrers are verified via company email or LinkedIn to ensure authenticity.',
    color: 'violet',
  },
];

const FAQS = [
  {
    q: 'How does ReferAI verify employees?',
    a: 'We verify employees through their official company email addresses and LinkedIn profile authentication. Every referrer goes through a multi-step verification process before being listed.',
  },
  {
    q: 'How is the Referral Readiness Score calculated?',
    a: 'The score is a composite of 5 dimensions: Resume Quality (30%), ATS Score (25%), LinkedIn Completeness (20%), Assessment Performance (15%), and Mock Interview Score (10%).',
  },
  {
    q: 'Is the AI interview really free?',
    a: 'Yes! Free users get 3 AI mock interview sessions per month. Premium users get unlimited sessions with detailed report cards and personalized coaching.',
  },
  {
    q: 'Can I use ReferAI as an employee to refer friends?',
    a: 'Absolutely. Employees can post referral openings, browse candidate profiles, and track referral status in real-time. You also earn reward points for successful referrals.',
  },
  {
    q: 'What companies can I get referred to?',
    a: 'We have verified employee referrers at 500+ companies including Google, Microsoft, Amazon, Flipkart, Infosys, TCS, Razorpay, PhonePe, and many more.',
  },
];

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Razorpay', 'PhonePe', 'Swiggy', 'Zomato'];

const COLOR_MAP: Record<string, string> = {
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
};
const ICON_COLOR: Record<string, string> = {
  blue: 'text-blue-400', emerald: 'text-emerald-400', amber: 'text-amber-400',
  rose: 'text-rose-400', cyan: 'text-cyan-400', violet: 'text-violet-400',
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-lg font-bold">ReferAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 transition-colors">
              Sign in
            </Link>
            <Link to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all">
              Get Started Free
            </Link>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-t border-white/5 px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-slate-400 hover:text-white text-sm">
                {l}
              </a>
            ))}
            <Link to="/login" className="text-slate-300 text-sm">Sign in</Link>
            <Link to="/register" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl text-center">
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Referral Platform — Join 50,000+ professionals
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get Referred.{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Get Hired.
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified employees at top companies. Our AI scores your profile, optimizes your resume, and prepares you for interviews — all before your referral goes through.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 text-lg hover:shadow-xl hover:shadow-blue-500/20">
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/jobs"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 text-lg">
              <Search className="w-5 h-5" /> Browse Jobs
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex -space-x-2">
              {['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-slate-950`} />
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">10,000+</span> professionals placed this year
            </p>
          </div>
        </div>
      </section>

      {/* Company logos */}
      <section className="py-12 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-wider">Trusted by employees at</p>
          <div className="flex gap-8 overflow-x-auto scrollbar-hide justify-center flex-wrap">
            {COMPANIES.map(c => (
              <div key={c} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-slate-300 font-medium text-sm whitespace-nowrap">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/8 transition-all group">
                <Icon className="w-7 h-7 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-slate-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 text-emerald-300 text-sm mb-6">
              <Zap className="w-4 h-4" />
              Powered by AI
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need to get hired</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From resume optimization to mock interviews — ReferAI is the complete career acceleration platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className={`bg-gradient-to-br ${COLOR_MAP[color]} border rounded-2xl p-6 hover:scale-[1.02] transition-all group`}>
                <Icon className={`w-10 h-10 mb-4 ${ICON_COLOR[color]} group-hover:scale-110 transition-transform`} />
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="for-candidates" className="py-20 px-6 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works for candidates</h2>
            <p className="text-slate-400 text-lg">From sign-up to offer letter in 4 steps</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-blue-500/50 to-cyan-500/50" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { n: '01', title: 'Build Your Profile', desc: 'Complete your profile and upload your resume for AI analysis', icon: User },
                { n: '02', title: 'Get Your Score', desc: 'Receive your Referral Readiness Score across 5 dimensions', icon: TrendingUp },
                { n: '03', title: 'Find Referrers', desc: 'Browse verified employees at your target companies', icon: Users },
                { n: '04', title: 'Get Placed', desc: 'Track your referral from request to offer letter', icon: Award },
              ].map(({ n, title, desc, icon: Icon }) => (
                <div key={n} className="relative flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 z-10 hover:bg-blue-500/20 transition-all">
                    <Icon className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="text-blue-400 text-sm font-mono mb-2">{n}</div>
                  <h3 className="text-white font-bold mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Link to="/register?role=candidate"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all">
              Start as Candidate <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* For Employees */}
      <section id="for-employees" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 text-emerald-300 text-sm mb-6">
                <Users className="w-4 h-4" /> For Employees
              </div>
              <h2 className="text-4xl font-bold mb-4">Refer with confidence</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Every candidate is pre-screened with AI scoring. You only see candidates who are genuinely ready — saving you time and protecting your professional reputation.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'AI-screened candidates with readiness scores',
                  'Built-in messaging and request management',
                  'Track referral outcomes in real-time',
                  'Earn reward points for successful placements',
                  'Verified employee badge boosts your trust score',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register?role=employee"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Join as Employee <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/20 rounded-3xl p-8 space-y-4">
              {[
                { name: 'Priya S.', role: 'SDE-2 @ Google', referrals: 12, placed: 8 },
                { name: 'Rahul M.', role: 'PM @ Microsoft', referrals: 7, placed: 5 },
                { name: 'Ananya K.', role: 'Senior Engineer @ Amazon', referrals: 15, placed: 11 },
              ].map(({ name, role, referrals, placed }) => (
                <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                      {name[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{name}</div>
                      <div className="text-slate-400 text-xs">{role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{placed}/{referrals}</div>
                    <div className="text-slate-400 text-xs">Placed/Referred</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-lg">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free', price: '₹0', period: '/month',
                features: ['3 referral requests/month', 'Resume analysis', 'Basic ATS checker', '3 AI mock interviews', 'Job marketplace access'],
                cta: 'Get Started', highlight: false,
              },
              {
                name: 'Premium', price: '₹499', period: '/month',
                features: ['Unlimited referral requests', 'Advanced AI analysis', 'Full ATS optimization', 'Unlimited mock interviews', 'Priority matching', 'Interview coaching reports', 'LinkedIn optimization'],
                cta: 'Upgrade to Premium', highlight: true,
              },
              {
                name: 'Pro', price: '₹999', period: '/month',
                features: ['Everything in Premium', '1-on-1 career counseling', 'Dedicated referral manager', 'White-glove job search', 'Salary negotiation tips', 'Early access to openings'],
                cta: 'Go Pro', highlight: false,
              },
            ].map(({ name, price, period, features, cta, highlight }) => (
              <div key={name}
                className={`rounded-2xl p-8 ${highlight
                  ? 'bg-blue-600 border-2 border-blue-400 scale-105 shadow-2xl shadow-blue-500/20'
                  : 'bg-white/5 border border-white/10'}`}>
                {highlight && (
                  <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">MOST POPULAR</div>
                )}
                <div className="text-xl font-bold text-white mb-1">{name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{price}</span>
                  <span className={`text-sm ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>{period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${highlight ? 'text-blue-200' : 'text-emerald-400'}`} />
                      <span className={highlight ? 'text-blue-100' : 'text-slate-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center font-bold py-3 rounded-xl transition-all ${highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-medium pr-4">{q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-900/50 to-slate-900 border border-blue-500/20 rounded-3xl p-16">
          <Globe className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to accelerate your career?</h2>
          <p className="text-slate-400 text-lg mb-8">
            Join 50,000+ professionals who are using ReferAI to land their dream jobs.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl transition-all text-lg hover:shadow-xl hover:shadow-blue-500/20">
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">ReferAI</span>
              </div>
              <p className="text-slate-400 text-sm">AI-powered career acceleration for the modern professional.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms', 'Cookie Policy'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2025 ReferAI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 text-sm">Built for India's talent ecosystem</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
