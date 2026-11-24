'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function NbfcSimulatorPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pts, apps] = await Promise.all([
          apiRequest('/nbfc/partners').catch(() => []),
          apiRequest('/loan-applications').catch(() => []),
        ]);
        setPartners(pts || []);
        setApplications(apps || []);
        if (apps && apps.length > 0) {
          setSelectedAppId(apps[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSimulate = async (action: 'APPROVE' | 'REJECT' | 'DISBURSE') => {
    if (!selectedAppId) return;
    setSimulating(true);
    setResultMessage(null);

    try {
      const res = await apiRequest('/nbfc/simulate-action', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: selectedAppId,
          action,
          remarks: `Simulated ${action} action executed via Dada Admin Console`,
        }),
      });
      setResultMessage(`✅ Simulated Webhook Triggered: Application state transitioned successfully via signed webhook event (${res.eventId}).`);
      // Reload applications
      const updated = await apiRequest('/loan-applications');
      setApplications(updated || []);
    } catch (err: any) {
      setResultMessage(`❌ Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">NBFC Partners & Webhook Simulator</h1>
        <p className="text-xs text-slate-500">
          Manage partner NBFC configurations and simulate live underwriting and disbursement webhooks for testing.
        </p>
      </div>

      {resultMessage && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
          {resultMessage}
        </div>
      )}

      {/* Simulator Card */}
      <div className="bg-white p-8 rounded-2xl border border-purple-200 shadow-md space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-base text-dada-950">Interactive NBFC Action Simulator</h3>
            <p className="text-xs text-slate-500">
              Simulate external NBFC events (Approval, Rejection, or Bank Disbursement) with webhook signature & idempotency.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Select Target Application</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-xs font-mono font-semibold"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applicationNumber} ({app.productType}) - Current: {app.status} - {formatINR(app.requestedAmountPaise)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Simulate NBFC Event Action</label>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulate('APPROVE')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs disabled:opacity-50"
              >
                Simulate Approve
              </button>
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulate('DISBURSE')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs disabled:opacity-50"
              >
                Simulate Disburse (UTR)
              </button>
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulate('REJECT')}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs disabled:opacity-50"
              >
                Simulate Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner NBFCs List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-sm text-dada-950">Configured Partner NBFCs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {partners.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-dada-950">{p.name}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="text-slate-500">API Endpoint: <span className="font-mono">{p.apiUrl}</span></div>
              <div className="text-slate-500">Supported Products: <span className="font-semibold text-slate-800">{p.supportedProducts}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
