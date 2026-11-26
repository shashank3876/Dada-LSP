'use client';

import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function HrIntegrationsPage() {
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    try {
      const res = await apiRequest('/hrms/status');
      setIntegration(res);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError(null);

    try {
      const res = await apiRequest('/hrms/sync', { method: 'POST' });
      setSyncResult(res);
      await loadStatus();
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Checking HRMS connector status...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">HRMS & Payroll Integrations</h1>
        <p className="text-xs text-slate-500">
          Bidirectional synchronization with corporate HRMS providers (Keka, Darwinbox, GreytHR).
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="font-bold">Sandbox Simulation Mode:</span>
          <p className="mt-0.5 text-amber-800">
            This connector runs in simulated sandbox mode. Production synchronization requires client-approved OAuth2 provider credentials and corporate API access keys.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {syncResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncResult.message}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-extrabold text-lg">
              K
            </div>
            <div>
              <h3 className="font-bold text-base text-dada-950">
                {integration?.provider || 'Keka'} HRMS Connector
              </h3>
              <p className="text-xs text-slate-500">
                REST API v1 • Endpoint: <span className="font-mono">{integration?.apiUrl || 'api.keka.com/v1'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
              SIMULATED CONNECTOR
            </span>
            <span
              className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 ${
                integration?.status === 'CONFIGURED' || integration?.status === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{integration?.lastSyncStatus || integration?.status || 'CONFIGURED'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500">Last Verified Sync</span>
            <div className="font-mono font-bold text-slate-800">
              {integration?.lastSyncAt
                ? new Date(integration.lastSyncAt).toLocaleString('en-IN')
                : 'Pending initial sync'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500">Roster Sync Frequency</span>
            <div className="font-bold text-slate-800">Nightly (02:00 AM IST)</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500">Attendance Auto-Fetch</span>
            <div className="font-bold text-emerald-600">
              {integration?.autoSyncDaily ? 'Active (Daily Delta)' : 'Manual Only'}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-5 py-2.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing with HRMS...' : 'Trigger Bidirectional Sync'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
