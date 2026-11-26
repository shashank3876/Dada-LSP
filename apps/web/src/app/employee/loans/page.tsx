'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, AlertCircle, Zap, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/loan-applications/my-loans');
        setLoans(res || []);
      } catch (e) {
        console.error('Failed to load loans:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading active credit facilities...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Active Loans & Credit Facilities</h1>
        <p className="text-xs text-slate-500">
          Overview of your active Earned Wage Access withdrawals and Corporate Payroll personal loans.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Staging Sandbox Note:</strong> Partner NBFCs (Apex Capital Finance Ltd) and bank UTRs are simulated demonstration artifacts in this environment. Zero custody of funds is maintained.
        </span>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-dada-950">No Active Facilities Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You currently have no disbursed Earned Wage Access withdrawals or active personal loans. Explore your options below:
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/employee/ewa/apply"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Withdraw EWA</span>
            </Link>
            <Link
              href="/employee/payroll-loan/apply"
              className="px-4 py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Apply Payroll Loan</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => {
            const nextInstallment = loan.repaymentSchedules?.find(
              (s: any) => s.status === 'PENDING' || s.status === 'PARTIALLY_PAID',
            );

            return (
              <div key={loan.id} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-dada-950">{loan.loanAccountNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          loan.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : loan.status === 'CLOSED'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Product: <span className="font-semibold text-slate-700">{loan.productType === 'EWA' ? 'Earned Wage Access (EWA)' : 'Corporate Payroll Loan'}</span> • Underwritten by:{' '}
                      <span className="font-semibold text-slate-700">{loan.nbfcPartner?.name || 'Apex Capital Finance Ltd'} <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">(Simulated NBFC Partner)</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-dada-950">{formatINR(loan.principalPaise)}</div>
                    <div className="text-xs text-slate-500">Principal Disbursed</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500">Disbursement UTR:</span>
                    <div className="font-mono font-bold text-slate-800 truncate">
                      {loan.disbursementUtr ? `${loan.disbursementUtr} (Simulated UTR)` : 'CMS-PENDING (Demo)'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500">Interest Rate:</span>
                    <div className="font-bold text-emerald-600">
                      {loan.interestRatePercent > 0 ? `${loan.interestRatePercent}% p.a.` : '0% Interest'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500">Next Repayment Due:</span>
                    <div className="font-bold text-slate-800">
                      {nextInstallment
                        ? new Date(nextInstallment.dueDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Settled'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500">Deduction Method:</span>
                    <div className="font-bold text-slate-800">Payroll Deduction</div>
                  </div>
                </div>

                {loan.repaymentSchedules && loan.repaymentSchedules.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Total Repayable: <strong className="text-slate-900">{formatINR(loan.totalRepayablePaise)}</strong> • Paid to Date:{' '}
                      <strong className="text-emerald-700">{formatINR(loan.totalPaidPaise)}</strong>
                    </span>
                    <Link
                      href="/employee/repayments"
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                    >
                      <span>View Repayment Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
