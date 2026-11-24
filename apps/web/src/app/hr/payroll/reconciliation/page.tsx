'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function HrReconciliationPage() {
  const [remittances, setRemittances] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [utr, setUtr] = useState('UTRIBKL2611990022');
  const [amountRupees, setAmountRupees] = useState(20000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rems, excs] = await Promise.all([
          apiRequest('/reconciliation/remittances').catch(() => []),
          apiRequest('/reconciliation/exceptions').catch(() => []),
        ]);
        setRemittances(rems || []);
        setExceptions(excs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUploadRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/reconciliation/upload-remittance', {
        method: 'POST',
        body: JSON.stringify({
          payrollBatchId: remittances[0]?.payrollBatchId || 'batch-1',
          utrNumber: utr,
          remittedAmountPaise: amountRupees * 100,
          notes: 'Remitted directly to Apex Capital Escrow',
        }),
      });
      alert('Remittance uploaded and matched against outstanding batch obligations.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolveException = async (excId: string) => {
    try {
      await apiRequest(`/reconciliation/exceptions/${excId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Verified and resolved by HR Admin' }),
      });
      alert('Exception resolved.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">Repayment & Remittance Reconciliation</h1>
        <p className="text-xs text-slate-500">
          Match employer salary deductions transferred directly to NBFC escrow with employee loan ledgers.
        </p>
      </div>

      {/* Upload Remittance Form */}
      <form onSubmit={handleUploadRemittance} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-dada-950">Upload Employer Remittance UTR</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Bank UTR / Transaction Ref</label>
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700">Remitted Amount (INR)</label>
            <input
              type="number"
              value={amountRupees}
              onChange={(e) => setAmountRupees(Number(e.target.value))}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-semibold"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
            >
              Confirm Remittance Match
            </button>
          </div>
        </div>
      </form>

      {/* Open Exceptions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
        <h3 className="font-bold text-sm text-dada-950 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Reconciliation Exceptions ({exceptions.length})</span>
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {exceptions.map((exc) => (
            <div key={exc.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{exc.exceptionType}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    exc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {exc.status}
                  </span>
                </div>
                <div className="text-slate-500">{exc.resolutionNotes}</div>
              </div>

              {exc.status === 'OPEN' && (
                <button
                  onClick={() => handleResolveException(exc.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                >
                  Resolve Exception
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
