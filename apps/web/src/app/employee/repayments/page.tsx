'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function RepaymentsPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const loans = await apiRequest('/loan-applications/my-loans');
        const allSchedules: any[] = [];
        for (const loan of loans || []) {
          for (const sched of loan.repaymentSchedules || []) {
            allSchedules.push({
              ...sched,
              loanAccountNumber: loan.loanAccountNumber,
              productType: loan.productType,
            });
          }
        }
        // Sort chronologically by due date
        allSchedules.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setSchedules(allSchedules);
      } catch (e) {
        console.error('Failed to load repayment schedules:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading repayment schedule...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Repayment Schedule & History</h1>
        <p className="text-xs text-slate-500">
          Track upcoming and past salary deduction installments across your active facilities.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 font-bold text-sm text-dada-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>Salary Deduction Installments</span>
          </div>
          <span className="text-xs font-normal text-slate-500">{schedules.length} installment(s) recorded</span>
        </div>

        {schedules.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No upcoming repayment installments scheduled.</p>
            <p className="text-slate-400">Installments will automatically appear here once an EWA or loan withdrawal is disbursed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Facility</th>
                  <th className="py-3.5 px-6">Inst #</th>
                  <th className="py-3.5 px-6">Principal</th>
                  <th className="py-3.5 px-6">Interest</th>
                  <th className="py-3.5 px-6">Total Due</th>
                  <th className="py-3.5 px-6">Method</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {schedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-semibold">
                      {new Date(item.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-dada-950">{item.loanAccountNumber}</div>
                      <div className="text-[10px] text-slate-400">{item.productType}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">#{item.installmentNumber}</td>
                    <td className="py-4 px-6 font-mono">{formatINR(item.principalPaise)}</td>
                    <td className="py-4 px-6 font-mono text-slate-500">{formatINR(item.interestPaise)}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{formatINR(item.totalDuePaise)}</td>
                    <td className="py-4 px-6 text-slate-500">Payroll Deduction</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
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
