'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Building2, HelpCircle, ArrowRight } from 'lucide-react';

export default function FaqPage() {
  const faqs = [
    {
      q: 'What is Dada Bridge, and is it an authorized lender?',
      a: 'Dada Bridge is the enterprise digital lending platform operated by Dada Advisory Services LLP as a registered Lending Service Provider (LSP) under the regulatory framework of the Reserve Bank of India (RBI Digital Lending Guidelines, 2022). Dada Bridge does not lend from its own balance sheet and does not hold or pool borrower funds. All credit facilities, interest rate evaluations, and disbursements are executed directly by RBI-registered partner Non-Banking Financial Companies (NBFCs) like Apex Capital Finance Ltd and DMI Finance Private Ltd directly into the employee’s salary bank account.',
    },
    {
      q: 'How does Earned Wage Access (EWA) differ from a Corporate Personal Loan?',
      a: 'Earned Wage Access (EWA) allows salaried employees to withdraw up to 50% of the salary they have already earned during the ongoing calendar month based on verified work attendance. It carries 0% interest and a flat nominal platform fee (₹99), with bullet recovery on the next salary day. A Corporate Personal Loan, conversely, is a multi-month loan facility (up to ₹5,00,000) repaid across 6 to 36 equated monthly installments (EMIs) with reducing-balance interest starting from 11.5% p.a.',
    },
    {
      q: 'What is a Key Fact Statement (KFS), and when do I receive it?',
      a: 'In accordance with RBI directions, every borrower receives an upfront, standardized Key Fact Statement (KFS) prior to executing any loan agreement. The KFS outlines the exact loan amount sanctioned, annualized percentage rate (APR), processing fees, monthly EMI schedule, total interest payable, late payment charges, and the cooling-off period. No fee or deduction is ever applied without explicit borrower consent via digital signature.',
    },
    {
      q: 'What is the Cooling-Off / Look-Up Period?',
      a: 'A mandatory 3-business-day cooling-off period is provided to all borrowers. If you decide not to proceed with the personal loan after disbursement, you can exit the facility by repaying the principal amount and proportionate interest without any pre-closure or prepayment penalty.',
    },
    {
      q: 'Can I prepay or foreclose my personal loan before the tenure ends?',
      a: 'Yes. In adherence to fair lending practices, borrowers can prepay or foreclose their corporate personal loan at any time after completing 6 scheduled monthly EMI payments with NIL (zero) foreclosure charges.',
    },
    {
      q: 'How are repayments collected each month?',
      a: 'Repayments are streamlined through automated corporate payroll deductions. On the company’s scheduled salary disbursement date, the employer deducts the due installment from your net pay and remits it directly to the NBFC’s designated escrow account. A backup NPCI e-NACH mandate is maintained to protect credit bureau standings in transition scenarios.',
    },
    {
      q: 'Does applying for Earned Wage Access (EWA) impact my credit bureau score?',
      a: 'No. Earned Wage Access is an advance on already earned wages and is not classified as a debt instrument. It does not trigger a hard credit bureau pull and is not reported as an outstanding loan to CIBIL or Experian. Corporate Personal Loans, however, are reported to credit bureaus and help build a positive credit history when repaid timely.',
    },
    {
      q: 'What documents are required for application?',
      a: 'The process is 100% paperless: (1) PAN Card number, (2) Aadhaar authentication via DigiLocker OTP, (3) 3 months bank statements showing salary credits (or automated corporate HRMS payroll synchronization), and (4) Net Banking / Debit Card authentication to set up the e-NACH mandate.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Transparency & Borrower Education</span>
        </div>
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Comprehensive answers to common questions regarding credit eligibility, RBI digital lending compliance, KFS disclosures, and corporate payroll integration.
        </p>
      </div>

      {/* Accordion/Card list */}
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-base text-dada-950 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{f.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
              {f.a}
            </p>
          </div>
        ))}
      </div>

      {/* Direct Contact Helpdesk */}
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <h3 className="font-extrabold text-lg text-dada-950">Have More Questions?</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Our specialized team is available to assist you with borrower applications or employer onboarding.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold">
          <a
            href="mailto:support@dadaadvisoryservices.com"
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>support@dadaadvisoryservices.com</span>
          </a>
          <a
            href="mailto:connect@dadaadvisoryservices.com"
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>connect@dadaadvisoryservices.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
