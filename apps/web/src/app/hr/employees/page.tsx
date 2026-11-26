'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Download, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function HrEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/employees');
        setEmployees(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName} ${e.employeeCode} ${e.department}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">Employee Roster</h1>
          <p className="text-xs text-slate-500">
            Corporate employees eligible for salary-linked lending and EWA. Sensitive PII masked.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hr/employees/import"
            className="px-4 py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Import CSV</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or department..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Employee Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Masked PAN</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{emp.employeeCode}</td>
                <td className="py-3.5 px-4 font-semibold text-dada-950">
                  {emp.firstName} {emp.lastName}
                  <div className="text-[10px] text-slate-400 font-normal">{emp.officialEmail}</div>
                </td>
                <td className="py-3.5 px-4">{emp.department}</td>
                <td className="py-3.5 px-4 font-mono">{emp.panNumberMasked}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      emp.employmentStatus === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : emp.employmentStatus === 'NOTICE_PERIOD'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {emp.employmentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
