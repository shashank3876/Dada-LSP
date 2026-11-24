'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/audit');
        setLogs(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">Immutable Audit Trail</h1>
        <p className="text-xs text-slate-500">
          Traceable event logs for sensitive financial mutations, attendance overrides, and webhook events.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Actor</th>
              <th className="py-3.5 px-4">Resource</th>
              <th className="py-3.5 px-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{log.action}</td>
                <td className="py-3.5 px-4 font-semibold">{log.user?.fullName || 'SYSTEM'}</td>
                <td className="py-3.5 px-4 font-mono text-[11px]">{log.resourceType}</td>
                <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                  {log.metadataJson}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
