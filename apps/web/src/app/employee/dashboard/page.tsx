'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [ewaEligibility, setEwaEligibility] = useState<any>(null);
  const [plEligibility, setPlEligibility] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [me, ewa, pl, apps] = await Promise.all([
          apiRequest('/auth/me').catch(() => null),
          apiRequest('/eligibility/ewa').catch(() => null),
          apiRequest('/eligibility/payroll-loan').catch(() => null),
          apiRequest('/loan-applications').catch(() => []),
        ]);
        setProfile(me);
        setEwaEligibility(ewa);
        setPlEligibility(pl);
        setApplications(apps || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome & Employer Header */}
      <div className="bg-gradient-to-r from-dada-950 via-dada-900 to-dada-800 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Verified Corporate Borrower
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.fullName || 'Rajesh Kumar'}
          </h1>
          <p className="text-xs text-slate-300">
            Employer: <span className="font-semibold text-white">TechCorp Solutions India Pvt Ltd</span> • Employee Code: <span className="font-semibold text-white">{profile?.employee?.employeeCode || 'TC-1001'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/employee/ewa/apply"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-dada-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow"
          >
            <Zap className="w-4 h-4" />
            <span>Withdraw EWA</span>
          </Link>
          <Link
            href="/employee/payroll-loan/apply"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-all border border-white/20 flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Apply Payroll Loan</span>
          </Link>
        </div>
      </div>

      {/* Notice Period Warning Alert if applicable */}
      {profile?.employee?.employmentStatus === 'NOTICE_PERIOD' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Notice Period Policy Notice: </span>
            Employees currently serving notice period are not eligible for new EWA withdrawals or corporate loans in accordance with corporate risk guidelines.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* EWA Available Limit Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available EWA Advance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-dada-950">
              {formatINR(ewaEligibility?.availableEwaPaise || 0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              50% cap of {ewaEligibility?.attendance?.totalApprovedWorkedDays || 18} approved days worked
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Gross Earned: {formatINR(ewaEligibility?.grossEarnedWagePaise || 0)}</span>
            <Link href="/employee/ewa/apply" className="font-bold text-emerald-600 hover:text-emerald-700">
              Withdraw →
            </Link>
          </div>
        </div>

        {/* Payroll Loan Eligibility Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Payroll Loan Limit
            </span>
            <div className="w-8 h-8 rounded-lg bg-dada-100 text-dada-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-dada-700" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-dada-950">
              {formatINR(plEligibility?.maxLoanAmountPaise || 22500000)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Up to 3x Net Salary • From 14.5% p.a.
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Max FOIR: 50%</span>
            <Link href="/employee/payroll-loan/apply" className="font-bold text-dada-700 hover:text-dada-900">
              Calculate EMI →
            </Link>
          </div>
        </div>

        {/* Upcoming Repayment Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Upcoming Payroll Deduction
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-dada-950">
              {formatINR(2000000)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Due on salary day: 30 Nov 2026
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Auto-deducted by HR</span>
            <Link href="/employee/repayments" className="font-bold text-slate-700 hover:text-slate-900">
              View Schedule →
            </Link>
          </div>
        </div>
      </div>

      {/* Applications Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-dada-950">Recent Applications</h3>
            <p className="text-xs text-slate-500">Real-time status tracking with partner NBFC underwriter.</p>
          </div>
          <Link
            href="/employee/applications"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {applications.length > 0 ? (
            applications.map((app) => (
              <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-dada-950">{app.applicationNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {app.productType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Requested: <span className="font-semibold text-slate-800">{formatINR(app.requestedAmountPaise)}</span> • Partner NBFC: Apex Capital Finance
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      app.status === 'DISBURSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'APPROVED'
                        ? 'bg-blue-100 text-blue-800'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  <Link
                    href="/employee/applications"
                    className="text-xs font-semibold text-slate-600 hover:text-dada-900 border border-slate-200 px-3 py-1.5 rounded-lg"
                  >
                    View Stepper
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">No applications submitted yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
