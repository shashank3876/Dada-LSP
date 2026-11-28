'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  Clock,
  Percent,
  FileText,
  CreditCard,
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  Sliders,
  ChevronRight,
  Phone,
  Lock,
  Calculator,
  IndianRupee,
  Calendar,
  Info,
  ShieldCheck,
  CheckCircle2,
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
  minAmount: number;
  maxAmount: number;
  cappingLoanAmount: string;
  tenureRepayment: string;
  pricingInterest: string;
  baseInterestRate: number; // Annual %
  processingFeePercent: number; // %
  processingFees: string;
  repaymentMode: string;
  underwritingInputs: string;
  disbursalTime: string;
  applyHref: string;
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
    minAmount: 5000,
    maxAmount: 50000,
    cappingLoanAmount: '50%–70% of accrued monthly net salary',
    tenureRepayment: 'Up to 30 Days (Bullet repayment on next salary credit date)',
    pricingInterest: '26% p.a.',
    baseInterestRate: 26,
    processingFeePercent: 3,
    processingFees: 'Flat upfront Processing fee (e.g., 3% of loan amount)',
    repaymentMode: 'Employer payroll deduction OR e-NACH / UPI AutoPay on salary date',
    underwritingInputs: 'HR attendance/payroll API + PAN/Aadhaar KYC',
    disbursalTime: 'Under 10 Minutes (24x7 instant IMPS/UPI)',
    applyHref: '/employee/ewa/apply',
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
    minAmount: 20000,
    maxAmount: 100000,
    cappingLoanAmount: 'Up to 2x monthly net salary (subject to max Loan Ticket Size)',
    tenureRepayment: 'Up to 3 Months (Equal Monthly Installments – EMIs)',
    pricingInterest: '28% p.a. (reducing balance)',
    baseInterestRate: 28,
    processingFeePercent: 4,
    processingFees: 'Flat upfront Processing fee (e.g., 4% of loan amount)',
    repaymentMode: 'e-NACH Mandate / UPI AutoPay from salary bank account',
    underwritingInputs: "6 months' bank statement (AA/BankConnect) + salary slip + CIBIL Bureau score",
    disbursalTime: 'Under 30 Minutes (During working hours)',
    applyHref: '/employee/payroll-loan/apply',
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
    minAmount: 50000,
    maxAmount: 200000,
    cappingLoanAmount: 'Up to 3x monthly net salary (subject to max Loan Ticket Size)',
    tenureRepayment: '3 to 10 Months (Equal Monthly Installments – EMIs)',
    pricingInterest: '24% – 30% p.a. (reducing balance)',
    baseInterestRate: 26,
    processingFeePercent: 4,
    processingFees: 'Flat upfront Processing fee (e.g., 4% of loan amount)',
    repaymentMode: 'e-NACH Mandate / UPI AutoPay',
    underwritingInputs: "6 months' bank statement (AA/BankConnect) + salary slip + CIBIL Bureau score (CIBIL 680+) + 12 months' AA bank statement",
    disbursalTime: 'Under 2 Hours (During working hours)',
    applyHref: '/employee/payroll-loan/apply',
  },
];

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductSpec>(PRODUCTS[0]);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  // Calculator State for Product A (EWA)
  const [ewaAmount, setEwaAmount] = useState<number>(20000);
  const [ewaDays, setEwaDays] = useState<number>(15);

  // Calculator State for Product B (Salary Advance)
  const [advanceAmount, setAdvanceAmount] = useState<number>(50000);
  const [advanceTenure, setAdvanceTenure] = useState<number>(3); // 1, 2, or 3 months

  // Calculator State for Product C (Personal Loan)
  const [personalAmount, setPersonalAmount] = useState<number>(100000);
  const [personalTenure, setPersonalTenure] = useState<number>(6); // 3 to 10 months
  const [personalRate, setPersonalRate] = useState<number>(26); // 24% to 30%

  // Real-time Calculations
  const ewaCalculation = useMemo(() => {
    const pf = Math.round((ewaAmount * 3) / 100);
    const gst = Math.round(pf * 0.18);
    const netDisbursed = ewaAmount - (pf + gst);
    const interest = Math.round((ewaAmount * (26 / 100) * ewaDays) / 365);
    const bulletRepayment = ewaAmount + interest;
    return { pf, gst, totalFees: pf + gst, netDisbursed, interest, bulletRepayment };
  }, [ewaAmount, ewaDays]);

  const advanceCalculation = useMemo(() => {
    const pf = Math.round((advanceAmount * 4) / 100);
    const gst = Math.round(pf * 0.18);
    const netDisbursed = advanceAmount - (pf + gst);
    const monthlyRate = 0.28 / 12;
    const emi = Math.round(
      (advanceAmount * monthlyRate * Math.pow(1 + monthlyRate, advanceTenure)) /
        (Math.pow(1 + monthlyRate, advanceTenure) - 1)
    );
    const totalRepay = emi * advanceTenure;
    const totalInterest = totalRepay - advanceAmount;
    return { pf, gst, totalFees: pf + gst, netDisbursed, emi, totalRepay, totalInterest };
  }, [advanceAmount, advanceTenure]);

  const personalCalculation = useMemo(() => {
    const pf = Math.round((personalAmount * 4) / 100);
    const gst = Math.round(pf * 0.18);
    const netDisbursed = personalAmount - (pf + gst);
    const monthlyRate = personalRate / 100 / 12;
    const emi = Math.round(
      (personalAmount * monthlyRate * Math.pow(1 + monthlyRate, personalTenure)) /
        (Math.pow(1 + monthlyRate, personalTenure) - 1)
    );
    const totalRepay = emi * personalTenure;
    const totalInterest = totalRepay - personalAmount;
    return { pf, gst, totalFees: pf + gst, netDisbursed, emi, totalRepay, totalInterest };
  }, [personalAmount, personalTenure, personalRate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Header & Context */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Dada Bridge • RBI Regulated Digital Lending (DLG) Product Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-dada-950 tracking-tight leading-tight">
          Workplace Credit & Personal Financing
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Select or hover your cursor over any product card below to inspect its specifications, transparent interest rates, and live interactive repayment calculator.
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
            Hover over cards to see live specifications & calculator below
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

                  {/* Title & Tagline with Matching Colors */}
                  <div>
                    <h3 className="text-xl font-extrabold text-dada-950 leading-snug">
                      {prod.displayName}
                    </h3>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed font-semibold italic ${
                        prod.id === 'product-a'
                          ? 'text-emerald-600'
                          : prod.id === 'product-b'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      &ldquo;{prod.tagline}&rdquo;
                    </p>
                  </div>

                  {/* Key Parameter Snapshot */}
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
                      <span className="text-xs text-slate-500 font-medium">Pricing:</span>
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
                    {isSelected ? 'Viewing Specs & Calculator ↓' : 'Hover to Inspect & Calculate'}
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

        {/* SECTION 2: Dynamic Detailed Inspector Panel & Live Calculator */}
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
                  {selectedProduct.code} Specification & Calculator
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  RBI DLG Regulated Lending Offering
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-dada-950">
                {selectedProduct.displayName}
              </h3>
              {/* Product Tagline in Matching Product Color */}
              <p
                className={`text-sm sm:text-base font-semibold italic ${
                  selectedProduct.id === 'product-a'
                    ? 'text-emerald-700'
                    : selectedProduct.id === 'product-b'
                    ? 'text-amber-700'
                    : 'text-blue-700'
                }`}
              >
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

          {/* SECTION: Dedicated Interactive Loan Calculator for Selected Product */}
          <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl text-white ${
                    selectedProduct.id === 'product-a'
                      ? 'bg-emerald-600'
                      : selectedProduct.id === 'product-b'
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                  }`}
                >
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-dada-950">
                    Live Repayment & Disbursal Calculator • {selectedProduct.displayName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Slide amounts to see your exact net salary bank credit, itemized fee breakdown, and repayment schedule.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                100% RBI DLG Fee Transparency
              </span>
            </div>

            {/* PRODUCT A: EWA CALCULATOR */}
            {selectedProduct.id === 'product-a' && (
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Sliders */}
                  <div className="space-y-6">
                    {/* Amount Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Accrued Salary Withdrawal Amount
                        </label>
                        <span className="text-xl font-extrabold text-emerald-700">
                          ₹{ewaAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5000}
                        max={50000}
                        step={1000}
                        value={ewaAmount}
                        onChange={(e) => setEwaAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Min: ₹5,000</span>
                        <span>Max (accrued cap): ₹50,000</span>
                      </div>
                    </div>

                    {/* Days to Payday Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Days Until Next Payday
                        </label>
                        <span className="text-lg font-extrabold text-slate-900">
                          {ewaDays} Days
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        step={1}
                        value={ewaDays}
                        onChange={(e) => setEwaDays(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>1 Day</span>
                        <span>Next Salary Cycle (30 Days)</span>
                      </div>
                    </div>
                  </div>

                  {/* Outputs Breakdown */}
                  <div className="grid grid-cols-2 gap-4 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        Net Amount Credited to Bank
                      </span>
                      <div className="text-2xl font-black text-emerald-800">
                        ₹{ewaCalculation.netDisbursed.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Sanction minus upfront fee & GST
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        Payday Bullet Repayment
                      </span>
                      <div className="text-2xl font-black text-slate-900">
                        ₹{ewaCalculation.bulletRepayment.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Principal + {selectedProduct.pricingInterest} for {ewaDays} days
                      </div>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-emerald-200/60">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Processing Fee (3% + 18% GST)
                      </span>
                      <div className="text-sm font-bold text-slate-800">
                        ₹{ewaCalculation.pf} + ₹{ewaCalculation.gst} = ₹{ewaCalculation.totalFees}
                      </div>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-emerald-200/60">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Total Interest for {ewaDays} Days
                      </span>
                      <div className="text-sm font-bold text-emerald-700">
                        ₹{ewaCalculation.interest.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Disbursal within 10 minutes via 24x7 instant IMPS to your registered salary account.</span>
                  </div>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 shrink-0"
                  >
                    <span>Withdraw ₹{ewaAmount.toLocaleString('en-IN')} Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* PRODUCT B: SALARY ADVANCE CALCULATOR */}
            {selectedProduct.id === 'product-b' && (
              <div className="bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Sliders & Tenure Selector */}
                  <div className="space-y-6">
                    {/* Amount Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Salary Advance Loan Amount
                        </label>
                        <span className="text-xl font-extrabold text-amber-700">
                          ₹{advanceAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20000}
                        max={100000}
                        step={5000}
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Min: ₹20,000</span>
                        <span>Max: ₹1,00,000</span>
                      </div>
                    </div>

                    {/* Tenure Buttons */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Repayment Tenor (Monthly EMIs)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setAdvanceTenure(m)}
                            className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all border ${
                              advanceTenure === m
                                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {m} {m === 1 ? 'Month' : 'Months'} ({m} {m === 1 ? 'EMI' : 'EMIs'})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Outputs Breakdown */}
                  <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        Monthly EMI Amount
                      </span>
                      <div className="text-2xl font-black text-amber-800">
                        ₹{advanceCalculation.emi.toLocaleString('en-IN')}
                        <span className="text-xs font-semibold text-slate-500">/mo</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        For {advanceTenure} monthly salary installments
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        Net Disbursed to Bank
                      </span>
                      <div className="text-2xl font-black text-slate-900">
                        ₹{advanceCalculation.netDisbursed.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        After deducting 4% PF & GST upfront
                      </div>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-amber-200/60">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Upfront Processing Fee (4% + GST)
                      </span>
                      <div className="text-sm font-bold text-slate-800">
                        ₹{advanceCalculation.totalFees.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-amber-200/60">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Total Interest (28% p.a. Reducing)
                      </span>
                      <div className="text-sm font-bold text-amber-700">
                        ₹{advanceCalculation.totalInterest.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Disbursal under 30 minutes during working hours via e-NACH salary bank mandate.</span>
                  </div>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 shrink-0"
                  >
                    <span>Apply for ₹{advanceAmount.toLocaleString('en-IN')} Advance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* PRODUCT C: PERSONAL LOAN CALCULATOR */}
            {selectedProduct.id === 'product-c' && (
              <div className="bg-white rounded-2xl border border-blue-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Sliders & Tenure Selector */}
                  <div className="space-y-6">
                    {/* Amount Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Personal Loan Amount
                        </label>
                        <span className="text-xl font-extrabold text-blue-700">
                          ₹{personalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50000}
                        max={200000}
                        step={5000}
                        value={personalAmount}
                        onChange={(e) => setPersonalAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Min: ₹50,000</span>
                        <span>Max: ₹2,00,000</span>
                      </div>
                    </div>

                    {/* Tenure Slider (3 to 10 Months) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Loan Tenor ({personalTenure} Months)
                        </label>
                        <span className="text-lg font-extrabold text-slate-900">
                          {personalTenure} EMIs
                        </span>
                      </div>
                      <input
                        type="range"
                        min={3}
                        max={10}
                        step={1}
                        value={personalTenure}
                        onChange={(e) => setPersonalTenure(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>3 Months</span>
                        <span>10 Months</span>
                      </div>
                    </div>

                    {/* Interest Rate Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Interest Tier (Based on CIBIL & Tenure)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[24, 26, 28, 30].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setPersonalRate(r)}
                            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                              personalRate === r
                                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {r}% p.a.
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Outputs Breakdown */}
                  <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        Monthly Equated Installment (EMI)
                      </span>
                      <div className="text-2xl font-black text-blue-800">
                        ₹{personalCalculation.emi.toLocaleString('en-IN')}
                        <span className="text-xs font-semibold text-slate-500">/mo</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {personalTenure} Monthly auto-debits via e-NACH
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        Net Disbursal in Account
                      </span>
                      <div className="text-2xl font-black text-slate-900">
                        ₹{personalCalculation.netDisbursed.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Direct credit from partner NBFC escrow
                      </div>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-blue-200/60">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Upfront Processing Fee (4% + GST)
                      </span>
                      <div className="text-sm font-bold text-slate-800">
                        ₹{personalCalculation.totalFees.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-blue-200/60">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Total Interest ({personalRate}% p.a. Reducing)
                      </span>
                      <div className="text-sm font-bold text-blue-700">
                        ₹{personalCalculation.totalInterest.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Disbursal under 2 hours during working hours. Verified via Account Aggregator & Bureau.</span>
                  </div>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 shrink-0"
                  >
                    <span>Apply for ₹{personalAmount.toLocaleString('en-IN')} Loan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
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
                  onMouseEnter={() => {
                    setHoveredColumn('product-a');
                    setSelectedProduct(PRODUCTS[0]);
                  }}
                  onMouseLeave={() => setHoveredColumn(null)}
                  className={`py-4 px-6 font-bold w-1/4 transition-colors cursor-pointer ${
                    hoveredColumn === 'product-a' || selectedProduct.id === 'product-a'
                      ? 'bg-slate-900 text-emerald-400 ring-2 ring-emerald-500/50'
                      : 'text-emerald-400'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 font-semibold">Product A</div>
                  <div className="text-sm font-extrabold">Instant Earned Wage Access (EWA)</div>
                </th>
                <th
                  onMouseEnter={() => {
                    setHoveredColumn('product-b');
                    setSelectedProduct(PRODUCTS[1]);
                  }}
                  onMouseLeave={() => setHoveredColumn(null)}
                  className={`py-4 px-6 font-bold w-1/4 transition-colors cursor-pointer ${
                    hoveredColumn === 'product-b' || selectedProduct.id === 'product-b'
                      ? 'bg-slate-900 text-amber-400 ring-2 ring-amber-500/50'
                      : 'text-amber-400'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 font-semibold">Product B</div>
                  <div className="text-sm font-extrabold">Salary Advance Loan</div>
                </th>
                <th
                  onMouseEnter={() => {
                    setHoveredColumn('product-c');
                    setSelectedProduct(PRODUCTS[2]);
                  }}
                  onMouseLeave={() => setHoveredColumn(null)}
                  className={`py-4 px-6 font-bold w-1/4 transition-colors cursor-pointer ${
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
              {/* Tagline (Matching Color for Each Product) */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Tagline (UI Hero)</td>
                <td className={`py-3.5 px-6 font-semibold italic text-emerald-700 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  &ldquo;{PRODUCTS[0].tagline}&rdquo;
                </td>
                <td className={`py-3.5 px-6 font-semibold italic text-amber-700 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  &ldquo;{PRODUCTS[1].tagline}&rdquo;
                </td>
                <td className={`py-3.5 px-6 font-semibold italic text-blue-700 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  &ldquo;{PRODUCTS[2].tagline}&rdquo;
                </td>
              </tr>

              {/* Target Segment */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Target Segment</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].targetSegment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].targetSegment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].targetSegment}
                </td>
              </tr>

              {/* Loan Ticket Size */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Loan Ticket Size</td>
                <td className={`py-3.5 px-6 font-extrabold text-slate-900 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].loanTicketSize}
                </td>
                <td className={`py-3.5 px-6 font-extrabold text-slate-900 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].loanTicketSize}
                </td>
                <td className={`py-3.5 px-6 font-extrabold text-slate-900 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].loanTicketSize}
                </td>
              </tr>

              {/* Capping Loan Amount */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Loan Capping</td>
                <td className={`py-3.5 px-6 font-semibold text-slate-800 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].cappingLoanAmount}
                </td>
                <td className={`py-3.5 px-6 font-semibold text-slate-800 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].cappingLoanAmount}
                </td>
                <td className={`py-3.5 px-6 font-semibold text-slate-800 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].cappingLoanAmount}
                </td>
              </tr>

              {/* Tenure & Repayment */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Tenure & Repayment</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].tenureRepayment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].tenureRepayment}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].tenureRepayment}
                </td>
              </tr>

              {/* Pricing / Interest */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Pricing / Interest</td>
                <td className={`py-3.5 px-6 font-bold text-emerald-700 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].pricingInterest}
                </td>
                <td className={`py-3.5 px-6 font-bold text-amber-700 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].pricingInterest}
                </td>
                <td className={`py-3.5 px-6 font-bold text-blue-700 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].pricingInterest}
                </td>
              </tr>

              {/* Processing Fees */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Processing Fees (PF)</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].processingFees}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].processingFees}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].processingFees}
                </td>
              </tr>

              {/* Repayment Mode */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Repayment Mode</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].repaymentMode}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].repaymentMode}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].repaymentMode}
                </td>
              </tr>

              {/* Underwriting Inputs */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Underwriting Inputs</td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].underwritingInputs}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].underwritingInputs}
                </td>
                <td className={`py-3.5 px-6 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].underwritingInputs}
                </td>
              </tr>

              {/* Disbursal Time */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50/50">Disbursal Time</td>
                <td className={`py-3.5 px-6 font-bold text-emerald-700 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  {PRODUCTS[0].disbursalTime}
                </td>
                <td className={`py-3.5 px-6 font-bold text-amber-700 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  {PRODUCTS[1].disbursalTime}
                </td>
                <td className={`py-3.5 px-6 font-bold text-blue-700 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  {PRODUCTS[2].disbursalTime}
                </td>
              </tr>

              {/* Quick Action / Calculate */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900 bg-slate-50/50">Interactive Calculator</td>
                <td className={`py-4 px-6 ${hoveredColumn === 'product-a' || selectedProduct.id === 'product-a' ? 'bg-emerald-50/40' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(PRODUCTS[0]);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calculate EWA</span>
                  </button>
                </td>
                <td className={`py-4 px-6 ${hoveredColumn === 'product-b' || selectedProduct.id === 'product-b' ? 'bg-amber-50/40' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(PRODUCTS[1]);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calculate Advance</span>
                  </button>
                </td>
                <td className={`py-4 px-6 ${hoveredColumn === 'product-c' || selectedProduct.id === 'product-c' ? 'bg-blue-50/40' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(PRODUCTS[2]);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calculate EMI</span>
                  </button>
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
            Need customized limits for your corporate workforce on Dada Bridge?
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
