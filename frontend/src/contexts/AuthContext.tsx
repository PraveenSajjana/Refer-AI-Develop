import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../lib/api';

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  is_verified: boolean;
  points: number;
  plan: string;
  created_at: string;
}

interface AuthContextType {
  session: { user: AppUser } | null;
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: AppUser } | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getCurrentUser()
        .then(userData => {
          setUser(userData);
          setSession({ user: userData });
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setSession(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      setSession({ user: res.user });
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  }

  async function signUp(email: string, password: string, fullName: string, role: string) {
    try {
      const res = await authApi.register(email, password, fullName, role);
      setUser(res.user);
      setSession({ user: res.user });
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  }

  async function signOut() {
    authApi.logout();
    setUser(null);
    setSession(null);
  }

  async function refreshUser() {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch {
      // Ignore errors when refreshing
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
