'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function HrAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [newDays, setNewDays] = useState(15);
  const [newPaidLeave, setNewPaidLeave] = useState(2);
  const [notes, setNotes] = useState('Leave audit correction');
  const [correctionResult, setCorrectionResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/attendance');
        setRecords(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCorrect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const res = await apiRequest(`/attendance/${selectedRecord.employeeId}/correction`, {
        method: 'POST',
        body: JSON.stringify({
          month: 11,
          year: 2026,
          newDaysPresent: newDays,
          newPaidLeaveDays: newPaidLeave,
          notes,
        }),
      });
      setCorrectionResult(res);
      // Reload records
      const updated = await apiRequest('/attendance');
      setRecords(updated || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-dada-950">Attendance & Leave Ledger</h1>
        <p className="text-xs text-slate-500">
          Monthly verified attendance used to compute daily earned wages and EWA withdrawal limits.
        </p>
      </div>

      {correctionResult && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-amber-900 shadow-sm">
          <div className="font-bold flex items-center gap-2 text-amber-800 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Attendance Correction Applied & EWA Recalculated</span>
          </div>
          <p>{correctionResult.message}</p>
          {correctionResult.exceptionCreated && (
            <div className="p-3 bg-white rounded-lg border border-amber-300 font-semibold text-rose-800">
              ⚠️ Reconciliation Exception Logged: Overdraw detected. Existing disbursed loan remains strictly preserved.
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Payable Days</th>
              <th className="py-3.5 px-4">Days Present</th>
              <th className="py-3.5 px-4">Paid Leave</th>
              <th className="py-3.5 px-4">Loss of Pay (LOP)</th>
              <th className="py-3.5 px-4">Approved Total</th>
              <th className="py-3.5 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-dada-950">
                  {r.employee?.firstName} {r.employee?.lastName}
                  <div className="text-[10px] text-slate-400 font-mono">{r.employee?.employeeCode}</div>
                </td>
                <td className="py-3.5 px-4">{r.totalPayableDays}</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-700">{r.daysPresent}</td>
                <td className="py-3.5 px-4">{r.paidLeaveDays}</td>
                <td className="py-3.5 px-4 text-rose-600 font-semibold">{r.lossOfPayDays}</td>
                <td className="py-3.5 px-4 font-bold">{r.totalApprovedWorkedDays} Days</td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      setSelectedRecord(r);
                      setNewDays(r.daysPresent);
                      setNewPaidLeave(r.paidLeaveDays);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                  >
                    Correct Attendance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attendance Correction Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div>
              <h3 className="font-extrabold text-base text-dada-950">
                Correct Attendance: {selectedRecord.employee?.firstName} {selectedRecord.employee?.lastName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Notice: Correcting attendance will automatically recalculate remaining EWA eligibility. Any existing disbursed loan is preserved without mutation.
              </p>
            </div>

            <form onSubmit={handleCorrect} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase">New Days Present</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={newDays}
                  onChange={(e) => setNewDays(Number(e.target.value))}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">New Paid Leave Days</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={newPaidLeave}
                  onChange={(e) => setNewPaidLeave(Number(e.target.value))}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Reason / Audit Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-lg shadow"
                >
                  Apply & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
