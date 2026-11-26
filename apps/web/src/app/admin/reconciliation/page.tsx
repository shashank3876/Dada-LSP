'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, Landmark, Building2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function AdminReconciliationPage() {
  const [remittances, setRemittances] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
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

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading cross-tenant reconciliation...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">Global Repayment Reconciliation Overview</h1>
        <p className="text-xs text-slate-500">
          Cross-employer ledger verifying employer salary deductions remitted directly to partner NBFC escrow accounts.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Remittances Tracked</span>
          <div className="text-3xl font-extrabold text-dada-950">{remittances.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Matched against partner NBFC ledgers</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Unresolved Exceptions</span>
          <div className="text-3xl font-extrabold text-rose-600">
            {exceptions.filter((e) => e.status !== 'RESOLVED').length}
          </div>
          <p className="text-[11px] text-slate-400">Overdraws or variance flags</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Custody Model</span>
          <div className="text-xl font-extrabold text-dada-950">Zero Escrow Custody</div>
          <p className="text-[11px] text-slate-400">Dada acts solely as LSP technology layer</p>
        </div>
      </div>

      {/* All Remittances */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-6">
        <h3 className="font-bold text-sm text-dada-950">Cross-Corporate Remittance UTRs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">UTR Number</th>
                <th className="py-3 px-4">Employer</th>
                <th className="py-3 px-4">Partner NBFC</th>
                <th className="py-3 px-4">Amount</th>
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
                    <td className="py-3.5 px-4 font-semibold text-dada-950">{r.organization?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4">{r.nbfcPartner?.name || 'Apex Capital Finance'}</td>
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
    </div>
  );
}
