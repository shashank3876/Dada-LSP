'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { calculatePayrollLoanEmi } from '@dada/contracts';
import { formatINR } from '@/lib/utils';

export default function PayrollLoanApplyPage() {
  const router = useRouter();
  const [eligibility, setEligibility] = useState<any>(null);
  const [loanAmount, setLoanAmount] = useState(150000);
  const [tenure, setTenure] = useState(18);
  const [purpose, setPurpose] = useState('Home Renovation & Appliances');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest('/eligibility/payroll-loan');
        setEligibility(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const emiDetails = calculatePayrollLoanEmi({
    principalPaise: loanAmount * 100,
    annualInterestRatePercent: eligibility?.policy?.annualInterestRatePercent || 14.5,
    tenureMonths: tenure,
    processingFeePercent: eligibility?.policy?.processingFeePercent || 1.5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiRequest('/payroll-loans/apply', {
        method: 'POST',
        body: JSON.stringify({
          requestedAmountPaise: loanAmount * 100,
          tenureMonths: tenure,
          purpose,
        }),
      });
      router.push('/employee/applications');
    } catch (err: any) {
      setError(err.message || 'Loan submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-sm">Checking loan eligibility...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Apply for Corporate Payroll Loan</h1>
        <p className="text-xs text-slate-500">
          Salary-linked personal loan with reducing balance EMI and automated payroll deduction.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Loan Amount Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Loan Principal Amount</span>
            <span className="text-2xl font-extrabold text-dada-950">{formatINR(loanAmount * 100)}</span>
          </div>
          <input
            type="range"
            min="25000"
            max={eligibility?.maxLoanAmountPaise ? eligibility.maxLoanAmountPaise / 100 : 300000}
            step="5000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Min: ₹25,000</span>
            <span>Max Sanction Limit: {formatINR(eligibility?.maxLoanAmountPaise || 22500000)}</span>
          </div>
        </div>

        {/* Tenure Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Repayment Tenure (Months)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[6, 12, 18, 24].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTenure(t)}
                className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                  tenure === t
                    ? 'bg-dada-900 text-white border-dada-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                {t} Months
              </button>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Loan Purpose
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Home Renovation & Appliances">Home Renovation & Appliances</option>
            <option value="Medical & Family Health">Medical & Family Health</option>
            <option value="Education & Higher Studies">Education & Higher Studies</option>
            <option value="Debt Consolidation">Debt Consolidation</option>
            <option value="Personal / Travel">Personal / Travel</option>
          </select>
        </div>

        {/* Real-time EMI Breakdown */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between font-bold text-sm text-dada-950">
            <span>Estimated Monthly EMI:</span>
            <span className="text-emerald-600 text-base">{formatINR(emiDetails.monthlyEmiPaise)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Annual Interest Rate:</span>
            <span className="font-semibold">{eligibility?.policy?.annualInterestRatePercent || 14.5}% p.a. (reducing)</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Interest Payable:</span>
            <span className="font-semibold">{formatINR(emiDetails.totalInterestPaise)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Repayment Amount:</span>
            <span className="font-semibold">{formatINR(emiDetails.totalRepaymentPaise)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Processing Fee (1.5%):</span>
            <span className="font-semibold">{formatINR(emiDetails.processingFeePaise)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <span>Forwarding to NBFC...</span> : <span>Submit Loan Application</span>}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
