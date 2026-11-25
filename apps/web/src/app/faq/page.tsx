import React from 'react';

export default function FaqPage() {
  const faqs = [
    {
      q: 'Does Dada Advisory disburse loans directly?',
      a: 'No. Dada Advisory acts strictly as a Lending Service Provider (LSP). In compliance with RBI digital lending guidelines, loan sanctioning, KFS issuance, agreement signing, and disbursement are performed directly by our RBI-registered partner NBFCs/Banks directly into the employee salary bank account.',
    },
    {
      q: 'Is Earned Wage Access (EWA) considered a debt or loan?',
      a: 'EWA is access to wages you have already earned by working approved days in the current month. It does not carry interest, carries zero collateral, and does not report as an active debt facility to credit bureaus.',
    },
    {
      q: 'How does repayment work for EWA and Payroll Loans?',
      a: 'All repayments are structured through corporate payroll deductions. On regular salary disbursement day, the employer deducts the due installment from salary and remits it directly to the designated NBFC escrow account.',
    },
    {
      q: 'What happens if an employee resigns or serves notice period?',
      a: 'Employees serving notice period or marked terminated are ineligible for new withdrawals. Any outstanding active loan obligation is settled as part of the final full-and-final (FnF) salary settlement or through the e-NACH mandate.',
    },
    {
      q: 'Are there any hidden charges or advance fees?',
      a: 'Zero. Every loan or EWA request displays an upfront Key Fact Statement (KFS) detailing the principal, interest rate, APR, and processing fee. No fee is deducted before disbursement.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-dada-950 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600">
          Common questions about products, compliance, and corporate payroll integration.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-base text-dada-950">{f.q}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
