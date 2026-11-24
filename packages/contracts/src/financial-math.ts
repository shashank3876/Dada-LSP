import { EwaPolicyConfig, EmploymentStatus, PayrollLoanPolicyConfig } from './types';

export interface EwaCalculationInput {
  monthlyNetSalaryPaise: number;
  totalPayableDaysInMonth: number;
  approvedDaysWorked: number; // including approved paid leave
  alreadyWithdrawnPaise: number;
  withdrawalCountInCycle: number;
  activeMonthlyEmisPaise: number;
  employmentStatus: EmploymentStatus;
  policy: EwaPolicyConfig;
}

export interface EwaCalculationResult {
  dailyNetWagePaise: number;
  grossEarnedWagePaise: number;
  eligibleEarnedCapPaise: number;
  availableEwaPaise: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  maxWithdrawalAllowedPaise: number;
  minWithdrawalAllowedPaise: number;
  remainingWithdrawalsInCycle: number;
}

export function calculateEwaEligibility(input: EwaCalculationInput): EwaCalculationResult {
  const {
    monthlyNetSalaryPaise,
    totalPayableDaysInMonth,
    approvedDaysWorked,
    alreadyWithdrawnPaise,
    withdrawalCountInCycle,
    activeMonthlyEmisPaise,
    employmentStatus,
    policy,
  } = input;

  // Notice period, suspended, or terminated employees have ZERO eligibility
  if (
    employmentStatus === EmploymentStatus.NOTICE_PERIOD ||
    employmentStatus === EmploymentStatus.SUSPENDED ||
    employmentStatus === EmploymentStatus.TERMINATED
  ) {
    return {
      dailyNetWagePaise: 0,
      grossEarnedWagePaise: 0,
      eligibleEarnedCapPaise: 0,
      availableEwaPaise: 0,
      isEligible: false,
      ineligibilityReason: `Employees in ${employmentStatus} status are not eligible for new EWA withdrawals.`,
      maxWithdrawalAllowedPaise: 0,
      minWithdrawalAllowedPaise: policy.minWithdrawalPaise,
      remainingWithdrawalsInCycle: 0,
    };
  }

  if (totalPayableDaysInMonth <= 0) {
    throw new Error('Total payable days in month must be greater than zero');
  }

  // 1. Daily net wage = Monthly net salary / Total payable days in month
  const dailyNetWagePaise = Math.floor(monthlyNetSalaryPaise / totalPayableDaysInMonth);

  // 2. Gross earned wage = Daily net wage * Approved payable days worked
  const grossEarnedWagePaise = dailyNetWagePaise * Math.max(0, approvedDaysWorked);

  // 3. Gross earned wage * EWA cap percentage
  const eligibleEarnedCapPaise = Math.floor(
    (grossEarnedWagePaise * policy.maxEwaPercentage) / 100
  );

  // 4. Available EWA = Cap - Already withdrawn - Applicable existing monthly EMIs
  let availableEwaPaise = eligibleEarnedCapPaise - alreadyWithdrawnPaise - activeMonthlyEmisPaise;
  if (availableEwaPaise < 0) {
    availableEwaPaise = 0;
  }

  // Cap at policy max withdrawal
  const maxPossible = Math.min(availableEwaPaise, policy.maxWithdrawalPaise);

  const remainingWithdrawalsInCycle = Math.max(
    0,
    policy.maxWithdrawalsPerCycle - withdrawalCountInCycle
  );

  let isEligible = true;
  let ineligibilityReason: string | undefined;

  if (remainingWithdrawalsInCycle <= 0) {
    isEligible = false;
    ineligibilityReason = `Maximum withdrawals per cycle limit reached (${policy.maxWithdrawalsPerCycle}/${policy.maxWithdrawalsPerCycle}).`;
  } else if (maxPossible < policy.minWithdrawalPaise) {
    isEligible = false;
    ineligibilityReason = `Available earned wage amount is less than the minimum withdrawal limit of ₹${(policy.minWithdrawalPaise / 100).toLocaleString('en-IN')}.`;
  }

  return {
    dailyNetWagePaise,
    grossEarnedWagePaise,
    eligibleEarnedCapPaise,
    availableEwaPaise: isEligible ? maxPossible : 0,
    isEligible,
    ineligibilityReason,
    maxWithdrawalAllowedPaise: isEligible ? maxPossible : 0,
    minWithdrawalAllowedPaise: policy.minWithdrawalPaise,
    remainingWithdrawalsInCycle,
  };
}

export interface PayrollLoanEmiInput {
  principalPaise: number;
  annualInterestRatePercent: number;
  tenureMonths: number;
  processingFeePercent?: number;
}

export interface PayrollLoanEmiResult {
  monthlyEmiPaise: number;
  totalInterestPaise: number;
  totalRepaymentPaise: number;
  processingFeePaise: number;
  principalPaise: number;
}

/**
 * Standard reducing-balance EMI formula:
 * EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 */
export function calculatePayrollLoanEmi(input: PayrollLoanEmiInput): PayrollLoanEmiResult {
  const { principalPaise, annualInterestRatePercent, tenureMonths, processingFeePercent = 0 } = input;

  if (tenureMonths <= 0) {
    throw new Error('Tenure must be at least 1 month');
  }

  if (annualInterestRatePercent <= 0) {
    // 0% interest edge case
    const monthlyEmiPaise = Math.ceil(principalPaise / tenureMonths);
    return {
      monthlyEmiPaise,
      totalInterestPaise: 0,
      totalRepaymentPaise: principalPaise,
      processingFeePaise: Math.round((principalPaise * processingFeePercent) / 100),
      principalPaise,
    };
  }

  // Monthly interest rate r
  const r = annualInterestRatePercent / (12 * 100);
  const n = tenureMonths;

  // (1 + r)^n
  const compound = Math.pow(1 + r, n);

  // EMI = P * r * compound / (compound - 1)
  const emi = (principalPaise * r * compound) / (compound - 1);
  const monthlyEmiPaise = Math.round(emi);

  const totalRepaymentPaise = monthlyEmiPaise * n;
  const totalInterestPaise = totalRepaymentPaise - principalPaise;
  const processingFeePaise = Math.round((principalPaise * processingFeePercent) / 100);

  return {
    monthlyEmiPaise,
    totalInterestPaise: Math.max(0, totalInterestPaise),
    totalRepaymentPaise,
    processingFeePaise,
    principalPaise,
  };
}

export interface PayrollLoanEligibilityInput {
  monthlyNetSalaryPaise: number;
  activeMonthlyEmisPaise: number;
  employmentStatus: EmploymentStatus;
  policy: PayrollLoanPolicyConfig;
}

export interface PayrollLoanEligibilityResult {
  maxLoanAmountPaise: number;
  minLoanAmountPaise: number;
  maxFoirAllowedEmiPaise: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  allowedTenuresMonths: number[];
}

export function calculatePayrollLoanEligibility(
  input: PayrollLoanEligibilityInput
): PayrollLoanEligibilityResult {
  const { monthlyNetSalaryPaise, activeMonthlyEmisPaise, employmentStatus, policy } = input;

  const allowedTenuresMonths = [6, 12, 18, 24].filter(
    (t) => t >= policy.minTenureMonths && t <= policy.maxTenureMonths
  );

  if (
    employmentStatus === EmploymentStatus.NOTICE_PERIOD ||
    employmentStatus === EmploymentStatus.SUSPENDED ||
    employmentStatus === EmploymentStatus.TERMINATED
  ) {
    return {
      maxLoanAmountPaise: 0,
      minLoanAmountPaise: 0,
      maxFoirAllowedEmiPaise: 0,
      isEligible: false,
      ineligibilityReason: `Employees in ${employmentStatus} status are not eligible for payroll loans.`,
      allowedTenuresMonths,
    };
  }

  // FOIR check: Max total monthly EMI obligations = (Salary * maxFoirPercent) / 100
  const totalAllowedEmiPaise = Math.floor(
    (monthlyNetSalaryPaise * policy.maxFoirPercent) / 100
  );
  const availableEmiCapacityPaise = totalAllowedEmiPaise - activeMonthlyEmisPaise;

  if (availableEmiCapacityPaise <= 0) {
    return {
      maxLoanAmountPaise: 0,
      minLoanAmountPaise: 0,
      maxFoirAllowedEmiPaise: 0,
      isEligible: false,
      ineligibilityReason: `Existing monthly EMI obligations (₹${(activeMonthlyEmisPaise / 100).toLocaleString('en-IN')}) exceed maximum permissible FOIR cap of ${policy.maxFoirPercent}%.`,
      allowedTenuresMonths,
    };
  }

  // Salary multiplier cap
  const maxMultiplierLoanPaise = monthlyNetSalaryPaise * policy.salaryMultiplier;

  return {
    maxLoanAmountPaise: maxMultiplierLoanPaise,
    minLoanAmountPaise: 2500000, // Rs 25,000 minimum
    maxFoirAllowedEmiPaise: availableEmiCapacityPaise,
    isEligible: true,
    allowedTenuresMonths,
  };
}
