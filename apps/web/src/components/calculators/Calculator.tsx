'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator as CalcIcon, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { calculatePayrollLoanEmi, calculateEwaEligibility, EmploymentStatus } from '@dada/contracts';
import { formatINR } from '@/lib/utils';

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<'PAYROLL_LOAN' | 'EWA'>('PAYROLL_LOAN');

  // Payroll Loan State
  const [loanAmount, setLoanAmount] = useState(150000); // INR
  const [annualRate, setAnnualRate] = useState(14.5); // %
  const [tenureMonths, setTenureMonths] = useState(18); // months

  // EWA State
  const [monthlySalary, setMonthlySalary] = useState(75000); // INR
  const [daysWorked, setDaysWorked] = useState(18); // days

  // Calculations
  const loanEmiResult = calculatePayrollLoanEmi({
    principalPaise: loanAmount * 100,
    annualInterestRatePercent: annualRate,
    tenureMonths: tenureMonths,
    processingFeePercent: 1.5,
  });

  const ewaResult = calculateEwaEligibility({
    monthlyNetSalaryPaise: monthlySalary * 100,
    totalPayableDaysInMonth: 30,
    approvedDaysWorked: daysWorked,
    alreadyWithdrawnPaise: 0,
    withdrawalCountInCycle: 0,
    activeMonthlyEmisPaise: 0,
    employmentStatus: EmploymentStatus.CONFIRMED,
    policy: {
      maxEwaPercentage: 50,
      minWithdrawalPaise: 100000,
      maxWithdrawalPaise: 5000000,
      maxWithdrawalsPerCycle: 2,
      payrollCutoffDay: 25,
      flatConvenienceFeePaise: 9900,
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80">
        <button
          onClick={() => setActiveTab('PAYROLL_LOAN')}
          className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'PAYROLL_LOAN'
              ? 'bg-white text-dada-900 border-b-2 border-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalcIcon className="w-4 h-4 text-emerald-600" />
          <span>Corporate Payroll Loan (EMI)</span>
        </button>
        <button
          onClick={() => setActiveTab('EWA')}
          className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'EWA'
              ? 'bg-white text-dada-900 border-b-2 border-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalcIcon className="w-4 h-4 text-emerald-600" />
          <span>Earned Wage Access (EWA)</span>
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === 'PAYROLL_LOAN' ? (
          /* Payroll Loan EMI View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Loan Amount */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Loan Amount
                  </span>
                  <span className="text-lg font-bold text-dada-950">
                    {formatINR(loanAmount * 100)}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="500000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>₹25,000</span>
                  <span>₹2,50,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Repayment Tenure
                  </span>
                  <span className="text-lg font-bold text-dada-950">
                    {tenureMonths} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="36"
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>6 Months</span>
                  <span>18 Months</span>
                  <span>36 Months</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Indicative Interest Rate (p.a.)
                  </span>
                  <span className="text-lg font-bold text-dada-950">
                    {annualRate.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="11.5"
                  max="22.0"
                  step="0.5"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>11.5%</span>
                  <span>16.0%</span>
                  <span>22.0%</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-dada-950 to-dada-900 rounded-xl p-6 text-white space-y-5 shadow-lg border border-dada-800">
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Estimated Monthly EMI
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mt-1">
                  {formatINR(loanEmiResult.monthlyEmiPaise)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Reducing balance basis</div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Amount:</span>
                  <span className="font-semibold">{formatINR(loanEmiResult.principalPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Interest Payable:</span>
                  <span className="font-semibold text-amber-400">{formatINR(loanEmiResult.totalInterestPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Repayment Amount:</span>
                  <span className="font-semibold">{formatINR(loanEmiResult.totalRepaymentPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing Fee (1.5%):</span>
                  <span className="font-semibold">{formatINR(loanEmiResult.processingFeePaise)}</span>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-dada-950 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm"
              >
                <span>Check Eligibility & Apply</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Info className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>Indicative calculation only. Final sanction and terms subject to NBFC underwriting.</span>
              </div>
            </div>
          </div>
        ) : (
          /* EWA Calculator View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Monthly Salary */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Monthly Net Salary
                  </span>
                  <span className="text-lg font-bold text-dada-950">
                    {formatINR(monthlySalary * 100)}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="250000"
                  step="5000"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>₹25,000</span>
                  <span>₹1,25,000</span>
                  <span>₹2,50,000</span>
                </div>
              </div>

              {/* Days Worked */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Approved Days Worked (Current Cycle)
                  </span>
                  <span className="text-lg font-bold text-dada-950">
                    {daysWorked} / 30 Days
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="28"
                  step="1"
                  value={daysWorked}
                  onChange={(e) => setDaysWorked(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>1 Day</span>
                  <span>15 Days</span>
                  <span>28 Days</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="font-semibold text-dada-950">How EWA is computed:</div>
                <div>• Daily Net Wage: {formatINR(ewaResult.dailyNetWagePaise)} per day</div>
                <div>• Gross Earned Wage ({daysWorked} days): {formatINR(ewaResult.grossEarnedWagePaise)}</div>
                <div>• Maximum Corporate Cap: 50% of earned wages (Policy rule)</div>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-dada-950 to-dada-900 rounded-xl p-6 text-white space-y-5 shadow-lg border border-dada-800">
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Available for Instant Withdrawal
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mt-1">
                  {formatINR(ewaResult.availableEwaPaise)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">50% of your already earned wages</div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Earned Wages:</span>
                  <span className="font-semibold">{formatINR(ewaResult.grossEarnedWagePaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Convenience Fee:</span>
                  <span className="font-semibold text-emerald-400">Flat ₹99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interest Rate:</span>
                  <span className="font-semibold text-emerald-400">0% Interest</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement:</span>
                  <span className="font-semibold">Auto-deducted on next salary day</span>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-dada-950 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm"
              >
                <span>Withdraw Wages Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Zero loan liability. Disbursed directly to your salary account by partner NBFC.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
