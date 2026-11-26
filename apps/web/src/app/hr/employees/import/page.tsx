'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft, Download, Plus, Users, ShieldAlert, LogIn } from 'lucide-react';
import { apiRequest, getAuthToken, setAuthToken } from '@/lib/api';

export default function HrEmployeeImportPage() {
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, []);

  const handleQuickHrLogin = async () => {
    setQuickLoginLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'hr.admin@techcorp.in', password: 'DadaDemo@2026' }),
      });
      setAuthToken(res.accessToken);
      localStorage.setItem('dada_user_profile', JSON.stringify(res.user));
      setIsAuthenticated(true);
    } catch (e: any) {
      setError(e.message || 'HR login failed');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const sampleCsv = `employeeCode,firstName,lastName,officialEmail,department,designation,monthlyNetSalary,mobileNumber,panNumber
TC-1005,Ananya,Iyer,ananya.i@techcorp.in,Engineering,Frontend Engineer,75000,+919820011005,AABCI1234F
TC-1006,Karan,Malhotra,karan.m@techcorp.in,Product,Product Analyst,60000,+919820011006,BBBCM5678G
TC-1007,Sneha,Patil,sneha.p@techcorp.in,Design,UI Designer,55000,+919820011007,CCCDP9012H`;

  const handleLoadSample = () => {
    setCsvText(sampleCsv);
    setResult(null);
    setError(null);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      setError('Please provide CSV data to import.');
      return;
    }

    if (!getAuthToken()) {
      setError('You are not currently authenticated as HR Admin. Click "Authenticate as HR Admin" below first.');
      setIsAuthenticated(false);
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain a header row and at least one data row.');
      }

      const headers = lines[0].split(',').map((h) => h.trim());
      const employees: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map((v) => v.trim());
        const emp: any = {};
        headers.forEach((h, index) => {
          emp[h] = values[index] || '';
        });
        employees.push(emp);
      }

      const res = await apiRequest('/employees/import', {
        method: 'POST',
        body: JSON.stringify({ employees }),
      });

      setResult(res);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setIsAuthenticated(false);
        setError('Session expired or unauthorized. Please re-authenticate as Corporate HR Admin.');
      } else {
        setError(err.message || 'Import failed');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/hr/employees"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-dada-950">Import Corporate Employees</h1>
            <p className="text-xs text-slate-500">
              Bulk onboard corporate employee roster with statutory validation and duplicate prevention.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Load Sample CSV</span>
        </button>
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <div className="font-bold">Not Logged In as Corporate HR Admin</div>
              <div className="text-[11px] text-amber-700">
                You must have an active HR Admin session to import corporate employees.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickHrLogin}
            disabled={quickLoginLoading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{quickLoginLoading ? 'Authenticating...' : 'Authenticate as HR Admin'}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Import Processing Finished</span>
            </div>
            <p>
              Successfully imported <strong>{result.importedCount}</strong> new employee records into your corporate roster.
              {result.rejectedCount > 0 && ` ${result.rejectedCount} rows were rejected.`}
            </p>
            <div className="pt-2">
              <Link
                href="/hr/employees"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View Updated Roster</span>
              </Link>
            </div>
          </div>

          {result.rejectedRows && result.rejectedRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm space-y-2">
              <div className="p-4 bg-rose-50/50 border-b border-rose-200 flex items-center gap-2 text-rose-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Rejected Rows Summary ({result.rejectedRows.length})</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Row #</th>
                    <th className="py-2.5 px-4">Employee Code</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.rejectedRows.map((rej: any, idx: number) => (
                    <tr key={idx} className="hover:bg-rose-50/30">
                      <td className="py-2.5 px-4 font-mono font-bold">{rej.row}</td>
                      <td className="py-2.5 px-4 font-mono">{rej.code}</td>
                      <td className="py-2.5 px-4">{rej.email}</td>
                      <td className="py-2.5 px-4 text-rose-700 font-semibold">{rej.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CSV Form */}
      <form onSubmit={handleImport} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Paste CSV Data or Edit Below
          </label>
          <textarea
            rows={10}
            required
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`employeeCode,firstName,lastName,officialEmail,department,designation,monthlyNetSalary,mobileNumber,panNumber\nTC-1005,Ananya,Iyer,ananya.i@techcorp.in,Engineering,Frontend Engineer,75000,+919820011005,AABCI1234F`}
            className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400">
            Required headers: <code className="text-slate-600">employeeCode, firstName, lastName, officialEmail</code>.
          </p>
          <button
            type="submit"
            disabled={importing}
            className="px-6 py-2.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{importing ? 'Validating & Importing...' : 'Import Employee Batch'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
