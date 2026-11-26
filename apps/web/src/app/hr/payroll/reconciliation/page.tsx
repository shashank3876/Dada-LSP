'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, Upload, Check } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function HrReconciliationPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [remittances, setRemittances] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [utr, setUtr] = useState('UTRIBKL2611990022');
  const [amountRupees, setAmountRupees] = useState(20000);
  const [notes, setNotes] = useState('Remitted directly to Apex Capital NBFC Escrow Account');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadData() {
    try {
      const [bts, rems, excs] = await Promise.all([
        apiRequest('/payroll/batches').catch(() => []),
        apiRequest('/reconciliation/remittances').catch(() => []),
        apiRequest('/reconciliation/exceptions').catch(() => []),
      ]);
      setBatches(bts || []);
      setRemittances(rems || []);
      setExceptions(excs || []);
      if (bts && bts.length > 0 && !selectedBatchId) {
        setSelectedBatchId(bts[0].id);
        setAmountRupees(Math.round(bts[0].totalAmountPaise / 100));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert('Please select a payroll batch.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await apiRequest('/reconciliation/upload-remittance', {
        method: 'POST',
        body: JSON.stringify({
          payrollBatchId: selectedBatchId,
          utrNumber: utr,
          remittedAmountPaise: amountRupees * 100,
          notes,
        }),
      });
      setFeedback('Remittance UTR successfully recorded and matched against partner NBFC obligations.');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveException = async (excId: string) => {
    try {
      await apiRequest(`/reconciliation/exceptions/${excId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Verified and resolved by Corporate HR Admin' }),
      });
      setFeedback('Exception marked as resolved.');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading reconciliation ledger...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">Repayment & Remittance Reconciliation</h1>
        <p className="text-xs text-slate-500">
          Match employer salary deductions transferred directly to NBFC escrow with employee loan ledgers.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Upload Remittance Form */}
      <form onSubmit={handleUploadRemittance} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-dada-950 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>Upload Employer Remittance UTR</span>
        </h3>
        <p className="text-xs text-slate-500">
          Submit bank transaction reference (UTR) after transferring deducted payroll loan amounts directly to partner NBFC escrow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Target Payroll Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                const b = batches.find((x) => x.id === e.target.value);
                if (b) setAmountRupees(Math.round(b.totalAmountPaise / 100));
              }}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono bg-white"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchNumber} (Cycle {b.month}/{b.year}) - {formatINR(b.totalAmountPaise)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Bank UTR / Transaction Ref</label>
            <input
              type="text"
              required
              value={utr}
              onChange={(e) => setUtr(e.target.value.toUpperCase())}
              placeholder="e.g. UTRIBKL2611990022"
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono uppercase"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Remitted Amount (INR)</label>
            <input
              type="number"
              required
              value={amountRupees}
              onChange={(e) => setAmountRupees(Number(e.target.value))}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">Zero custody of funds: Transfer goes directly to partner NBFC escrow account.</span>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{submitting ? 'Confirming...' : 'Record Remittance'}</span>
          </button>
        </div>
      </form>

      {/* Remittance History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-6">
        <h3 className="font-bold text-sm text-dada-950">Corporate Remittance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">UTR Number</th>
                <th className="py-3 px-4">Partner NBFC</th>
                <th className="py-3 px-4">Batch Ref</th>
                <th className="py-3 px-4">Amount Remitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {remittances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No remittances recorded yet.
                  </td>
                </tr>
              ) : (
                remittances.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{r.utrNumber}</td>
                    <td className="py-3.5 px-4 font-semibold">{r.nbfcPartner?.name || 'Apex Capital Finance'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{r.payrollBatch?.batchNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatINR(r.remittedAmountPaise)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exceptions Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-6">
        <h3 className="font-bold text-sm text-dada-950 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Reconciliation Exceptions & Variances</span>
        </h3>

        {exceptions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            ✓ Zero active reconciliation exceptions. All remittances match payroll records perfectly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Variance Amount</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {exceptions.map((exc) => (
                  <tr key={exc.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-rose-700">{exc.exceptionType}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {exc.payrollBatchItem?.employee?.firstName} {exc.payrollBatchItem?.employee?.lastName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatINR(exc.discrepancyPaise)}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{exc.reason}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          exc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {exc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {exc.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => handleResolveException(exc.id)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
