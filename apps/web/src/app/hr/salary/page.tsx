'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Search, Calendar, Download } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function HrSalaryRegisterPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/salary?month=11&year=2026');
        setSalaries(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = salaries.filter((s) => {
    const name = `${s.employee?.firstName || ''} ${s.employee?.lastName || ''} ${s.employee?.employeeCode || ''}`;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading salary register...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">Corporate Salary Register</h1>
          <p className="text-xs text-slate-500">
            Verified monthly payroll earnings, gross/net splits, and statutory deductions for November 2026.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Monthly Net</th>
                <th className="py-3 px-4">Monthly Gross</th>
                <th className="py-3 px-4">Basic Pay</th>
                <th className="py-3 px-4">HRA</th>
                <th className="py-3 px-4">PF Deduction</th>
                <th className="py-3 px-4">Tax (TDS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.employee?.employeeCode}</td>
                  <td className="py-3.5 px-4 font-semibold text-dada-950">
                    {s.employee?.firstName} {s.employee?.lastName}
                    <div className="text-[10px] text-slate-400 font-normal">{s.employee?.department}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{formatINR(s.monthlyNetPaise)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatINR(s.monthlyGrossPaise)}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{formatINR(s.basicPayPaise)}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{formatINR(s.hraPaise)}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-700">-{formatINR(s.pfDeductionPaise)}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-700">-{formatINR(s.taxDeductionPaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
