'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, CheckCircle2, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function HrPayrollBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/payroll/batches');
        setBatches(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiRequest('/payroll/batches/generate', {
        method: 'POST',
        body: JSON.stringify({ month: 11, year: 2026 }),
      });
      const updated = await apiRequest('/payroll/batches');
      setBatches(updated || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCsv = async (batchId: string) => {
    try {
      const res = await apiRequest(`/payroll/batches/${batchId}/export`);
      const blob = new Blob([res.csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.fileName;
      a.click();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">Payroll Deduction Batches</h1>
          <p className="text-xs text-slate-500">
            Automated salary cycle deduction batches. Export CSV for salary processing.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{generating ? 'Generating...' : 'Generate Cutoff Batch'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Batch Number</th>
              <th className="py-3.5 px-4">Cycle</th>
              <th className="py-3.5 px-4">Employees</th>
              <th className="py-3.5 px-4">Total Due</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Export</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-dada-950">{b.batchNumber}</td>
                <td className="py-3.5 px-4">Nov 2026</td>
                <td className="py-3.5 px-4 font-semibold">{b.totalEmployees} Employees</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{formatINR(b.totalDuePaise)}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800">
                    {b.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => handleExportCsv(b.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
