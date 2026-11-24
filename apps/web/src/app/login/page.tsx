'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, UserCheck, Shield, KeyRound, AlertCircle } from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('DadaDemo@2026');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo accounts for instant 1-click test login
  const demoAccounts = [
    {
      role: 'DADA_ADMIN',
      label: 'Dada Admin',
      email: 'admin@dadaadvisory.com',
      badge: 'Admin Console',
      badgeColor: 'bg-purple-100 text-purple-800',
      dest: '/admin/dashboard',
    },
    {
      role: 'HR_ADMIN',
      label: 'Rohini Sen (HR Head)',
      email: 'hr.admin@techcorp.in',
      badge: 'HR Portal',
      badgeColor: 'bg-blue-100 text-blue-800',
      dest: '/hr/dashboard',
    },
    {
      role: 'EMPLOYEE',
      label: 'Rajesh Kumar (Active EWA)',
      email: 'rajesh.k@techcorp.in',
      badge: 'Lead Eng',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      dest: '/employee/dashboard',
    },
    {
      role: 'EMPLOYEE',
      label: 'Priya Sharma (Pending PL)',
      email: 'priya.s@techcorp.in',
      badge: 'Product Lead',
      badgeColor: 'bg-amber-100 text-amber-800',
      dest: '/employee/dashboard',
    },
    {
      role: 'EMPLOYEE',
      label: 'Amit Verma (Notice Period)',
      email: 'amit.v@techcorp.in',
      badge: 'Ineligible Demo',
      badgeColor: 'bg-rose-100 text-rose-800',
      dest: '/employee/dashboard',
    },
    {
      role: 'EMPLOYEE',
      label: 'Sunita Mehra (Active Loan)',
      email: 'sunita.m@techcorp.in',
      badge: 'UX Designer',
      badgeColor: 'bg-slate-100 text-slate-800',
      dest: '/employee/dashboard',
    },
  ];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuthToken(res.accessToken);
      localStorage.setItem('dada_user_profile', JSON.stringify(res.user));

      // Role-based redirect
      if (res.user.role.startsWith('DADA_')) {
        router.push('/admin/dashboard');
      } else if (res.user.role.startsWith('HR_')) {
        router.push('/hr/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: (typeof demoAccounts)[0]) => {
    setEmail(account.email);
    setPassword('DadaDemo@2026');
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: account.email, password: 'DadaDemo@2026' }),
      });

      setAuthToken(res.accessToken);
      localStorage.setItem('dada_user_profile', JSON.stringify(res.user));
      router.push(account.dest);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-dada-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-dada-950 tracking-tight">
            Portal Authentication
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to your Employee, Corporate HR, or Dada Admin workspace.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Signing In...</span> : <span>Sign In to Portal</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Interactive Demo Role Switcher */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>1-Click Demo Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col justify-between"
              >
                <div className="font-semibold text-slate-800 text-[11px] truncate">{acc.label}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${acc.badgeColor}`}>
                    {acc.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">Login →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
