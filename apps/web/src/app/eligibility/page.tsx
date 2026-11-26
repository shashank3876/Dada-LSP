'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, ShieldCheck, Mail, Building2, Lock, ArrowRight, FileText } from 'lucide-react';

export default function EligibilityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Underwriting Standards • RBI DLG Compliant</span>
        </div>
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          Eligibility & Policy Guidelines
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Standardized criteria for salaried corporate employees to access workplace credit with our partner Non-Banking Financial Companies (NBFCs).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
          <h3 className="text-xl font-extrabold text-dada-950">Employee Eligibility Criteria</h3>
          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Corporate Employment:</strong> Full-time, confirmed salaried employee of an onboarded corporate employer.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Minimum Net Income:</strong> ₹20,000 per month credited directly to bank account.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Age Parameters:</strong> 21 to 58 years of age at the time of application.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Active Salary Account:</strong> Salary bank account in India with verified IFSC and net banking / debit card for e-NACH mandate.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Digital Verification:</strong> Valid PAN and Aadhaar linked with active mobile number for DigiLocker OTP e-KYC.</span>
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

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
          <h3 className="text-xl font-extrabold text-dada-950">Required Verification (100% Digital)</h3>
          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span><strong>PAN Card Verification:</strong> Verified in real-time via NSDL / Protean API.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span><strong>Aadhaar e-KYC:</strong> Paperless OTP authentication through UIDAI / DigiLocker.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span><strong>Bank Account Penny Drop:</strong> Automated micro-deposit verifying matching name on salary account.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span><strong>Corporate Email OTP:</strong> Dual verification code dispatched to registered corporate email and mobile.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span><strong>e-NACH Mandate:</strong> NPCI digital standing instruction for effortless payroll auto-debit.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Questions on criteria?</span>
            <a href="mailto:support@dadaadvisoryservices.com" className="font-bold text-emerald-700 hover:underline">
              support@dadaadvisoryservices.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
