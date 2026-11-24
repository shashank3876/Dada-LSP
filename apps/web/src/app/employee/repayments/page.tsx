'use client';

import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function RepaymentsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Repayment Schedule & History</h1>
        <p className="text-xs text-slate-500">
          Track upcoming and past salary deduction installments.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 font-bold text-sm text-dada-950">
          Upcoming Installments
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3.5 px-6">Due Date</th>
              <th className="py-3.5 px-6">Facility</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Method</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-4 px-6 font-semibold">30 Nov 2026</td>
              <td className="py-4 px-6">EWA Advance (LN-EWA-2026-0001)</td>
              <td className="py-4 px-6 font-bold text-slate-900">{formatINR(2000000)}</td>
              <td className="py-4 px-6">Payroll Salary Cut</td>
              <td className="py-4 px-6">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  SCHEDULED
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
