'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileCheck, Landmark, Building2, Users, ArrowRight, Lock, CheckCircle2, Mail } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Tripartite Architecture • Zero Balance Sheet Holding</span>
        </div>
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          How Dada Bridge Operates
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Dada Bridge is a compliant, tripartite digital ecosystem connecting Corporate Employers, Employees, and Regulated Financial Institutions (Banks & NBFCs) under RBI Digital Lending Guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-extrabold text-lg border border-amber-200">
              1
            </div>
            <h3 className="text-xl font-bold text-dada-950">For Employees</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access pre-approved credit directly through the employee self-service portal. Complete digital KYC with PAN and Aadhaar OTP, review your Key Fact Statement (KFS), accept NBFC loan terms via digital e-Sign, and receive direct disbursement into your salary bank account within minutes.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant loan calculation & KFS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% paperless digital sanction</span>
              </li>
            </ul>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 pt-4 border-t border-slate-100"
          >
            <span>Employee Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-dada-950">For Corporate HR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sync employee roster and monthly attendance via HRMS integrations (Keka, Darwinbox, GreytHR) or encrypted CSV. On payroll cutoff day, export the automated deduction batch, deduct loan installments from salary, and remit directly to the partner NBFC escrow account with zero employer liability.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero financial liability for employer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Automated payroll reconciliation</span>
              </li>
            </ul>
          </div>
          <a
            href="mailto:connect@dadaadvisoryservices.com"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-amber-700 pt-4 border-t border-slate-100"
          >
            <span>Corporate HR Onboarding</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-extrabold text-lg border border-emerald-200">
              3
            </div>
            <h3 className="text-xl font-bold text-dada-950">For Partner NBFCs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              NBFC partners receive verified applications through standardized API abstractions. The NBFC underwrites the borrower, issues the Key Fact Statement (KFS), directly disburses funds from its escrow account into the employee’s salary bank account, and receives reconciled payroll repayments.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Escrow-to-salary direct disbursement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Real-time webhook reconciliation</span>
              </li>
            </ul>
          </div>
          <a
            href="mailto:connect@dadaadvisoryservices.com"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 pt-4 border-t border-slate-100"
          >
            <span>NBFC Partnership Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
