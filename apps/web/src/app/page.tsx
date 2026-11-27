'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Lock,
  ChevronRight,
  HelpCircle,
  Award,
  Sparkles,
  Percent,
  FileText,
  CreditCard,
  PhoneCall,
  Mail,
  AlertCircle,
} from 'lucide-react';
import Calculator from '@/components/calculators/Calculator';

export default function HomePage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section with Official Gold Medallion Logo & Institutional Highlights */}
      <section className="relative overflow-hidden pt-12 md:pt-16 pb-20 bg-gradient-to-b from-amber-50/50 via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>RBI Regulated Digital Lending (DLG) Compliant Platform</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dada-950 tracking-tight leading-[1.15]">
                Corporate Personal Loans & Salary Advance up to{' '}
                <span className="text-amber-600 underline decoration-amber-400/60 decoration-wavy">
                  ₹5,00,000
                </span>
              </h1>

              <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-2xl">
                Dada Advisory Services LLP is an enterprise Digital Loan Service Provider (LSP). In partnership with RBI-regulated NBFCs, we provide corporate employees with transparent personal loans starting from <strong>11.5% p.a.</strong> and instant on-demand Earned Wage Access.
              </p>

              {/* Quick Feature Chips (Modeled after DMI Finance & L&T Finance) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-semibold text-slate-800">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Interest Rate</span>
                  <span className="text-base font-extrabold text-amber-700">From 11.5%</span>
                  <span className="text-[10px] text-slate-500">Reducing p.a.</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Loan Tenure</span>
                  <span className="text-base font-extrabold text-slate-900">6 to 36</span>
                  <span className="text-[10px] text-slate-500">Months EMI</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Disbursement</span>
                  <span className="text-base font-extrabold text-emerald-700">Direct Escrow</span>
                  <span className="text-[10px] text-slate-500">Direct to Salary A/C</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Collateral</span>
                  <span className="text-base font-extrabold text-slate-900">Zero</span>
                  <span className="text-[10px] text-slate-500">100% Unsecured</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/login"
                  className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 border border-slate-800"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Sign In & Check Eligibility</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/products/payroll-loan"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-sm transition-all border border-slate-300 shadow-sm"
                >
                  <span>Explore Loan Details</span>
                </Link>
              </div>
            </div>

            {/* Right: Official Medallion Emblem Badge Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-300 shadow-2xl max-w-sm w-full text-center space-y-5">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-amber-500/90 shadow-xl bg-amber-50/50">
                  <Image
                    src="/logo.png"
                    alt="Dada Advisory Services LLP Seal"
                    width={220}
                    height={220}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-dada-950 tracking-tight">
                    Dada Advisory Services LLP
                  </h3>
                  <p className="text-xs font-bold text-amber-700 tracking-wider uppercase mt-0.5">
                    Digital Loan Service Provider
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Facilitating ethical digital credit in partnership with RBI-regulated NBFCs. Disbursed directly from lender escrow to salary account.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No Hidden Fees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>KFS Upfront</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Front & Center */}
          <div className="max-w-5xl mx-auto mt-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-dada-950">
                Interactive Loan & Wage Advance Calculator
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Calculate your exact monthly EMI or on-demand wage advance with transparent reducing interest.
              </p>
            </div>
            <Calculator />
          </div>
        </div>
      </section>

      {/* Product Snapshot & Key Comparison Table (Directly modeled on DMI Finance & L&T Finance) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Institutional Transparency
          </div>
          <h2 className="text-3xl font-extrabold text-dada-950 tracking-tight">
            Key Product Parameters & Specifications
          </h2>
          <p className="text-sm text-slate-600">
            Compare our corporate financial solutions side-by-side with full regulatory fee disclosures.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
            <thead className="bg-slate-900 text-white border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold w-1/4">Parameters</th>
                <th className="py-4 px-6 font-bold text-emerald-400 w-1/4">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Product A</div>
                  <div>Instant EWA</div>
                </th>
                <th className="py-4 px-6 font-bold text-amber-400 w-1/4">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Product B</div>
                  <div>Salary Advance Loan</div>
                </th>
                <th className="py-4 px-6 font-bold text-blue-400 w-1/4">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Product C</div>
                  <div>Instant Personal Loan</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Loan Ticket Size</td>
                <td className="py-3 px-6 font-extrabold text-slate-900">₹5,000 – ₹50,000</td>
                <td className="py-3 px-6 font-extrabold text-slate-900">₹20,000 – ₹1,00,000</td>
                <td className="py-3 px-6 font-extrabold text-slate-900">₹50,000 – ₹2,00,000</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Loan Capping</td>
                <td className="py-3 px-6 font-medium">50%–70% of accrued net salary</td>
                <td className="py-3 px-6 font-medium">Up to 2x monthly net salary</td>
                <td className="py-3 px-6 font-medium">Up to 3x monthly net salary</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Tenure & Repayment</td>
                <td className="py-3 px-6">Up to 30 Days (Bullet recovery)</td>
                <td className="py-3 px-6">Up to 3 Months (EMIs)</td>
                <td className="py-3 px-6">3 to 10 Months (EMIs)</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Pricing / Interest</td>
                <td className="py-3 px-6 font-bold text-emerald-700">26% p.a.</td>
                <td className="py-3 px-6 font-bold text-amber-700">28% p.a. (reducing)</td>
                <td className="py-3 px-6 font-bold text-blue-700">24% – 30% p.a. (reducing)</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Processing Fee (PF)</td>
                <td className="py-3 px-6">Flat 3% upfront</td>
                <td className="py-3 px-6">Flat 4% upfront</td>
                <td className="py-3 px-6">Flat 4% upfront</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Disbursal Speed</td>
                <td className="py-3 px-6 font-bold text-emerald-700">Under 10 Minutes (24x7)</td>
                <td className="py-3 px-6 font-bold text-amber-700">Under 30 Minutes</td>
                <td className="py-3 px-6 font-bold text-blue-700">Under 2 Hours</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Repayment Mode</td>
                <td className="py-3 px-6">Payroll deduction / e-NACH</td>
                <td className="py-3 px-6">e-NACH / UPI AutoPay</td>
                <td className="py-3 px-6">e-NACH / UPI AutoPay</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Target Segment</td>
                <td className="py-3 px-6">Corporate salaried employees</td>
                <td className="py-3 px-6">Salaried employees (tie-up/direct)</td>
                <td className="py-3 px-6">Salaried & self-employed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Eligibility & Documents Checklist (Inspired by L&T Finance & DMI Finance) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eligibility Card */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-dada-950">
                  Eligibility Criteria
                </h3>
                <p className="text-xs text-slate-600">Standard criteria for salaried employees</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Employment Type:</strong> Salaried employee confirmed with an active partner corporate employer.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Age Requirement:</strong> Minimum 21 years up to 58 years at loan maturity.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Minimum Net Monthly Income:</strong> ₹20,000 per month credited directly to bank account.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Employment Tenure:</strong> Minimum 3 months with current employer (or confirmed probation completion).
                </div>
              </li>
            </ul>
          </div>

          {/* Documents Required Card */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <FileText className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-dada-950">
                  Documents Required (100% Paperless)
                </h3>
                <p className="text-xs text-slate-600">Digital verification via DigiLocker & e-KYC</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Identity Proof:</strong> PAN Card & Aadhaar (verified via instant OTP through DigiLocker).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Salary Verification:</strong> Automated corporate HRMS sync (Keka, Darwinbox) or last 3 months salary slips.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Bank Account Proof:</strong> Last 3 months bank statements showing regular salary credits.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <strong>Mandate Setup:</strong> Active Net Banking credentials or Debit Card to authenticate e-NACH auto-debit.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How the 4-Step Digital Process Works */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Simple 4-Step Digital Journey
            </h2>
            <p className="text-3xl font-extrabold text-white">How Your Loan Is Processed</p>
            <p className="text-sm text-slate-400">
              A transparent, paperless lending workflow adhering strictly to RBI digital lending norms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Check Eligibility',
                desc: 'Sign in to the employee portal. Eligibility is dynamically verified in real-time from verified corporate salary records.',
                icon: FileCheck2,
              },
              {
                step: '02',
                title: 'Digital e-KYC & KFS',
                desc: 'Complete instant paperless Aadhaar & PAN verification. Review your Key Fact Statement (KFS) with total interest & fees upfront.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'e-Sign & Mandate',
                desc: 'Digitally e-sign the loan sanction agreement and link your salary bank account via NPCI e-NACH mandate.',
                icon: CreditCard,
              },
              {
                step: '04',
                title: 'Direct Disbursement',
                desc: 'Partner NBFC disburses sanctioned loan funds directly from its escrow account into your verified salary bank account within hours.',
                icon: Landmark,
              },
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-extrabold text-amber-400 tracking-wider">
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

      {/* Institutional Support & Corporate Partnerships Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>For Corporate Employers & Enterprise HRs</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Empower Your Workforce with Ethical Credit
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Zero balance-sheet liability for employers. Pre-built API connectors for Darwinbox, Keka, GreytHR, and SAP SuccessFactors. Reduce employee attrition and eliminate predatory payday loans.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Financial Liability</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated Payroll Deductions</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Corporate Setup</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-850/80 p-6 rounded-2xl border border-slate-700 space-y-4">
            <h4 className="font-bold text-sm text-white border-b border-slate-700 pb-2">
              Direct Contact & Enterprise Support
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Corporate Partnerships:</span>
                  <a href="mailto:connect@dadaadvisoryservices.com" className="font-bold text-amber-400 hover:underline">
                    connect@dadaadvisoryservices.com
                  </a>
                </div>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Borrower & Employee Support:</span>
                  <a href="mailto:support@dadaadvisoryservices.com" className="font-bold text-emerald-400 hover:underline">
                    support@dadaadvisoryservices.com
                  </a>
                </div>
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Customer Grievance Redressal SLA: Initial response within 24–48 business hours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
