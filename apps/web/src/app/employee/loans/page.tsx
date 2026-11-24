'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function LoansPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/auth/me');
        setProfile(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-sm">Loading loans...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Active Loans & Credit Facilities</h1>
        <p className="text-xs text-slate-500">
          Overview of your active Earned Wage Access withdrawals and Corporate Payroll personal loans.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-dada-950">LN-EWA-2026-0001</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Product: Earned Wage Access (EWA) • Sanctioned by: Apex Capital Finance Ltd
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-dada-950">{formatINR(2000000)}</div>
            <div className="text-xs text-slate-500">Principal Disbursed</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500">Disbursement UTR:</span>
            <div className="font-mono font-bold text-slate-800">CMS9876543210</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500">Interest Rate:</span>
            <div className="font-bold text-emerald-600">0% Interest</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500">Next Repayment Due:</span>
            <div className="font-bold text-slate-800">30 Nov 2026</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500">Deduction Method:</span>
            <div className="font-bold text-slate-800">Payroll Deduction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
