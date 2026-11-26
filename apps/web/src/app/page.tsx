'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  Zap,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Landmark,
  BadgePercent,
  FileCheck2,
} from 'lucide-react';
import Calculator from '@/components/calculators/Calculator';

export default function HomePage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-16 pb-20 bg-gradient-to-b from-slate-100/80 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compliant Lending Service Provider (LSP) Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dada-950 tracking-tight leading-tight">
              Responsible Workplace Credit for <span className="text-emerald-600">Modern India</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              Empower your corporate workforce with ethical, salary-linked credit solutions. Access wages earned on demand or affordable personal loans disbursed directly by RBI-registered NBFC partners.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/login"
                className="px-6 py-3.5 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span>Access Employee Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-300"
              >
                <span>Explore Products</span>
              </Link>
            </div>
          </div>

          {/* Interactive Calculator Front & Center */}
          <div className="max-w-5xl mx-auto mt-8">
            <Calculator />
          </div>
        </div>
      </section>

      {/* Two Flagship Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Tailored Financial Solutions
          </h2>
          <p className="text-3xl font-extrabold text-dada-950">
            Two Lending Products, One Unified Platform
          </p>
          <p className="text-sm text-slate-600">
            Designed to address emergency mid-month liquidity as well as planned milestone investments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* EWA Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-dada-950">Earned Wage Access (EWA)</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Allow employees to access up to 50% of the wages they have already earned before payday. Zero loan liability, zero interest, flat nominal convenience fee.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Withdraw up to ₹50,000 against approved attendance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0% Interest — flat transparent fee (₹99)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto-repaid via payroll deduction on salary day</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/products/earned-wage-access"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>Learn more about EWA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Payroll Loan Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-dada-100 text-dada-900 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6 text-dada-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-dada-950">Corporate Payroll Loan</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Salary-linked personal loans up to 3x monthly net salary with reducing-balance EMI schedules. Fully paperless underwriting powered by partner NBFCs.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-dada-700 shrink-0" />
                  <span>Flexible tenure: 6, 12, 18, 24 to 36 months</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-dada-700 shrink-0" />
                  <span>Reducing-balance interest rates starting at 11.5% p.a.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-dada-700 shrink-0" />
                  <span>Digital e-KYC, e-Sign and e-NACH mandate</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/products/payroll-loan"
                className="inline-flex items-center gap-2 text-sm font-bold text-dada-700 hover:text-dada-900"
              >
                <span>Learn more about Payroll Loans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works 4-Step Diagram */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Technology Workflow
            </h2>
            <p className="text-3xl font-extrabold text-white">How the Platform Works</p>
            <p className="text-sm text-slate-400">
              A compliant, four-step digital journey connecting employee, employer, and partner NBFC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Check Eligibility',
                desc: 'Employee checks live EWA or loan eligibility computed directly from verified HR attendance and salary records.',
                icon: FileCheck2,
              },
              {
                step: '02',
                title: 'Digital KYC & KFS',
                desc: 'Instant PAN, Aadhaar OTP verification and Key Fact Statement (KFS) review with clear repayment terms.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Direct Disbursement',
                desc: 'Partner NBFC performs final underwriting and transfers funds directly to the employee salary bank account.',
                icon: Landmark,
              },
              {
                step: '04',
                title: 'Payroll Recovery',
                desc: 'Employer deducts installment from next salary and remits the batch directly to NBFC escrow account.',
                icon: Clock,
              },
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-extrabold text-emerald-400 tracking-wider">
                    STEP {s.step}
                  </div>
                  <s.icon className="w-5 h-5 text-slate-400" />
                </div>
                <h4 className="text-lg font-bold text-white">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Regulatory Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 rounded-2xl p-8 md:p-12 border border-emerald-200 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="text-3xl font-extrabold text-dada-950">100%</div>
            <div className="text-sm font-bold text-emerald-800">Direct NBFC Disbursement</div>
            <p className="text-xs text-slate-600">
              Dada never pools, holds, or routes borrower funds. Loans are disbursed by regulated NBFCs.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-extrabold text-dada-950">Zero</div>
            <div className="text-sm font-bold text-emerald-800">Hidden Fees or Penalties</div>
            <p className="text-xs text-slate-600">
              Clear Key Fact Statements (KFS) provided upfront before agreement signing.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-extrabold text-dada-950">Seamless</div>
            <div className="text-sm font-bold text-emerald-800">HRMS Integration</div>
            <p className="text-xs text-slate-600">
              Pre-integrated with Keka, Darwinbox, GreytHR, and manual CSV reconciliation workflows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
