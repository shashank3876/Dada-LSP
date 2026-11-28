'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, UserCheck, Shield, KeyRound, AlertCircle, Building2, UserPlus, LogIn } from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('DadaDemo@2026');

  // Employee Registration states
  const [regStep, setRegStep] = useState<'IDENTIFY' | 'VERIFY_OTP'>('IDENTIFY');
  const [regOrgCode, setRegOrgCode] = useState('TECHCORP');
  const [regEmpCode, setRegEmpCode] = useState('TC-1002');
  const [regEmail, setRegEmail] = useState('priya.s@techcorp.in');
  const [regOtp, setRegOtp] = useState('');
  const [regPassword, setRegPassword] = useState('DadaDemo@2026');
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    setSuccessMsg(null);

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

  const handleInitiateRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiRequest('/auth/initiate-registration', {
        method: 'POST',
        body: JSON.stringify({
          organizationCode: regOrgCode,
          employeeCode: regEmpCode,
          officialEmail: regEmail,
        }),
      });
      setRegStep('VERIFY_OTP');
      if (res.maskedPhone) setMaskedPhone(res.maskedPhone);
      if (res.maskedEmail) setMaskedEmail(res.maskedEmail);
      setResendCooldown(60);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Verification initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiRequest('/auth/register-employee', {
        method: 'POST',
        body: JSON.stringify({
          organizationCode: regOrgCode,
          employeeCode: regEmpCode,
          officialEmail: regEmail,
          otp: regOtp,
          password: regPassword,
        }),
      });

      setAuthToken(res.accessToken);
      localStorage.setItem('dada_user_profile', JSON.stringify(res.user));
      setSuccessMsg('OTP verified and account activated! Redirecting to employee portal...');
      setTimeout(() => {
        router.push('/employee/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: (typeof demoAccounts)[0]) => {
    setEmail(account.email);
    setPassword('DadaDemo@2026');
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

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
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-lg mx-auto bg-amber-50">
            <Image
              src="/logo-square.png"
              alt="Dada Advisory Services LLP Logo"
              width={64}
              height={64}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <h2 className="text-2xl font-extrabold text-dada-950 tracking-tight">
            Portal Authentication
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Dada Bridge • A Unit of Dada Advisory Services LLP (LSP)
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register Employee */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'LOGIN' ? 'bg-white text-dada-950 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('REGISTER');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'REGISTER' ? 'bg-white text-dada-950 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Employee Registration</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {authMode === 'LOGIN' ? (
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
        ) : regStep === 'IDENTIFY' ? (
          <form onSubmit={handleInitiateRegistration} className="space-y-3">
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
              <div className="font-bold flex items-center justify-between">
                <span>Step 1: Corporate Identity Verification</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Dual OTP</span>
              </div>
              <div className="text-[11px] text-blue-700 mt-1">
                Enter your employer and employee details. We will dispatch a 6-digit verification code to both your registered corporate email and mobile number.
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Organization Code
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regOrgCode}
                  onChange={(e) => setRegOrgCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TECHCORP"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Employee ID
              </label>
              <input
                type="text"
                required
                value={regEmpCode}
                onChange={(e) => setRegEmpCode(e.target.value.toUpperCase())}
                placeholder="e.g. TC-1002"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. priya.s@techcorp.in"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span>Verifying Roster & Sending OTP...</span> : <span>Send Verification Code</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyRegistration} className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
              <div className="font-bold flex items-center justify-between">
                <span>Step 2: Enter Verification OTP & Password</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Dual Delivery</span>
              </div>
              <div className="text-[11px] text-emerald-800">
                Verification code dispatched to:
                {maskedPhone && <div className="font-semibold text-emerald-900">📱 SMS: {maskedPhone}</div>}
                {maskedEmail && <div className="font-semibold text-emerald-900">✉️ Email: {maskedEmail}</div>}
                {!maskedPhone && !maskedEmail && <div className="font-semibold text-emerald-900">Your registered mobile & email</div>}
              </div>
              <div className="pt-1.5 text-[11px] text-emerald-700 border-t border-emerald-200/60">
                Staging fallback: You can also use demo code <strong className="text-emerald-950 font-mono font-bold bg-emerald-200/70 px-1 py-0.5 rounded">123456</strong>.
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                6-Digit Corporate OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={regOtp}
                onChange={(e) => setRegOtp(e.target.value)}
                placeholder="Enter 6-digit code or 123456"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Create Account Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span>Activating Account...</span> : <span>Verify OTP & Complete Registration</span>}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setRegStep('IDENTIFY')}
                className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold"
              >
                ← Change details
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleInitiateRegistration()}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* 1-Click Interactive Demo Role Switcher */}
        <div className="border-t border-slate-200 pt-5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>1-Click Test Personas</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col justify-between"
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

        {/* Support Helpdesk Notice */}
        <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500 space-y-1">
          <div>Dada Bridge (Dada Advisory Services LLP) • Digital Loan Service Provider</div>
          <div>
            Need help? Contact Employee Helpdesk:{' '}
            <a
              href="mailto:support@dadaadvisoryservices.com"
              className="font-semibold text-emerald-700 hover:underline"
            >
              support@dadaadvisoryservices.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
