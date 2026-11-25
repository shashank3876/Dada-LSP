import React from 'react';
import Link from 'next/link';
import { Zap, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import Calculator from '@/components/calculators/Calculator';

export default function EwaProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>On-Demand Earned Wage Access</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-dada-950 tracking-tight">
          Access Wages You Have Already Earned
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Break free from 30-day salary cycles. EWA is not a loan — it is simply early access to your earned income, eliminating predatory payday loans and credit card rollovers.
        </p>
      </div>

      <Calculator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-dada-950">Zero Debt Burden</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Because withdrawals are capped at 50% of your already earned wages, employees never borrow beyond what their approved attendance justifies.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-dada-950">Transparent Flat Pricing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No compound interest, no daily interest penalties. A flat convenience fee (₹99) per transaction covers the technology and payment gateway cost.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-dada-950">Seamless Salary Reconciliation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            On salary day, the employer automatically deducts the advance and remits it directly to the NBFC. No manual repayments required.
          </p>
        </div>
      </div>
    </div>
  );
}
