'use client';

import React, { useEffect, useState } from 'react';
import { FileCheck2, Search, Filter, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [overrideStatus, setOverrideStatus] = useState('SENT_TO_NBFC');
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    try {
      const res = await apiRequest('/loan-applications');
      setApplications(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleOverrideTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (!remarks.trim() || remarks.trim().length < 15) {
      alert('Security Policy: Manual override requires a detailed audit justification of at least 15 characters.');
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      await apiRequest(`/loan-applications/${selectedApp.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          toStatus: overrideStatus,
          remarks: `[DADA_ADMIN_OVERRIDE]: ${remarks.trim()}`,
        }),
      });
      setMessage(`Application ${selectedApp.applicationNumber} transitioned to ${overrideStatus}.`);
      setSelectedApp(null);
      setRemarks('');
      await load();
    } catch (err: any) {
      alert(err.message || 'Transition rejected by state machine validator.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter((a) =>
    filterProduct === 'ALL' ? true : a.productType === filterProduct,
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">Loan Application Oversight</h1>
          <p className="text-xs text-slate-500">
            System-wide view of applications across all onboarded employers with audit-logged administrative override.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterProduct('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold ${filterProduct === 'ALL' ? 'bg-dada-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterProduct('EWA')}
            className={`px-3 py-1.5 rounded-lg font-bold ${filterProduct === 'EWA' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            EWA Only
          </button>
          <button
            onClick={() => setFilterProduct('PAYROLL_LOAN')}
            className={`px-3 py-1.5 rounded-lg font-bold ${filterProduct === 'PAYROLL_LOAN' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Payroll Loans
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Application Number</th>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Requested</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-dada-950">{app.applicationNumber}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {app.employee?.firstName} {app.employee?.lastName}
                  <div className="text-[10px] text-slate-400 font-mono">{app.employee?.employeeCode}</div>
                </td>
                <td className="py-3.5 px-4 font-bold">{app.productType}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{formatINR(app.requestedAmountPaise)}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    app.status === 'DISBURSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {new Date(app.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setRemarks('');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspect & Override Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-dada-950">
                Inspect Application: {selectedApp.applicationNumber}
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px]">Applicant:</span>
                <div className="font-bold text-slate-900">{selectedApp.employee?.firstName} {selectedApp.employee?.lastName}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Product:</span>
                <div className="font-bold text-slate-900">{selectedApp.productType}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Requested Amount:</span>
                <div className="font-bold text-slate-900">{formatINR(selectedApp.requestedAmountPaise)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Current Status:</span>
                <div className="font-bold text-emerald-600">{selectedApp.status}</div>
              </div>
            </div>

            {/* Audit History */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-700">Lifecycle Audit History:</span>
              <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                {selectedApp.statusHistory?.map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-mono">[{new Date(h.createdAt).toLocaleTimeString()}]</span>
                    <strong className="text-slate-800">{h.toStatus}:</strong>
                    <span>{h.remarks}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Manual Override Form */}
            <form onSubmit={handleOverrideTransition} className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 text-[11px]">
                <ShieldAlert className="w-4 h-4 text-purple-700 inline mr-1" />
                Administrative manual overrides require a mandatory audit justification (min 15 chars).
              </div>

              <div>
                <label className="font-semibold text-slate-700">Target State Transition</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-semibold bg-white"
                >
                  <option value="SENT_TO_NBFC">SENT_TO_NBFC (Forward to NBFC)</option>
                  <option value="REJECTED">REJECTED (Decline Application)</option>
                  <option value="CANCELLED">CANCELLED (Administrative Cancellation)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Audit Justification & Reason (min 15 chars)</label>
                <textarea
                  rows={2}
                  required
                  minLength={15}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Administrative manual review completed after verifying employment records with HR."
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-dada-900 hover:bg-dada-800 text-white font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Recording Override...' : 'Execute Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
