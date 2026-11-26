'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, Clock, Landmark, AlertCircle, FileCheck, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadApps() {
    try {
      const res = await apiRequest('/loan-applications');
      setApplications(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, []);

  const handleTransition = async (appId: string, toStatus: string, remarks: string) => {
    setActionLoading(appId);
    setMessage(null);
    try {
      await apiRequest(`/loan-applications/${appId}/transition`, {
        method: 'POST',
        body: JSON.stringify({ toStatus, remarks }),
      });
      setMessage(`Application successfully transitioned to ${toStatus}.`);
      await loadApps();
    } catch (e: any) {
      alert(e.message || 'Transition failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading applications...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Loan Applications Tracker</h1>
        <p className="text-xs text-slate-500">
          Track end-to-end lifecycle from initial eligibility check to partner NBFC direct disbursement.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-dada-950">No Applications Submitted</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't submitted any Earned Wage Access withdrawals or Corporate Payroll Loan applications yet.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/employee/ewa/apply"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              Withdraw EWA
            </Link>
            <Link
              href="/employee/payroll-loan/apply"
              className="px-4 py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs"
            >
              Apply Payroll Loan
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const isDisbursed = app.status === 'DISBURSED';
            const isApproved =
              app.status === 'APPROVED' ||
              app.status === 'OFFER_ACCEPTED' ||
              app.status === 'ESIGN_PENDING' ||
              app.status === 'DISBURSEMENT_PENDING' ||
              isDisbursed;
            const isSent = app.status === 'SENT_TO_NBFC' || isApproved;

            return (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-lg text-dada-950">{app.applicationNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {app.productType === 'EWA' ? 'Earned Wage Access' : 'Payroll Loan'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Submitted on: {new Date(app.createdAt).toLocaleDateString('en-IN')} • Underwriter:{' '}
                      {app.nbfcPartner?.name || 'Apex Capital Finance Limited'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-dada-950">
                      {formatINR(app.requestedAmountPaise)}
                    </div>
                    <div
                      className={`text-xs font-bold mt-0.5 ${
                        app.status === 'DISBURSED'
                          ? 'text-emerald-600'
                          : app.status === 'REJECTED' || app.status === 'CANCELLED'
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {app.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                {/* State Machine Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold text-xs">
                        ✓
                      </div>
                      <div className="font-bold text-slate-900">Submitted</div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                          isSent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isSent ? '✓' : '2'}
                      </div>
                      <div className="font-bold text-slate-900">NBFC Review</div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                          isApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isApproved ? '✓' : '3'}
                      </div>
                      <div className="font-bold text-slate-900">Sanctioned</div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                          isDisbursed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDisbursed ? '✓' : '4'}
                      </div>
                      <div className="font-bold text-slate-900">Disbursed</div>
                    </div>
                  </div>
                </div>

                {/* Borrower Actions: KFS Acceptance & Cancellation */}
                {app.status === 'APPROVED' && (
                  <div className="p-5 rounded-xl bg-purple-50 border border-purple-200 space-y-4 text-xs">
                    <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
                      <FileCheck className="w-5 h-5 text-purple-600" />
                      <span>Statutory Key Fact Statement (KFS) Approved</span>
                    </div>
                    <p className="text-purple-800 text-xs">
                      Under RBI Digital Lending Guidelines, please review your sanctioned terms before proceeding to agreement execution:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-white rounded-lg border border-purple-200">
                      <div>
                        <span className="text-slate-400 text-[10px]">Sanctioned Amount:</span>
                        <div className="font-bold text-slate-900">{formatINR(app.approvedAmountPaise || app.requestedAmountPaise)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Interest Rate:</span>
                        <div className="font-bold text-emerald-600">{app.interestRatePercent || 0}% p.a.</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Tenure:</span>
                        <div className="font-bold text-slate-900">{app.tenureMonths || 1} Month(s)</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Monthly EMI:</span>
                        <div className="font-bold text-slate-900">{formatINR(app.monthlyEmiPaise || app.requestedAmountPaise)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() =>
                          handleTransition(app.id, 'OFFER_ACCEPTED', 'Borrower reviewed and accepted statutory Key Fact Statement (KFS)')
                        }
                        disabled={actionLoading === app.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Accept KFS & Proceed</span>
                      </button>
                      <button
                        onClick={() =>
                          handleTransition(app.id, 'REJECTED_BY_BORROWER', 'Borrower declined the sanctioned loan offer')
                        }
                        disabled={actionLoading === app.id}
                        className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Decline Offer</span>
                      </button>
                    </div>
                  </div>
                )}

                {app.status === 'OFFER_ACCEPTED' && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-blue-950">KFS Accepted • Ready for Digital e-Sign</div>
                      <div className="text-blue-700 text-[11px] mt-0.5">Proceed to execute agreement via Aadhaar OTP e-Sign.</div>
                    </div>
                    <button
                      onClick={() =>
                        handleTransition(app.id, 'ESIGN_PENDING', 'Borrower initiated Aadhaar OTP e-Sign agreement execution')
                      }
                      disabled={actionLoading === app.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow flex items-center gap-1"
                    >
                      <span>Simulate e-Sign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {app.status === 'SUBMITTED' && (
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        handleTransition(app.id, 'CANCELLED', 'Borrower cancelled withdrawal request prior to underwrite')
                      }
                      disabled={actionLoading === app.id}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Cancel Application
                    </button>
                  </div>
                )}

                {/* Status History & Audit Notes */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800">Status History & Audit Trail:</div>
                  <div className="space-y-1.5 text-slate-600">
                    {app.statusHistory?.map((h: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">[{new Date(h.createdAt).toLocaleTimeString()}]</span>
                        <span className="font-semibold text-slate-800">{h.toStatus}:</span>
                        <span>{h.remarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
