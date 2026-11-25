'use client';

import React, { useEffect, useState } from 'react';
import { FileCheck2, Search, Filter } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/loan-applications');
        setApplications(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = applications.filter((a) =>
    filterProduct === 'ALL' ? true : a.productType === filterProduct,
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">All Loan Applications</h1>
          <p className="text-xs text-slate-500">
            System-wide view of applications across all onboarded employers.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterProduct('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold ${filterProduct === 'ALL' ? 'bg-dada-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterProduct('EWA')}
            className={`px-3 py-1.5 rounded-lg font-bold ${filterProduct === 'EWA' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            EWA Only
          </button>
          <button
            onClick={() => setFilterProduct('PAYROLL_LOAN')}
            className={`px-3 py-1.5 rounded-lg font-bold ${filterProduct === 'PAYROLL_LOAN' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Payroll Loans
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="table-scroll"><table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Application Number</th>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Requested</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-dada-950">{app.applicationNumber}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {app.employee?.firstName} {app.employee?.lastName}
                  <div className="text-[10px] text-slate-400 font-mono">{app.employee?.employeeCode}</div>
                </td>
                <td className="py-3.5 px-4 font-bold">{app.productType}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{formatINR(app.requestedAmountPaise)}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    app.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {new Date(app.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
