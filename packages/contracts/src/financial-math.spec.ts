import {
  calculateEwaEligibility,
  calculatePayrollLoanEmi,
  calculatePayrollLoanEligibility,
} from './financial-math';
import { EmploymentStatus, EwaPolicyConfig, PayrollLoanPolicyConfig } from './types';
import { formatINR, maskAadhaar, maskPAN, maskAccountNumber, paiseToRupees, rupeesToPaise } from './currency';

const defaultEwaPolicy: EwaPolicyConfig = {
  maxEwaPercentage: 50,
  minWithdrawalPaise: 100000, // Rs 1,000
  maxWithdrawalPaise: 5000000, // Rs 50,000
  maxWithdrawalsPerCycle: 2,
  payrollCutoffDay: 25,
  flatConvenienceFeePaise: 9900, // Rs 99
};

const defaultLoanPolicy: PayrollLoanPolicyConfig = {
  salaryMultiplier: 3,
  minTenureMonths: 6,
  maxTenureMonths: 24,
  annualInterestRatePercent: 14.5,
  processingFeePercent: 1.5,
  maxFoirPercent: 50,
};

describe('EWA Financial Calculation Engine', () => {
  it('correctly calculates daily wage, gross earned wage and available EWA for active employee', () => {
    // Monthly net salary: Rs 60,000 (6,000,000 paise)
    // 30 days in month => Rs 2,000 / day
    // 15 days worked => Rs 30,000 gross earned
    // 50% cap => Rs 15,000 (1,500,000 paise)
    const result = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 15,
      alreadyWithdrawnPaise: 0,
      withdrawalCountInCycle: 0,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: defaultEwaPolicy,
    });

    expect(result.isEligible).toBe(true);
    expect(result.dailyNetWagePaise).toBe(200000);
    expect(result.grossEarnedWagePaise).toBe(3000000);
    expect(result.eligibleEarnedCapPaise).toBe(1500000);
    expect(result.availableEwaPaise).toBe(1500000);
    expect(result.remainingWithdrawalsInCycle).toBe(2);
  });

  it('subtracts previous withdrawals and existing EMIs from available EWA', () => {
    // Rs 15,000 cap - Rs 5,000 already withdrawn - Rs 2,000 EMI = Rs 8,000 available
    const result = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 15,
      alreadyWithdrawnPaise: 500000,
      withdrawalCountInCycle: 1,
      activeMonthlyEmisPaise: 200000,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: defaultEwaPolicy,
    });

    expect(result.isEligible).toBe(true);
    expect(result.availableEwaPaise).toBe(800000);
    expect(result.remainingWithdrawalsInCycle).toBe(1);
  });

  it('returns zero eligibility when employee is on notice period, suspended, or terminated', () => {
    for (const status of [
      EmploymentStatus.NOTICE_PERIOD,
      EmploymentStatus.SUSPENDED,
      EmploymentStatus.TERMINATED,
    ]) {
      const result = calculateEwaEligibility({
        monthlyNetSalaryPaise: 8000000,
        totalPayableDaysInMonth: 30,
        approvedDaysWorked: 20,
        alreadyWithdrawnPaise: 0,
        withdrawalCountInCycle: 0,
        activeMonthlyEmisPaise: 0,
        employmentStatus: status,
        policy: defaultEwaPolicy,
      });

      expect(result.isEligible).toBe(false);
      expect(result.availableEwaPaise).toBe(0);
      expect(result.ineligibilityReason).toContain(status);
    }
  });

  it('rejects eligibility when withdrawal cycle count exceeds maximum allowed', () => {
    const result = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 20,
      alreadyWithdrawnPaise: 1000000,
      withdrawalCountInCycle: 2, // policy allows max 2
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: defaultEwaPolicy,
    });

    expect(result.isEligible).toBe(false);
    expect(result.remainingWithdrawalsInCycle).toBe(0);
    expect(result.ineligibilityReason).toContain('Maximum withdrawals per cycle limit reached');
  });

  it('enforces minimum withdrawal policy threshold', () => {
    // Only 1 day worked => Rs 2,000 earned => Rs 1,000 cap, but Rs 500 active EMI => Rs 500 left (50000 paise < 100000 min)
    const result = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 1,
      alreadyWithdrawnPaise: 0,
      withdrawalCountInCycle: 0,
      activeMonthlyEmisPaise: 50000,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: defaultEwaPolicy,
    });

    expect(result.isEligible).toBe(false);
    expect(result.ineligibilityReason).toContain('minimum withdrawal limit');
  });
});

describe('Payroll Loan Reducing-Balance EMI Engine', () => {
  it('calculates standard reducing balance EMI, total interest, and total repayment correctly', () => {
    // Rs 1,00,000 (10,000,000 paise) at 14.5% annual rate for 12 months
    const result = calculatePayrollLoanEmi({
      principalPaise: 10000000,
      annualInterestRatePercent: 14.5,
      tenureMonths: 12,
      processingFeePercent: 1.5,
    });

    // Standard financial math:
    // r = 14.5 / 1200 = 0.0120833...
    // EMI for Rs 100,000 at 14.5% over 12 months = approx Rs 9,004 (900388 paise)
    expect(result.monthlyEmiPaise).toBeGreaterThan(890000);
    expect(result.monthlyEmiPaise).toBeLessThan(910000);
    expect(result.totalRepaymentPaise).toBe(result.monthlyEmiPaise * 12);
    expect(result.totalInterestPaise).toBe(result.totalRepaymentPaise - 10000000);
    expect(result.processingFeePaise).toBe(150000); // 1.5% of 100,000 = Rs 1,500
  });

  it('checks FOIR and salary multiplier eligibility', () => {
    // Salary: Rs 80,000 (8,000,000 paise). Multiplier 3 => Max loan Rs 2,40,000
    // Active EMIs: Rs 20,000. Max FOIR 50% = Rs 40,000 total EMI => Remaining capacity = Rs 20,000
    const result = calculatePayrollLoanEligibility({
      monthlyNetSalaryPaise: 8000000,
      activeMonthlyEmisPaise: 2000000,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: defaultLoanPolicy,
    });

    expect(result.isEligible).toBe(true);
    expect(result.maxLoanAmountPaise).toBe(24000000); // Rs 2,40,000
    expect(result.maxFoirAllowedEmiPaise).toBe(2000000); // Rs 20,000
    expect(result.allowedTenuresMonths).toEqual([6, 12, 18, 24]);
  });

  it('rejects payroll loan eligibility if active EMIs exceed FOIR cap', () => {
    const result = calculatePayrollLoanEligibility({
      monthlyNetSalaryPaise: 5000000, // Rs 50,000
      activeMonthlyEmisPaise: 3000000, // Rs 30,000 (60% FOIR, exceeds 50%)
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: defaultLoanPolicy,
    });

    expect(result.isEligible).toBe(false);
    expect(result.ineligibilityReason).toContain('exceed maximum permissible FOIR cap');
  });
});

describe('Currency and PII Masking Utilities', () => {
  it('formats paise to INR currency strings properly', () => {
    expect(formatINR(100000)).toBe('₹1,000');
    expect(formatINR(5000000)).toBe('₹50,000');
    expect(formatINR(1500000, { showPaise: true })).toBe('₹15,000.00');
  });

  it('converts between rupees and paise accurately', () => {
    expect(rupeesToPaise(1250.50)).toBe(125050);
    expect(paiseToRupees(125050)).toBe(1250.50);
  });

  it('masks sensitive PII data safely', () => {
    expect(maskAadhaar('123456789012')).toBe('XXXX-XXXX-9012');
    expect(maskPAN('ABCDE1234F')).toBe('ABXXXXX4F');
    expect(maskAccountNumber('987654321098')).toBe('XXXX-XXXX-1098');
  });
});
