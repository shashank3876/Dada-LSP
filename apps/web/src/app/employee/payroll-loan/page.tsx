'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ShieldCheck, ArrowRight, Percent, Calendar, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function EmployeePayrollLoanOverviewPage() {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/eligibility/payroll-loan');
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
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Calculating loan eligibility...</div>;
  }

  const isEligible = eligibility?.isEligible;
  const maxLoanPaise = eligibility?.maxEligibleAmountPaise || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Corporate Payroll Personal Loans</h1>
        <p className="text-xs text-slate-500">
          Salary-linked term credit with reducing-balance EMI and automated payroll deduction.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-950 via-dada-900 to-indigo-950 rounded-2xl p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Sanctionable Loan Limit</span>
            <div className="text-3xl md:text-4xl font-extrabold mt-1">{formatINR(maxLoanPaise)}</div>
            <div className="text-xs text-blue-200 mt-1">
              Calculated at {eligibility?.policy?.salaryMultiplier || 3}x monthly net salary under corporate policy.
            </div>
          </div>
          <div>
            {isEligible ? (
              <Link
                href="/employee/payroll-loan/apply"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-dada-950 font-extrabold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Apply for Personal Loan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="px-4 py-2 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-xl text-xs font-semibold">
                Application Unavailable
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

      {/* Policy Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold">Annual Interest Rate</span>
          <div className="text-xl font-extrabold text-dada-950">
            {eligibility?.policy?.annualInterestRatePercent || 14.5}% p.a.
          </div>
          <p className="text-[10px] text-slate-400">Monthly reducing balance.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold">Provisional Tenures</span>
          <div className="text-xl font-extrabold text-slate-800">
            {eligibility?.eligibleTenures?.join(', ') || '6, 12, 18, 24'} Mo.
          </div>
          <p className="text-[10px] text-slate-400">Dynamic corporate policy tenures.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold">FOIR Limit</span>
          <div className="text-xl font-extrabold text-slate-800">
            {eligibility?.policy?.maxFoirPercent || 50}%
          </div>
          <p className="text-[10px] text-slate-400">Max salary debt obligation cap.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold">Processing Fee</span>
          <div className="text-xl font-extrabold text-slate-800">
            {eligibility?.policy?.processingFeePercent || 1.5}%
          </div>
          <p className="text-[10px] text-slate-400">Deducted at NBFC disbursement.</p>
        </div>
      </div>
    </div>
  );
}
