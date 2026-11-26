'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Plus, CheckCircle2, AlertCircle, Users, FileText, Sliders } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [domain, setDomain] = useState('');

  async function load() {
    try {
      const res = await apiRequest('/organizations');
      setOrganizations(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await apiRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          code,
          name,
          cinNumber,
          registeredAddress,
          domain,
        }),
      });
      setMessage(`Organization ${name} (${code}) onboarded successfully.`);
      setShowModal(false);
      setCode('');
      setName('');
      setCinNumber('');
      setRegisteredAddress('');
      setDomain('');
      await load();
    } catch (err: any) {
      alert(err.message || 'Failed to onboard organization');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading corporate partners...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dada-950">Corporate Partner Organizations</h1>
          <p className="text-xs text-slate-500">
            Enterprise clients enabled for salary-linked Earned Wage Access and corporate personal loans.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Organization</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organizations.map((org) => {
          const empCount = org._count?.employees || 0;
          const appCount = org._count?.loanApplications || 0;
          const policy = org.policies?.[0];

          return (
            <div key={org.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-dada-950">{org.name}</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {org.code}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1">CIN: {org.cinNumber}</div>
                  <div className="text-xs text-slate-400">{org.domain || 'Corporate Domain'}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    org.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {org.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="text-xs text-slate-600 line-clamp-2">
                <strong className="text-slate-800">Address:</strong> {org.registeredAddress}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-slate-50">
                  <div className="text-slate-400 text-[10px]">Employees</div>
                  <div className="font-extrabold text-dada-950">{empCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <div className="text-slate-400 text-[10px]">Loan Requests</div>
                  <div className="font-extrabold text-dada-950">{appCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <div className="text-slate-400 text-[10px]">EWA Cap</div>
                  <div className="font-extrabold text-emerald-600">{policy?.maxEwaPercentage || 50}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-dada-950">Onboard New Corporate Partner</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Corporate Code (Unique identifier)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INFOSYS"
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Legal Registered Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Infosys Technologies India Ltd"
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Corporate CIN Number</label>
                  <input
                    type="text"
                    required
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. U72200KA1981PLC013115"
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Corporate Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. infosys.com"
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Registered Office Address</label>
                <textarea
                  rows={2}
                  required
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  placeholder="Full statutory registered office address"
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-dada-900 hover:bg-dada-800 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Onboarding...' : 'Onboard Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
