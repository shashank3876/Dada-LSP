import React from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, Zap, TrendingUp } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-dada-950 tracking-tight">
          Workplace Financial Products
        </h1>
        <p className="text-base text-slate-600">
          Compare our two flagship products: Earned Wage Access for mid-month liquidity vs. Corporate Advance Salary for planned goals.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="py-3 sm:py-4 px-4 sm:px-6 font-bold w-1/3">Feature</th>
              <th className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-emerald-700 w-1/3">Earned Wage Access (EWA)</th>
              <th className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-dada-700 w-1/3">Corporate Payroll Loan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Purpose</td>
              <td className="py-4 px-6">Emergency mid-month cash needs</td>
              <td className="py-4 px-6">Planned expenditures, medical, renovation</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Credit Limit Basis</td>
              <td className="py-4 px-6">Up to 50% of wages already earned</td>
              <td className="py-4 px-6">Up to 3x Net Monthly Salary</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Repayment Period</td>
              <td className="py-4 px-6">Next Salary Cycle (Bullet)</td>
              <td className="py-4 px-6">6 to 36 Monthly EMIs</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Interest Rate</td>
              <td className="py-4 px-6 font-semibold text-emerald-600">0% Interest</td>
              <td className="py-4 px-6 font-semibold text-dada-900">From 11.5% p.a. (reducing)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Fee Structure</td>
              <td className="py-4 px-6">Flat nominal fee (₹99 per withdrawal)</td>
              <td className="py-4 px-6">1.5% processing fee (subject to KFS)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Impact on Credit Bureau</td>
              <td className="py-4 px-6">Zero debt reporting (Not a loan)</td>
              <td className="py-4 px-6">Standard personal loan bureau reporting</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Deduction Method</td>
              <td className="py-4 px-6">Automated Payroll deduction</td>
              <td className="py-4 px-6">Payroll deduction / e-NACH auto-debit</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-900">Disbursement Entity</td>
              <td className="py-4 px-6">Partner NBFC direct to salary account</td>
              <td className="py-4 px-6">Partner NBFC direct to salary account</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <Zap className="w-5 h-5" />
            <span>Need Earned Wage Access?</span>
          </div>
          <p className="text-xs text-slate-600">
            Learn more about how your organization can enable daily earned wage liquidity for employees.
          </p>
          <Link
            href="/products/earned-wage-access"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Explore EWA Deep-Dive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-dada-700 font-bold">
            <TrendingUp className="w-5 h-5" />
            <span>Need Corporate Payroll Loans?</span>
          </div>
          <p className="text-xs text-slate-600">
            Check eligibility criteria and reducing balance EMI options for multi-month personal loans.
          </p>
          <Link
            href="/products/payroll-loan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-dada-700 hover:text-dada-900"
          >
            <span>Explore Payroll Loans Deep-Dive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
