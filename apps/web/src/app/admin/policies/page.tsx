'use client';

import React, { useEffect, useState } from 'react';
import { Sliders, CheckCircle2, AlertCircle, Save, Building2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    try {
      const res = await apiRequest('/policies/all');
      setPolicies(res || []);
      if (res && res.length > 0 && !selectedPolicy) {
        setSelectedPolicy(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setSaving(true);
    setMessage(null);

    try {
      await apiRequest(`/policies?organizationId=${selectedPolicy.organizationId}`, {
        method: 'PUT',
        body: JSON.stringify({
          maxEwaPercentage: Number(selectedPolicy.maxEwaPercentage),
          maxEwaWithdrawalsPerCycle: Number(selectedPolicy.maxEwaWithdrawalsPerCycle),
          payrollCutoffDay: Number(selectedPolicy.payrollCutoffDay),
          payrollFreezeDaysBeforeCutoff: Number(selectedPolicy.payrollFreezeDaysBeforeCutoff || 0),
          allowPayrollLoans: Boolean(selectedPolicy.allowPayrollLoans),
          salaryMultiplier: Number(selectedPolicy.salaryMultiplier),
          annualInterestRatePercent: Number(selectedPolicy.annualInterestRatePercent),
          processingFeePercent: Number(selectedPolicy.processingFeePercent),
          maxFoirPercent: Number(selectedPolicy.maxFoirPercent),
        }),
      });
      setMessage(`Lending policies updated for ${selectedPolicy.organization?.name || 'organization'}.`);
      await load();
    } catch (err: any) {
      alert(err.message || 'Failed to update policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading corporate lending policies...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">Global Corporate Policies & Guardrails</h1>
        <p className="text-xs text-slate-500">
          Centrally inspect and configure credit limits, interest rates, tenures, and cutoff windows per corporate employer.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Organization Policy Selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Corporate Clients</h3>
          <div className="space-y-1">
            {policies.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPolicy(p)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex flex-col justify-between ${
                  selectedPolicy?.id === p.id
                    ? 'bg-purple-50 border border-purple-300 font-bold text-purple-950'
                    : 'hover:bg-slate-50 border border-transparent text-slate-700'
                }`}
              >
                <div className="truncate">{p.organization?.name || 'Organization'}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.organization?.code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Policy Form */}
        {selectedPolicy && (
          <form onSubmit={handleSave} className="md:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-dada-950">
                Lending Rules: {selectedPolicy.organization?.name}
              </h3>
              <p className="text-xs text-slate-400">Organization Code: {selectedPolicy.organization?.code}</p>
            </div>

            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 text-xs">Earned Wage Access (EWA) Limits</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Max EWA Percentage (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={selectedPolicy.maxEwaPercentage}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, maxEwaPercentage: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Max Withdrawals / Cycle</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={selectedPolicy.maxEwaWithdrawalsPerCycle}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, maxEwaWithdrawalsPerCycle: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Payroll Cutoff Day</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={selectedPolicy.payrollCutoffDay}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, payrollCutoffDay: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Freeze Days Prior to Cutoff</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={selectedPolicy.payrollFreezeDaysBeforeCutoff || 0}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, payrollFreezeDaysBeforeCutoff: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <h4 className="font-bold text-slate-800 text-xs pt-2">Corporate Payroll Loan Terms</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Salary Multiplier</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={selectedPolicy.salaryMultiplier}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, salaryMultiplier: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedPolicy.annualInterestRatePercent}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, annualInterestRatePercent: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedPolicy.processingFeePercent}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, processingFeePercent: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Max FOIR (%)</label>
                  <input
                    type="number"
                    min="20"
                    max="70"
                    value={selectedPolicy.maxFoirPercent}
                    onChange={(e) => setSelectedPolicy({ ...selectedPolicy, maxFoirPercent: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Save Policy Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
