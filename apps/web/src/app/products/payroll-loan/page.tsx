'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
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

export default function PayrollLoanProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Product Hero */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>Salary-Linked Personal Loan • RBI DLG Compliant</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-dada-950 tracking-tight">
          Corporate Payroll Personal Loans up to ₹5,00,000
        </h1>
        <p className="text-base text-slate-700 leading-relaxed">
          Affordable, multi-month personal credit tailored for salaried professionals. Underwritten and disbursed directly by RBI-registered partner NBFCs (Apex Capital, DMI Finance) with transparent reducing-balance interest rates starting at <strong>11.5% p.a.</strong> and zero hidden charges.
        </p>

        {/* Snapshot Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-semibold">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Interest Rate</div>
            <div className="text-base font-extrabold text-amber-700">11.5% - 24%</div>
            <div className="text-[10px] text-slate-400">Reducing p.a.</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Tenure</div>
            <div className="text-base font-extrabold text-slate-900">6 to 36 Mos</div>
            <div className="text-[10px] text-slate-400">Flexible EMI</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Processing Fee</div>
            <div className="text-base font-extrabold text-slate-900">1.5% - 2%</div>
            <div className="text-[10px] text-slate-400">Upfront in KFS</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] text-slate-500 uppercase">Foreclosure</div>
            <div className="text-base font-extrabold text-emerald-700">0% Penalty</div>
            <div className="text-[10px] text-slate-400">After 6 EMIs</div>
          </div>
        </div>
      </div>

      {/* Interactive EMI Calculator */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-dada-950">Calculate Your Monthly Loan EMI</h2>
          <p className="text-xs text-slate-600 mt-1">
            Simulate your monthly installment, total interest payable, and repayment schedule in real time.
          </p>
        </div>
        <Calculator />
      </div>

      {/* Product Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <BadgePercent className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">Higher Sanction Limits</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Borrow up to 3x your net monthly salary (up to ₹5,00,000) based on verified employer confirmation, payroll consistency, and credit score.
          </p>
        </div>
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">True Reducing Balance Interest</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Interest is computed solely on the diminishing principal outstanding balance, ensuring you pay significantly less interest over the tenure compared to flat-rate loans.
          </p>
        </div>
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-dada-950">Automated Payroll Recovery</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Monthly EMIs are deducted directly from salary payroll on salary day and remitted to the NBFC, preventing missed due dates, late fees, and credit bureau penalties.
          </p>
        </div>
      </div>

      {/* Fees & Charges Table (Mandatory for DMI Finance & L&T Finance style transparency) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-dada-950">Fees, Charges & APR Disclosure</h3>
          <p className="text-xs text-slate-600">
            In compliance with Reserve Bank of India Digital Lending Directions, all applicable charges are fully disclosed upfront in the Key Fact Statement (KFS).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">Fee / Parameter</th>
                <th className="py-3 px-4">Applicable Rate / Amount</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Annual Percentage Rate (APR)</td>
                <td className="py-3 px-4 font-bold text-amber-700">12% to 26% p.a.</td>
                <td className="py-3 px-4">Includes annualized interest rate, processing fee, and statutory charges.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Loan Processing Fee</td>
                <td className="py-3 px-4 font-bold text-slate-900">1.5% to 2.0% of Loan Amount + GST</td>
                <td className="py-3 px-4">Deducted from loan sanction amount prior to escrow disbursement.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Prepayment / Foreclosure Fee</td>
                <td className="py-3 px-4 font-bold text-emerald-700">NIL (Zero Charges)</td>
                <td className="py-3 px-4">Permitted after completing 6 scheduled monthly EMI payments.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Late Payment Fee / Overdue Interest</td>
                <td className="py-3 px-4 font-bold text-slate-900">2% per month on overdue EMI</td>
                <td className="py-3 px-4">Penal interest charged only on defaulted amount, strictly non-compounded.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Cooling-Off / Look-up Period</td>
                <td className="py-3 px-4 font-bold text-slate-900">3 Business Days</td>
                <td className="py-3 px-4">Borrower may exit loan agreement without penalty by refunding principal.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Support & Grievance Contact */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-slate-900">Questions about loan sanctioning, KFS, or EMI schedules?</div>
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
          <span>Apply in Portal</span>
        </Link>
      </div>
    </div>
  );
}
