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
  currentDayOfMonth?: number; // Optional day of month for cutoff/freeze verification
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
    currentDayOfMonth,
  } = input;

  // 1. Notice period, suspended, or terminated employees have ZERO eligibility
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

  // 2. Payroll cutoff and freeze enforcement
  if (currentDayOfMonth !== undefined && policy.payrollCutoffDay) {
    const freezeStartDay = policy.payrollCutoffDay - (policy.payrollFreezeDaysBeforeCutoff || 0);
    if (currentDayOfMonth >= freezeStartDay) {
      return {
        dailyNetWagePaise: 0,
        grossEarnedWagePaise: 0,
        eligibleEarnedCapPaise: 0,
        availableEwaPaise: 0,
        isEligible: false,
        ineligibilityReason: `Payroll cycle is currently frozen for reconciliation cutoff (Day ${freezeStartDay} through Day ${policy.payrollCutoffDay}). New EWA withdrawals resume in the next cycle.`,
        maxWithdrawalAllowedPaise: 0,
        minWithdrawalAllowedPaise: policy.minWithdrawalPaise,
        remainingWithdrawalsInCycle: Math.max(0, policy.maxWithdrawalsPerCycle - withdrawalCountInCycle),
      };
    }
  }

  if (totalPayableDaysInMonth <= 0) {
    throw new Error('Total payable days in month must be greater than zero');
  }

  // 3. Daily net wage = floor(Monthly net salary / Total payable days in month)
  const dailyNetWagePaise = Math.floor(monthlyNetSalaryPaise / totalPayableDaysInMonth);

  // 4. Gross earned wage = Daily net wage * Approved payable days worked
  const grossEarnedWagePaise = dailyNetWagePaise * Math.max(0, approvedDaysWorked);

  // 5. Eligible earned cap = floor(Gross earned wage * EWA cap percentage / 100)
  const eligibleEarnedCapPaise = Math.floor(
    (grossEarnedWagePaise * policy.maxEwaPercentage) / 100
  );

  // 6. Available EWA = Cap - Already withdrawn - Applicable existing monthly EMIs
  let availableEwaPaise = eligibleEarnedCapPaise - alreadyWithdrawnPaise - activeMonthlyEmisPaise;
  if (availableEwaPaise < 0) {
    availableEwaPaise = 0;
  }

  // 7. Enforce EWA maximum withdrawal limit (₹50,000 / policy limit)
  const maxPossible = Math.min(availableEwaPaise, policy.maxWithdrawalPaise);

  const remainingWithdrawalsInCycle = Math.max(
    0,
    policy.maxWithdrawalsPerCycle - withdrawalCountInCycle
  );

  let isEligible = true;
  let ineligibilityReason: string | undefined;

  // 8. Enforce maximum withdrawals per cycle (default max 2)
  if (remainingWithdrawalsInCycle <= 0) {
    isEligible = false;
    ineligibilityReason = `Maximum withdrawals per cycle limit reached (${policy.maxWithdrawalsPerCycle}/${policy.maxWithdrawalsPerCycle}).`;
  } else if (maxPossible < policy.minWithdrawalPaise) {
    // 9. Enforce minimum withdrawal threshold (₹1,000 / policy limit)
    isEligible = false;
    ineligibilityReason = `Available earned wage amount (₹${(maxPossible / 100).toLocaleString('en-IN')}) is less than the minimum withdrawal limit of ₹${(policy.minWithdrawalPaise / 100).toLocaleString('en-IN')}.`;
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
  activeEwaObligationsPaise?: number; // Current cycle active EWA withdrawals
}

export interface PayrollLoanEligibilityResult {
  maxLoanAmountPaise: number;
  minLoanAmountPaise: number;
  maxFoirAllowedEmiPaise: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  allowedTenuresMonths: number[];
  consideredEwaInFoir: boolean;
}

export function calculatePayrollLoanEligibility(
  input: PayrollLoanEligibilityInput
): PayrollLoanEligibilityResult {
  const { monthlyNetSalaryPaise, activeMonthlyEmisPaise, employmentStatus, policy, activeEwaObligationsPaise = 0 } = input;

  // Use dynamically configured provisional tenures (or fall back to standard [6, 12, 18, 24, 36])
  const candidateTenures = policy.provisionalTenuresMonths && policy.provisionalTenuresMonths.length > 0
    ? policy.provisionalTenuresMonths
    : [6, 12, 18, 24, 36];

  const allowedTenuresMonths = candidateTenures.filter(
    (t) => t >= policy.minTenureMonths && t <= policy.maxTenureMonths
  );

  const shouldConsiderEwa = policy.considerEwaInFoir !== false;

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
      consideredEwaInFoir: shouldConsiderEwa,
    };
  }

  // Combined FOIR check: Factor in active EWA obligations if policy enables it
  const effectiveMonthlyObligationsPaise =
    activeMonthlyEmisPaise + (shouldConsiderEwa ? activeEwaObligationsPaise : 0);

  const totalAllowedEmiPaise = Math.floor(
    (monthlyNetSalaryPaise * policy.maxFoirPercent) / 100
  );
  const availableEmiCapacityPaise = totalAllowedEmiPaise - effectiveMonthlyObligationsPaise;

  if (availableEmiCapacityPaise <= 0) {
    const ewaDetail = shouldConsiderEwa && activeEwaObligationsPaise > 0
      ? ` (including active EWA obligation of ₹${(activeEwaObligationsPaise / 100).toLocaleString('en-IN')})`
      : '';
    return {
      maxLoanAmountPaise: 0,
      minLoanAmountPaise: 0,
      maxFoirAllowedEmiPaise: 0,
      isEligible: false,
      ineligibilityReason: `Existing monthly debt obligations of ₹${(effectiveMonthlyObligationsPaise / 100).toLocaleString('en-IN')}${ewaDetail} exceed maximum permissible FOIR cap of ${policy.maxFoirPercent}%.`,
      allowedTenuresMonths,
      consideredEwaInFoir: shouldConsiderEwa,
    };
  }

  // Salary multiplier cap (e.g. 3x net salary)
  const maxMultiplierLoanPaise = monthlyNetSalaryPaise * policy.salaryMultiplier;

  // Combined exposure cap if configured
  let maxLoanAmountPaise = maxMultiplierLoanPaise;
  if (policy.maxCombinedDebtPaise && policy.maxCombinedDebtPaise > 0) {
    const remainingExposurePaise = Math.max(0, policy.maxCombinedDebtPaise - activeEwaObligationsPaise);
    maxLoanAmountPaise = Math.min(maxMultiplierLoanPaise, remainingExposurePaise);
  }

  const minLoanAmountPaise = 2500000; // Rs 25,000 minimum

  if (maxLoanAmountPaise < minLoanAmountPaise) {
    return {
      maxLoanAmountPaise: 0,
      minLoanAmountPaise,
      maxFoirAllowedEmiPaise: availableEmiCapacityPaise,
      isEligible: false,
      ineligibilityReason: `Calculated eligible loan amount (₹${(maxLoanAmountPaise / 100).toLocaleString('en-IN')}) is below minimum loan requirement of ₹${(minLoanAmountPaise / 100).toLocaleString('en-IN')}.`,
      allowedTenuresMonths,
      consideredEwaInFoir: shouldConsiderEwa,
    };
  }

  return {
    maxLoanAmountPaise,
    minLoanAmountPaise,
    maxFoirAllowedEmiPaise: availableEmiCapacityPaise,
    isEligible: true,
    allowedTenuresMonths,
    consideredEwaInFoir: shouldConsiderEwa,
  };
}
