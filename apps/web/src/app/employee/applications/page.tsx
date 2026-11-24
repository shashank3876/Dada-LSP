'use client';

import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, Clock, Landmark, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    loadApps();
  }, []);

  if (loading) return <div className="p-8 text-center text-sm">Loading applications...</div>;

  const steps = [
    { key: 'SUBMITTED', label: '1. Submitted' },
    { key: 'SENT_TO_NBFC', label: '2. Sent to NBFC' },
    { key: 'APPROVED', label: '3. Approved' },
    { key: 'DISBURSED', label: '4. Disbursed' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Loan Applications Tracker</h1>
        <p className="text-xs text-slate-500">
          Track end-to-end lifecycle from initial eligibility check to partner NBFC direct disbursement.
        </p>
      </div>

      <div className="space-y-6">
        {applications.map((app) => {
          const isDisbursed = app.status === 'DISBURSED';
          const isApproved = app.status === 'APPROVED' || isDisbursed;
          const isSent = app.status === 'SENT_TO_NBFC' || isApproved;

          return (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-dada-950">{app.applicationNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {app.productType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Submitted on: {new Date(app.createdAt).toLocaleDateString('en-IN')} • Underwriter: Apex Capital Finance
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-dada-950">
                    {formatINR(app.requestedAmountPaise)}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                      isSent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isSent ? '✓' : '2'}
                    </div>
                    <div className="font-bold text-slate-900">NBFC Review</div>
                  </div>
                  <div className="space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                      isApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isApproved ? '✓' : '3'}
                    </div>
                    <div className="font-bold text-slate-900">Sanctioned</div>
                  </div>
                  <div className="space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
                      isDisbursed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDisbursed ? '✓' : '4'}
                    </div>
                    <div className="font-bold text-slate-900">Disbursed</div>
                  </div>
                </div>
              </div>

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
    </div>
  );
}
