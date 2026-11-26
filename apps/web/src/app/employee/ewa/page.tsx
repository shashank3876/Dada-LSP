'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, ArrowRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function EmployeeEwaOverviewPage() {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/eligibility/ewa');
        setEligibility(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Checking EWA limits...</div>;
  }

  const isEligible = eligibility?.isEligible;
  const availablePaise = eligibility?.availableEwaPaise || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Earned Wage Access (EWA)</h1>
        <p className="text-xs text-slate-500">
          Instant liquidity on your earned salary. Zero interest, statutory transparency, direct NBFC disbursement.
        </p>
      </div>

      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 rounded-2xl p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Available Withdrawal Limit</span>
            <div className="text-3xl md:text-4xl font-extrabold mt-1">{formatINR(availablePaise)}</div>
            <div className="text-xs text-emerald-200 mt-1">
              Computed from {eligibility?.approvedWorkedDays || 0} approved worked days this salary cycle.
            </div>
          </div>
          <div>
            {isEligible ? (
              <Link
                href="/employee/ewa/apply"
                className="px-6 py-3 bg-white text-emerald-950 hover:bg-emerald-50 font-extrabold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-emerald-700" />
                <span>Withdraw Wages Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="px-4 py-2 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-xl text-xs font-semibold">
                Withdrawals Unavailable
              </div>
            )}
          </div>
        </div>

        {!isEligible && eligibility?.ineligibilityReason && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{eligibility.ineligibilityReason}</span>
          </div>
        )}
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Gross Earned Wages</span>
          <div className="text-2xl font-extrabold text-dada-950">{formatINR(eligibility?.grossEarnedPaise || 0)}</div>
          <p className="text-[11px] text-slate-400">Accrued daily net earnings to date.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Withdrawals Used</span>
          <div className="text-2xl font-extrabold text-slate-800">
            {eligibility?.currentCycleWithdrawalsCount || 0} / {eligibility?.policy?.maxEwaWithdrawalsPerCycle || 2}
          </div>
          <p className="text-[11px] text-slate-400">Maximum 2 transactions per monthly cycle.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Pricing & Interest</span>
          <div className="text-2xl font-extrabold text-emerald-600">0% Interest</div>
          <p className="text-[11px] text-slate-400">₹99 fixed statutory servicing fee per withdrawal.</p>
        </div>
      </div>
    </div>
  );
}
