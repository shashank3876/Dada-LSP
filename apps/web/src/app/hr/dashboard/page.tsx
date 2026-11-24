'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Zap,
  TrendingUp,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Calendar,
  Building2,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function HrDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/reports/hr');
        setStats(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-sm">Loading HR metrics...</div>;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">Corporate HR & Payroll Hub</h1>
          <p className="text-xs text-slate-500">
            Manage employee roster, attendance sync, lending policy caps, and payroll deduction reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hr/payroll/batches"
            className="px-4 py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow"
          >
            Generate Payroll Batch
          </Link>
          <Link
            href="/hr/employees/import"
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-all border border-slate-300"
          >
            Import Employees CSV
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Employees</span>
          <div className="text-3xl font-extrabold text-dada-950">{stats?.totalEmployees || 4}</div>
          <div className="text-xs text-emerald-600 font-semibold">{stats?.activeEmployees || 3} Active / Eligible</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Active EWA Advances</span>
          <div className="text-3xl font-extrabold text-dada-950">{stats?.activeEwaWithdrawalsCount || 1}</div>
          <div className="text-xs text-slate-500">Auto-deducted on 30 Nov</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Payroll Loans</span>
          <div className="text-3xl font-extrabold text-dada-950">{stats?.activePayrollLoansCount || 1}</div>
          <div className="text-xs text-slate-500">Multi-month EMI schedule</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Upcoming Deductions</span>
          <div className="text-3xl font-extrabold text-dada-950">{formatINR(stats?.totalActiveObligationsPaise || 12804000)}</div>
          <div className="text-xs text-amber-600 font-semibold">Cutoff: 25th of month</div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/hr/attendance" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">Attendance & Leave Audit</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review monthly approved days worked. Correct attendance with automated EWA remaining limit recalculation.
          </p>
        </Link>

        <Link href="/hr/payroll/batches" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-dada-900 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-dada-100 text-dada-800 flex items-center justify-center font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">Payroll Deduction Batches</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate employee-wise salary deduction batches and export formatted CSV ledgers for salary processing.
          </p>
        </Link>

        <Link href="/hr/payroll/reconciliation" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">Remittance Reconciliation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload employer remittance UTR transferred directly to NBFC escrow and resolve exception mismatches.
          </p>
        </Link>
      </div>
    </div>
  );
}
