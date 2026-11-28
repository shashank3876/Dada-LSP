'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function EwaApplyPage() {
  const router = useRouter();
  const [eligibility, setEligibility] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(15000);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEligibility() {
      try {
        const res = await apiRequest('/eligibility/ewa');
        setEligibility(res);
        if (res.availableEwaPaise > 0) {
          setWithdrawAmount(Math.min(res.availableEwaPaise / 100, 20000));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadEligibility();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiRequest('/ewa/apply', {
        method: 'POST',
        body: JSON.stringify({
          requestedAmountPaise: withdrawAmount * 100,
        }),
      });
      router.push('/employee/applications');
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-sm">Checking EWA eligibility...</div>;

  const maxPaise = eligibility?.availableEwaPaise || 0;
  const maxRupees = maxPaise / 100;
  const feeRupees = 99;
  const netPayout = Math.max(0, withdrawAmount - feeRupees);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Withdraw Earned Wages (EWA)</h1>
        <p className="text-xs text-slate-500">
          Access your wages already earned for approved days worked this month. Disbursed directly by partner NBFC.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {!eligibility?.isEligible ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-dada-950">EWA Withdrawal Unavailable</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {eligibility?.ineligibilityReason || 'You are currently not eligible for new EWA withdrawals.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleWithdraw} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Withdrawal Amount</span>
              <span className="text-2xl font-extrabold text-dada-950">{formatINR(withdrawAmount * 100)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max={maxRupees}
              step="500"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Min: ₹1,000</span>
              <span>Max Cap Available: {formatINR(maxPaise)}</span>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Advance Amount:</span>
              <span className="font-semibold">{formatINR(withdrawAmount * 100)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Technology Fee:</span>
              <span className="font-semibold text-emerald-600">Flat ₹99</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-dada-950 text-sm">
              <span>Net Disbursement to Salary Account:</span>
              <span className="text-emerald-600">{formatINR(netPayout * 100)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px] pt-1">
              <span>Repayment Date:</span>
              <span>Next Salary Day (30 Nov 2026 via Payroll Deduction)</span>
            </div>
          </div>

          {/* Statutory LSP Notice */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Compliant NBFC Direct Transfer</div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Dada Bridge facilitates initial verification only. The partner NBFC (Apex Capital Finance) sanctions and transfers funds directly to your verified HDFC salary account.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <span>Submitting Request...</span> : <span>Confirm & Submit EWA Request</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
