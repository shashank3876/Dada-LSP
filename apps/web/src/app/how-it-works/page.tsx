import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileCheck, Landmark, Building2, Users } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          How Dada Advisory Operates
        </h1>
        <p className="text-base text-slate-600">
          A transparent, tripartite ecosystem connecting Corporate Employers, Employees, and Regulated Financial Institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-xl font-bold text-dada-950">For Employees</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access pre-approved credit directly through the employee self-service portal. Complete digital KYC with PAN and Aadhaar OTP, accept NBFC loan terms via e-Sign, and receive direct disbursement into your salary bank account within minutes.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-dada-100 text-dada-800 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-xl font-bold text-dada-950">For Corporate HR</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sync employee roster and monthly attendance via HRMS integrations (Keka, Darwinbox) or CSV. On payroll cutoff day, export the automated deduction batch, deduct loan installments, and remit directly to the partner NBFC escrow account.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-xl font-bold text-dada-950">For Partner NBFCs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            NBFC partners receive verified applications through standardized API abstractions. The NBFC underwrites the borrower, issues the Key Fact Statement (KFS), directly disburses funds, and receives reconciled payroll repayments.
          </p>
        </div>
      </div>
    </div>
  );
}
