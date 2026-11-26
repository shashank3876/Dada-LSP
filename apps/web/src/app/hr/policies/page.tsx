'use client';

import React, { useEffect, useState } from 'react';
import { Sliders, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/utils';

export default function HrPoliciesPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/policies');
        setPolicy(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await apiRequest('/policies', {
        method: 'PUT',
        body: JSON.stringify({
          maxEwaPercentage: Number(policy.maxEwaPercentage),
          maxEwaWithdrawalsPerCycle: Number(policy.maxEwaWithdrawalsPerCycle),
          payrollCutoffDay: Number(policy.payrollCutoffDay),
          payrollFreezeDaysBeforeCutoff: Number(policy.payrollFreezeDaysBeforeCutoff || 0),
          allowPayrollLoans: Boolean(policy.allowPayrollLoans),
          salaryMultiplier: Number(policy.salaryMultiplier),
          maxFoirPercent: Number(policy.maxFoirPercent),
        }),
      });
      setPolicy(res);
      setMessage('Corporate lending policy updated successfully.');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">Corporate Lending Policies</h1>
        <p className="text-xs text-slate-500">
          Configure salary exposure limits, EWA percentages, payroll cutoff windows, and FOIR guardrails for your organization.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-bold text-sm text-dada-950">Earned Wage Access (EWA) Guardrails</h3>
          <p className="text-xs text-slate-400">Rules governing short-term daily earned wage withdrawals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Max EWA Percentage of Accrued Wages (%)</label>
            <input
              type="number"
              min="10"
              max="100"
              value={policy?.maxEwaPercentage || 50}
              onChange={(e) => setPolicy({ ...policy, maxEwaPercentage: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Max Withdrawals per Salary Cycle</label>
            <input
              type="number"
              min="1"
              max="5"
              value={policy?.maxEwaWithdrawalsPerCycle || 2}
              onChange={(e) => setPolicy({ ...policy, maxEwaWithdrawalsPerCycle: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Monthly Payroll Cutoff Day (1 - 28)</label>
            <input
              type="number"
              min="1"
              max="28"
              value={policy?.payrollCutoffDay || 25}
              onChange={(e) => setPolicy({ ...policy, payrollCutoffDay: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Freeze Days Prior to Cutoff</label>
            <input
              type="number"
              min="0"
              max="5"
              value={policy?.payrollFreezeDaysBeforeCutoff || 0}
              onChange={(e) => setPolicy({ ...policy, payrollFreezeDaysBeforeCutoff: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
            />
          </div>
        </div>

        <div className="border-b border-slate-100 pb-4 pt-4">
          <h3 className="font-bold text-sm text-dada-950">Corporate Payroll Loan Rules</h3>
          <p className="text-xs text-slate-400">Rules governing term loans repaid via multi-month payroll deductions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Salary Multiplier (Max Loan Principal)</label>
            <input
              type="number"
              min="1"
              max="6"
              value={policy?.salaryMultiplier || 3}
              onChange={(e) => setPolicy({ ...policy, salaryMultiplier: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Max Fixed Obligation to Income Ratio (FOIR %)</label>
            <input
              type="number"
              min="20"
              max="70"
              value={policy?.maxFoirPercent || 50}
              onChange={(e) => setPolicy({ ...policy, maxFoirPercent: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
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
    </div>
  );
}
