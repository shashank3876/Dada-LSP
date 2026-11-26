import React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function EligibilityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          Eligibility & Policy Guidelines
        </h1>
        <p className="text-base text-slate-600">
          Criteria for employees and corporate employers to participate in Dada Advisory lending solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-dada-950">Employee Eligibility Criteria</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Full-time salaried employee of an onboarded corporate partner</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Minimum net monthly salary of ₹15,000</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Active salary bank account in India with verified IFSC</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Valid PAN and Aadhaar linked with mobile for digital KYC</span>
            </li>
          </ul>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Notice Period & Suspension Policy</span>
            </div>
            <p>
              In accordance with risk guidelines, employees currently serving notice period, suspended, or under resignation review have zero eligibility for new EWA or payroll loan advances.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-dada-950">Required Documents</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-dada-700 mt-0.5 shrink-0" />
              <span>PAN Card copy (verified instantly via NSDL)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-dada-700 mt-0.5 shrink-0" />
              <span>Aadhaar number (paperless UIDAI OTP verification)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-dada-700 mt-0.5 shrink-0" />
              <span>Bank account verification (Penny-drop name confirmation)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-dada-700 mt-0.5 shrink-0" />
              <span>Corporate employment email confirmation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
