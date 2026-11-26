'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Clock,
  Landmark,
  BadgePercent,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Mail,
  Building2,
  Lock,
} from 'lucide-react';
import Calculator from '@/components/calculators/Calculator';

export default function EwaProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Product Hero */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>On-Demand Earned Wage Access • 0% Interest</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-dada-950 tracking-tight">
          Access Wages You Have Already Earned
        </h1>
        <p className="text-base text-slate-700 leading-relaxed">
          Break free from rigid 30-day salary cycles. Earned Wage Access (EWA) is not a loan — it is on-demand liquidity against work attendance already verified and completed by your employer. Eliminates high-interest payday loans, late utility penalties, and credit card debt traps.
        </p>

        {/* Snapshot Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-semibold">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Interest Rate</div>
            <div className="text-base font-extrabold text-emerald-700">0% Interest</div>
            <div className="text-[10px] text-slate-400">Zero Debt Facility</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Fee</div>
            <div className="text-base font-extrabold text-slate-900">₹99 Flat</div>
            <div className="text-[10px] text-slate-400">Per Transaction</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Credit Bureau</div>
            <div className="text-base font-extrabold text-slate-900">Zero Impact</div>
            <div className="text-[10px] text-slate-400">No CIBIL Pull</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Disbursal</div>
            <div className="text-base font-extrabold text-amber-700">Instant IMPS</div>
            <div className="text-[10px] text-slate-400">Under 60 Seconds</div>
          </div>
        </div>
      </div>

      {/* Interactive Calculator */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-dada-950">Calculate Your Eligible EWA Withdrawal</h2>
          <p className="text-xs text-slate-600 mt-1">
            Compute your daily accrued wages based on your approved attendance and salary.
          </p>
        </div>
        <Calculator />
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">Zero Balance Sheet Debt</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Withdrawals are capped at 50% of your already earned net wages for the active month. Employees cannot over-borrow beyond what their verified work days justify.
          </p>
        </div>
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <BadgePercent className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">100% Flat & Transparent Pricing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No compounding interest, no hidden handling charges. A single transparent nominal fee (₹99) covers banking network rails and platform verification.
          </p>
        </div>
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">Automated Payroll Recovery</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            On salary day, the corporate employer automatically settles the advance amount from monthly payroll and remits it directly to the NBFC escrow.
          </p>
        </div>
      </div>

      {/* Support Strip */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-slate-900">Questions about daily wage calculations or corporate policy limits?</div>
          <div className="text-slate-600">
            Email Support:{' '}
            <a href="mailto:support@dadaadvisoryservices.com" className="font-semibold text-emerald-700 hover:underline">
              support@dadaadvisoryservices.com
            </a>{' '}
            • Corporate Partnerships:{' '}
            <a href="mailto:connect@dadaadvisoryservices.com" className="font-semibold text-amber-700 hover:underline">
              connect@dadaadvisoryservices.com
            </a>
          </div>
        </div>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl shrink-0 shadow-sm flex items-center gap-2"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Access EWA Portal</span>
        </Link>
      </div>
    </div>
  );
}
