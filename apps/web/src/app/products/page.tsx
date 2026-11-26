'use client';

import React from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, Zap, TrendingUp, ShieldCheck, Mail, Building2, Lock } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Product Comparison & Regulatory Disclosures</span>
        </div>
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          Workplace Financial Credit Solutions
        </h1>
        <p className="text-base text-slate-600">
          Compare our two flagship products: Earned Wage Access for mid-month liquidity vs. Corporate Personal Loans for planned milestones.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white border-b border-slate-800">
            <tr>
              <th className="py-4 px-6 font-bold w-1/3">Feature / Parameter</th>
              <th className="py-4 px-6 font-bold text-amber-400 w-1/3">Corporate Personal Loan</th>
              <th className="py-4 px-6 font-bold text-emerald-400 w-1/3">Earned Wage Access (EWA)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Primary Purpose</td>
              <td className="py-4 px-6">Planned expenditures, medical, renovation, education</td>
              <td className="py-4 px-6">Emergency mid-month liquidity, utility bills</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Credit Limit Basis</td>
              <td className="py-4 px-6">Up to 3x Net Monthly Salary (₹25k - ₹5L)</td>
              <td className="py-4 px-6">Up to 50% of wages already earned (₹1k - ₹50k)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Repayment Period</td>
              <td className="py-4 px-6">6, 12, 18, 24 to 36 Monthly EMIs</td>
              <td className="py-4 px-6">Next Salary Cycle (Bullet recovery)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Interest Rate Structure</td>
              <td className="py-4 px-6 font-bold text-amber-700">11.5% to 24% p.a. (Reducing Balance)</td>
              <td className="py-4 px-6 font-bold text-emerald-700">0% Interest (Zero debt facility)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Fee Structure</td>
              <td className="py-4 px-6">1.5% - 2.0% processing fee (in KFS)</td>
              <td className="py-4 px-6">Flat nominal fee (₹99 per withdrawal)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Credit Bureau Impact</td>
              <td className="py-4 px-6">Standard bureau reporting (builds CIBIL)</td>
              <td className="py-4 px-6">Zero debt reporting (Not a loan)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Repayment Method</td>
              <td className="py-4 px-6">Automated Payroll deduction + backup e-NACH</td>
              <td className="py-4 px-6">Automated Corporate Payroll deduction</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-900">Disbursing Entity</td>
              <td className="py-4 px-6">Partner NBFC direct from escrow to salary account</td>
              <td className="py-4 px-6">Partner NBFC direct from escrow to salary account</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deep-Dive Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-lg">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span>Corporate Personal Loans</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Detailed breakdown of reducing balance interest rates, EMI calculators, document requirements, and foreclosure policies.
          </p>
          <Link
            href="/products/payroll-loan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            <span>Explore Personal Loans Deep-Dive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
            <Zap className="w-5 h-5 text-emerald-600" />
            <span>Earned Wage Access (EWA)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Learn how your company can unlock on-demand salary access for verified work days with 0% interest and flat pricing.
          </p>
          <Link
            href="/products/earned-wage-access"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Explore EWA Deep-Dive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Direct Inquiries & Contact */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-slate-900">Have specific requirements for your workforce or NBFC portfolio?</div>
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
          <span>Portal Access</span>
        </Link>
      </div>
    </div>
  );
}
