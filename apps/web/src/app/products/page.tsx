'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  Percent,
  FileText,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  BadgePercent,
  Sliders,
  ChevronRight,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface ProductSpec {
  id: 'product-a' | 'product-b' | 'product-c';
  code: 'Product A' | 'Product B' | 'Product C';
  displayName: string;
  tagline: string;
  badge: string;
  badgeVariant: 'emerald' | 'amber' | 'blue';
  targetSegment: string;
  loanTicketSize: string;
  cappingLoanAmount: string;
  tenureRepayment: string;
  pricingInterest: string;
  processingFees: string;
  repaymentMode: string;
  underwritingInputs: string;
  disbursalTime: string;
  applyHref: string;
  highlights: string[];
}

const PRODUCTS: ProductSpec[] = [
  {
    id: 'product-a',
    code: 'Product A',
    displayName: 'Instant Earned Wage Access (EWA)',
    tagline: 'Access your already-earned salary anytime before payday.',
    badge: 'Instant Liquidity • Under 10 Mins',
    badgeVariant: 'emerald',
    targetSegment: 'Corporate salaried employees (via HRMS/employer tie-up)',
    loanTicketSize: '₹5,000 – ₹50,000',
    cappingLoanAmount: '50%–70% of accrued monthly net salary',
    tenureRepayment: 'Up to 30 Days (Bullet repayment on next salary credit date)',
    pricingInterest: '26% p.a.',
    processingFees: 'Flat upfront Processing fee (e.g., 3% of loan amount)',
    repaymentMode: 'Employer payroll deduction OR e-NACH / UPI AutoPay on salary date',
    underwritingInputs: 'HR attendance/payroll API + PAN/Aadhaar KYC',
    disbursalTime: 'Under 10 Minutes (24x7 instant IMPS/UPI)',
    applyHref: '/employee/ewa/apply',
    highlights: [
      'Zero balance sheet debt facility',
      'No credit score check required',
      'Direct IMPS transfer to salary account',
      'Auto-deducted on monthly payroll day',
    ],
  },
  {
    id: 'product-b',
    code: 'Product B',
    displayName: 'Salary Advance Loan',
    tagline: 'Bigger emergencies covered - repay easily in up to 3 EMIs.',
    badge: 'Short-Term Credit • Up to 3 EMIs',
    badgeVariant: 'amber',
    targetSegment: 'Verified salaried employees (corporate tie-up or direct)',
    loanTicketSize: '₹20,000 – ₹1,00,000',
    cappingLoanAmount: 'Up to 2x monthly net salary (subject to max Loan Ticket Size)',
    tenureRepayment: 'Up to 3 Months (Equal Monthly Installments – EMIs)',
    pricingInterest: '28% p.a. (reducing balance)',
    processingFees: 'Flat upfront Processing fee (e.g., 4% of loan amount)',
    repaymentMode: 'e-NACH Mandate / UPI AutoPay from salary bank account',
    underwritingInputs: "6 months' bank statement (AA/BankConnect) + salary slip + CIBIL Bureau score",
    disbursalTime: 'Under 30 Minutes (During working hours)',
    applyHref: '/employee/payroll-loan/apply',
    highlights: [
      'Repay over 3 manageable monthly installments',
      'Digital e-NACH auto-debit on salary date',
      'Instant sanction via Account Aggregator',
      'Zero foreclosure charges after 1st EMI',
    ],
  },
  {
    id: 'product-c',
    code: 'Product C',
    displayName: 'Instant Personal Loan',
    tagline: 'Flexible personal credit for salaried employed needs.',
    badge: 'High Limit • 3 to 10 EMIs',
    badgeVariant: 'blue',
    targetSegment: 'Verified salaried employees (corporate tie-up or direct) & self-employed individuals',
    loanTicketSize: '₹50,000 – ₹2,00,000',
    cappingLoanAmount: 'Up to 3x monthly net salary (subject to max Loan Ticket Size)',
    tenureRepayment: '3 to 10 Months (Equal Monthly Installments – EMIs)',
    pricingInterest: '24% – 30% p.a. (reducing balance)',
    processingFees: 'Flat upfront Processing fee (e.g., 4% of loan amount)',
    repaymentMode: 'e-NACH Mandate / UPI AutoPay',
    underwritingInputs: "6 months' bank statement (AA/BankConnect) + salary slip + CIBIL Bureau score (CIBIL 680+) + 12 months' AA bank statement",
    disbursalTime: 'Under 2 Hours (During working hours)',
    applyHref: '/employee/payroll-loan/apply',
    highlights: [
      'Tenures from 3 to 10 months for planned expenses',
      'Salaried & self-employed professionals eligible',
      'Transparent APR disclosure with full KFS',
      'Disbursal directly from RBI-registered NBFC escrow',
    ],
  },
];

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductSpec>(PRODUCTS[0]);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Header & Context */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>RBI Regulated Digital Lending (DLG) Product Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-dada-950 tracking-tight leading-tight">
          Workplace Credit & Personal Financing
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Hover your cursor over any product card below to inspect its live specifications, interest rates, tenure, and underwriting parameters.
        </p>
      </div>

      {/* SECTION 1: Interactive Hover Product Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h2 className="text-lg font-bold text-dada-950">Select or Hover a Product Card</h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Hover over cards to see live specifications below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <div
                key={prod.id}
                onMouseEnter={() => setSelectedProduct(prod)}
                onClick={() => setSelectedProduct(prod)}
                className={`relative p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? prod.id === 'product-a'
                      ? 'bg-gradient-to-b from-emerald-50/70 via-white to-white border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02] ring-2 ring-emerald-500/30'
                      : prod.id === 'product-b'
                      ? 'bg-gradient-to-b from-amber-50/70 via-white to-white border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02] ring-2 ring-amber-500/30'
                      : 'bg-gradient-to-b from-blue-50/70 via-white to-white border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02] ring-2 ring-blue-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                {/* Active Indicator Pin */}
                {isSelected && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider shadow">
                    Active Inspection
                  </div>
                )}

                <div className="space-y-4">
                  {/* Badge & Code */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        prod.id === 'product-a'
                          ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                          : prod.id === 'product-b'
                          ? 'bg-amber-100/70 text-amber-800 border-amber-200'
                          : 'bg-blue-100/70 text-blue-800 border-blue-200'
                      }`}
                    >
                      {prod.code}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{prod.disbursalTime.split('(')[0].trim()}</span>
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-extrabold text-dada-950 leading-snug">
                      {prod.displayName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      &ldquo;{prod.tagline}&rdquo;
                    </p>
                  </div>

                  {/* Key Highlights Quick Peek */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Ticket Size:</span>
                      <span className="text-base font-extrabold text-slate-900">{prod.loanTicketSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Tenure:</span>
                      <span className="text-xs font-bold text-slate-800">{prod.tenureRepayment.split('(')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Interest:</span>
                      <span
                        className={`text-xs font-bold ${
                          prod.id === 'product-a'
                            ? 'text-emerald-700'
                            : prod.id === 'product-b'
                            ? 'text-amber-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {prod.pricingInterest}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span
                    className={
                      isSelected
                        ? prod.id === 'product-a'
                          ? 'text-emerald-700'
                          : prod.id === 'product-b'
                          ? 'text-amber-700'
                          : 'text-blue-700'
                        : 'text-slate-500'
                    }
                  >
                    {isSelected ? 'Viewing Full Details ↓' : 'Hover to Inspect Details'}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'rotate-90 text-slate-900' : 'text-slate-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 2: Dynamic Detailed Inspector Panel (Revealed on Hover) */}
        <div
          className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 shadow-lg ${
            selectedProduct.id === 'product-a'
              ? 'bg-gradient-to-b from-emerald-50/40 via-white to-white border-emerald-300 shadow-emerald-500/5'
              : selectedProduct.id === 'product-b'
              ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-300 shadow-amber-500/5'
              : 'bg-gradient-to-b from-blue-50/40 via-white to-white border-blue-300 shadow-blue-500/5'
          }`}
        >
          {/* Header Bar of Detailed Inspector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                    selectedProduct.id === 'product-a'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : selectedProduct.id === 'product-b'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-blue-100 text-blue-900 border-blue-300'
                  }`}
                >
                  {selectedProduct.code} Specification
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  RBI DLG Regulated Lending Offering
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-dada-950">
                {selectedProduct.displayName}
              </h3>
              <p className="text-sm sm:text-base font-semibold text-slate-700 italic">
                &ldquo;{selectedProduct.tagline}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${
                  selectedProduct.id === 'product-a'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : selectedProduct.id === 'product-b'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <span>Apply for {selectedProduct.displayName.split('(')[0].trim()}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Key Metric Parameter Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-8 border-b border-slate-200">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Loan Ticket Size
              </span>
              <div className="text-base sm:text-lg font-extrabold text-dada-950">
                {selectedProduct.loanTicketSize}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Loan Capping
              </span>
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                {selectedProduct.cappingLoanAmount}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tenure & Repayment
              </span>
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                {selectedProduct.tenureRepayment.split('(')[0]}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Interest Rate
              </span>
              <div
                className={`text-base sm:text-lg font-extrabold ${
                  selectedProduct.id === 'product-a'
                    ? 'text-emerald-700'
                    : selectedProduct.id === 'product-b'
                    ? 'text-amber-700'
                    : 'text-blue-700'
                }`}
              >
                {selectedProduct.pricingInterest}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Processing Fee
              </span>
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                {selectedProduct.processingFees.split('(')[0]}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Disbursal Speed
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-emerald-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedProduct.disbursalTime.split('(')[0]}</span>
              </div>
            </div>
          </div>

          {/* Underwriting & Operations Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-xs">
            <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-sm text-dada-950">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Target Segment</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {selectedProduct.targetSegment}
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-sm text-dada-950">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Repayment Mechanism</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {selectedProduct.repaymentMode}
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-sm text-dada-950">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Underwriting Inputs</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {selectedProduct.underwritingInputs}
              </p>
            </div>
          </div>

          {/* Feature Highlights List */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <span className="text-slate-500 uppercase tracking-wider text-[11px]">Key Highlights:</span>
            {selectedProduct.highlights.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{h}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Side-by-Side Comprehensive Specification Table */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-dada-950">
              Comprehensive 3-Way Specification Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side technical parameters under Reserve Bank of India Digital Lending Guidelines (DLG).
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Hover over table columns or cards above to cross-reference
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
            <thead className="bg-slate-950 text-white border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold w-1/4 uppercase tracking-wider text-xs text-slate-400">
                  Parameter
                </th>
                <th
                  onMouseEnter={() => setHoveredColumn('product-a')}
                  onMouseLeave={() => setHoveredColumn(null)}
                  className={`py-4 px-6 font-bold w-1/4 transition-colors ${
                    hoveredColumn === 'product-a' || selectedProduct.id === 'product-a'
                      ? 'bg-slate-900 text-emerald-400 ring-2 ring-emerald-500/50'
                      : 'text-emerald-400'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 font-semibold">Product A</div>
                  <div className="text-sm font-extrabold">Instant Earned Wage Access (EWA)</div>
                </th>
                <th
                  onMouseEnter={() => setHoveredColumn('product-b')}
                  onMouseLeave={() => setHoveredColumn(null)}
                  className={`py-4 px-6 font-bold w-1/4 transition-colors ${
                    hoveredColumn === 'product-b' || selectedProduct.id === 'product-b'
                      ? 'bg-slate-900 text-amber-400 ring-2 ring-amber-500/50'
                      : 'text-amber-400'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 font-semibold">Product B</div>
                  <div className="text-sm font-extrabold">Salary Advance Loan</div>
                </th>
                <th
                  onMouseEnter={() => setHoveredColumn('product-c')}
                  onMouseLeave={() => setHoveredColumn(null)}
                  className={`py-4 px-6 font-bold w-1/4 transition-colors ${
                    hoveredColumn === 'product-c' || selectedProduct.id === 'product-c'
                      ? 'bg-slate-900 text-blue-400 ring-2 ring-blue-500/50'
                      : 'text-blue-400'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 font-semibold">Product C</div>
                  <div className="text-sm font-extrabold">Instant Personal Loan</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {/* Tagline */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Tagline (UI Hero)</td>
                <td className={`py-3.5 px-6 font-medium italic ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  &ldquo;{PRODUCTS[0].tagline}&rdquo;
                </td>
                <td className={`py-3.5 px-6 font-medium italic ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  &ldquo;{PRODUCTS[1].tagline}&rdquo;
                </td>
                <td className={`py-3.5 px-6 font-medium italic ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  &ldquo;{PRODUCTS[2].tagline}&rdquo;
                </td>
              </tr>

              {/* Target Segment */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Target Segment</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].targetSegment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].targetSegment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].targetSegment}
                </td>
              </tr>

              {/* Loan Ticket Size */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Loan Ticket Size</td>
                <td className={`py-3.5 px-6 font-extrabold text-slate-900 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].loanTicketSize}
                </td>
                <td className={`py-3.5 px-6 font-extrabold text-slate-900 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].loanTicketSize}
                </td>
                <td className={`py-3.5 px-6 font-extrabold text-slate-900 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].loanTicketSize}
                </td>
              </tr>

              {/* Capping Loan Amount */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Loan Capping</td>
                <td className={`py-3.5 px-6 font-semibold text-slate-800 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].cappingLoanAmount}
                </td>
                <td className={`py-3.5 px-6 font-semibold text-slate-800 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].cappingLoanAmount}
                </td>
                <td className={`py-3.5 px-6 font-semibold text-slate-800 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].cappingLoanAmount}
                </td>
              </tr>

              {/* Tenure & Repayment */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Tenure & Repayment</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].tenureRepayment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].tenureRepayment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].tenureRepayment}
                </td>
              </tr>

              {/* Pricing / Interest */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Pricing / Interest</td>
                <td className={`py-3.5 px-6 font-bold text-emerald-700 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].pricingInterest}
                </td>
                <td className={`py-3.5 px-6 font-bold text-amber-700 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].pricingInterest}
                </td>
                <td className={`py-3.5 px-6 font-bold text-blue-700 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].pricingInterest}
                </td>
              </tr>

              {/* Processing Fees */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Processing Fees (PF)</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].processingFees}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].processingFees}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].processingFees}
                </td>
              </tr>

              {/* Repayment Mode */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Repayment Mode</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].repaymentMode}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].repaymentMode}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].repaymentMode}
                </td>
              </tr>

              {/* Underwriting Inputs */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Underwriting Inputs</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].underwritingInputs}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].underwritingInputs}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].underwritingInputs}
                </td>
              </tr>

              {/* Disbursal Time */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Disbursal Time</td>
                <td className={`py-3.5 px-6 font-bold text-emerald-700 ${hoveredColumn === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].disbursalTime}
                </td>
                <td className={`py-3.5 px-6 font-bold text-amber-700 ${hoveredColumn === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].disbursalTime}
                </td>
                <td className={`py-3.5 px-6 font-bold text-blue-700 ${hoveredColumn === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].disbursalTime}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Inquiries & Contact Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="font-extrabold text-lg text-white">
            Need customized limits for your corporate workforce?
          </div>
          <p className="text-xs text-slate-400">
            Helpline: <span className="font-bold text-amber-400">{SITE_CONFIG.phone.display}</span> • Email Support:{' '}
            <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-emerald-400 hover:underline">
              {SITE_CONFIG.supportEmail}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={SITE_CONFIG.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all border border-slate-700 flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Login to Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
