import React from 'react';
import { Router, Routes, Route, Navigate } from './lib/router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';
import ReferralsPage from './pages/ReferralsPage';
import InterviewPage from './pages/InterviewPage';
import AssessmentsPage from './pages/AssessmentsPage';
import JobsPage from './pages/JobsPage';
import InternshipsPage from './pages/InternshipsPage';
import CommunityPage from './pages/CommunityPage';
import BadgesPage from './pages/BadgesPage';
import SettingsPage from './pages/SettingsPage';
import TalentSearchPage from './pages/TalentSearchPage';
import PostJobPage from './pages/PostJobPage';
import AnalyticsPage from './pages/AnalyticsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-slate-400 text-sm animate-pulse">Loading ReferAI...</div>
        </div>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><DashboardLayout><ResumePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/referrals" element={<ProtectedRoute><DashboardLayout><ReferralsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><DashboardLayout><InterviewPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/assessments" element={<ProtectedRoute><DashboardLayout><AssessmentsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><DashboardLayout><JobsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/internships" element={<ProtectedRoute><DashboardLayout><InternshipsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><DashboardLayout><CommunityPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/badges" element={<ProtectedRoute><DashboardLayout><BadgesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/talent" element={<ProtectedRoute><DashboardLayout><TalentSearchPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/post-job" element={<ProtectedRoute><DashboardLayout><PostJobPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
