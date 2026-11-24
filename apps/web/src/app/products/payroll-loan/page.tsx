import React from 'react';
import Link from 'next/link';
import { TrendingUp, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import Calculator from '@/components/calculators/Calculator';

export default function PayrollLoanProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dada-100 text-dada-900 text-xs font-semibold">
          <TrendingUp className="w-4 h-4 text-dada-700" />
          <span>Salary-Linked Personal Loan</span>
        </div>
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          Corporate Payroll Personal Loans
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          High-ticket, multi-month personal credit linked directly to employment stability. Sanctioned by partner NBFCs with transparent reducing-balance interest rates and zero collateral.
        </p>
      </div>

      <Calculator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-dada-950">Higher Sanction Multipliers</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Up to 3x monthly net salary sanctioned based on employer confirmation, employment tenure, and bureau score.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-dada-950">Reducing-Balance EMI</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Interest is computed only on the outstanding principal balance. Tenures range from 6 to 36 months to fit your monthly cash flow.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-dada-950">Direct Salary Deduction</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Monthly installments are integrated into the corporate payroll schedule, minimizing defaults and ensuring smooth credit score building.
          </p>
        </div>
      </div>
    </div>
  );
}
