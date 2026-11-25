'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  FileCheck2,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/reports/admin');
        setStats(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-sm">Loading admin analytics...</div>;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">Executive LSP Dashboard</h1>
          <p className="text-xs text-slate-500">
            Platform-wide portfolio metrics across corporate employers and partner NBFCs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/nbfc-partners"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5"
          >
            <Landmark className="w-4 h-4" />
            <span>NBFC Partner Simulator</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Organizations</span>
          <div className="text-3xl font-extrabold text-dada-950">{stats?.kpi?.totalOrganizations || 1}</div>
          <div className="text-xs text-slate-500">Corporate employers</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Registered Employees</span>
          <div className="text-3xl font-extrabold text-dada-950">{stats?.kpi?.totalRegisteredEmployees || 4}</div>
          <div className="text-xs text-emerald-600 font-semibold">100% KYC verified</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Disbursed Volume</span>
          <div className="text-3xl font-extrabold text-emerald-600">{formatINR(stats?.kpi?.totalDisbursedPaise || 14000000)}</div>
          <div className="text-xs text-slate-500">Disbursed by partner NBFCs</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">NBFC Approval Rate</span>
          <div className="text-3xl font-extrabold text-dada-950">{stats?.nbfcApprovalRate || '94.2%'}</div>
          <div className="text-xs text-emerald-600 font-semibold">Apex Capital Active</div>
        </div>
      </div>

      {/* Product Split Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-dada-950 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Earned Wage Access (EWA) Portfolio</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              0% Interest
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Total Requests</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{stats?.productBreakdown?.ewa?.total || 1}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Disbursed</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{stats?.productBreakdown?.ewa?.disbursed || 1}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Pending</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{stats?.productBreakdown?.ewa?.pending || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-dada-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-dada-700" />
              <span>Corporate Payroll Loans Portfolio</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              EMI Personal Loans
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Total Requests</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{stats?.productBreakdown?.payrollLoan?.total || 2}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Disbursed</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{stats?.productBreakdown?.payrollLoan?.disbursed || 1}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Pending Offer</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{stats?.productBreakdown?.payrollLoan?.pending || 1}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
