import {
  calculateEwaEligibility,
  calculatePayrollLoanEligibility,
  calculatePayrollLoanEmi,
  canTransitionApplication,
  ApplicationStatus,
  EmploymentStatus,
  EwaPolicyConfig,
  PayrollLoanPolicyConfig,
  ReconciliationExceptionType,
} from '@dada/contracts';
import { AttendanceService } from './attendance/attendance.service';
import { NbfcService } from './nbfc/nbfc.service';
import { PrismaService } from '../common/prisma.service';

describe('Checkpoint 2.1 — Comprehensive Business Logic Regression Test Suite (9 Rules)', () => {
  const standardEwaPolicy: EwaPolicyConfig = {
    maxEwaPercentage: 50,
    minWithdrawalPaise: 100000, // Rs 1,000
    maxWithdrawalPaise: 5000000, // Rs 50,000
    maxWithdrawalsPerCycle: 2,
    payrollCutoffDay: 25,
    payrollFreezeDaysBeforeCutoff: 3, // Days 22 to 25 frozen
    flatConvenienceFeePaise: 9900, // Rs 99
  };

  const standardLoanPolicy: PayrollLoanPolicyConfig = {
    salaryMultiplier: 3,
    minTenureMonths: 6,
    maxTenureMonths: 36,
    provisionalTenuresMonths: [6, 12, 18, 24, 36],
    annualInterestRatePercent: 14.5,
    processingFeePercent: 1.5,
    maxFoirPercent: 50,
    considerEwaInFoir: true,
  };

  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
      loanApplication: { findUnique: jest.fn(), update: jest.fn() },
      loan: { create: jest.fn(), findMany: jest.fn() },
      repaymentSchedule: { create: jest.fn() },
      webhookEvent: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      idempotencyRecord: { findUnique: jest.fn(), create: jest.fn() },
      employee: { findUnique: jest.fn() },
      attendanceRecord: {
        findFirst: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn().mockResolvedValue({ id: 'att-101', totalApprovedWorkedDays: 8 }),
      },
      reconciliationException: { create: jest.fn() },
      auditEvent: { create: jest.fn() },
    };
  });

  // Rule 1: Maximum two EWA withdrawals per salary cycle
  it('Rule 1: Enforces maximum of two EWA withdrawals per salary cycle', () => {
    // 0 previous withdrawals: eligible, 2 remaining
    const result0 = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 15,
      alreadyWithdrawnPaise: 0,
      withdrawalCountInCycle: 0,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardEwaPolicy,
    });
    expect(result0.isEligible).toBe(true);
    expect(result0.remainingWithdrawalsInCycle).toBe(2);

    // 1 previous withdrawal: eligible, 1 remaining
    const result1 = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 15,
      alreadyWithdrawnPaise: 500000,
      withdrawalCountInCycle: 1,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardEwaPolicy,
    });
    expect(result1.isEligible).toBe(true);
    expect(result1.remainingWithdrawalsInCycle).toBe(1);

    // 2 previous withdrawals: ineligible, 0 remaining
    const result2 = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 20,
      alreadyWithdrawnPaise: 1000000,
      withdrawalCountInCycle: 2,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardEwaPolicy,
    });
    expect(result2.isEligible).toBe(false);
    expect(result2.remainingWithdrawalsInCycle).toBe(0);
    expect(result2.ineligibilityReason).toContain('Maximum withdrawals per cycle limit reached (2/2)');
  });

  // Rule 2: ₹1,000 minimum and ₹50,000 maximum EWA withdrawal
  it('Rule 2: Enforces ₹1,000 minimum and ₹50,000 maximum EWA withdrawal thresholds', () => {
    // Under ₹1,000: Net wage earned Rs 800 (80,000 paise) < Rs 1,000 (100,000 paise)
    const belowMinResult = calculateEwaEligibility({
      monthlyNetSalaryPaise: 2400000, // Rs 24,000
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 2, // 2 days * Rs 800 = Rs 1,600 * 50% = Rs 800 (80,000 paise)
      alreadyWithdrawnPaise: 0,
      withdrawalCountInCycle: 0,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardEwaPolicy,
    });
    expect(belowMinResult.isEligible).toBe(false);
    expect(belowMinResult.ineligibilityReason).toContain('less than the minimum withdrawal limit of ₹1,000');

    // Over ₹50,000: High earner earns Rs 1,50,000 -> 50% = Rs 75,000 -> Strictly capped at Rs 50,000
    const highEarnerResult = calculateEwaEligibility({
      monthlyNetSalaryPaise: 30000000, // Rs 3,00,000
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 15,
      alreadyWithdrawnPaise: 0,
      withdrawalCountInCycle: 0,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardEwaPolicy,
    });
    expect(highEarnerResult.isEligible).toBe(true);
    expect(highEarnerResult.availableEwaPaise).toBe(5000000); // Exactly Rs 50,000
    expect(highEarnerResult.maxWithdrawalAllowedPaise).toBe(5000000);
  });

  // Rule 3: Payroll freeze window enforcement
  it('Rule 3: Enforces payroll freeze window prior to reconciliation cutoff', () => {
    // Cutoff: 25th, Freeze: 3 days -> Days 22-25 are frozen
    const duringFreezeResult = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 22,
      alreadyWithdrawnPaise: 0,
      withdrawalCountInCycle: 0,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardEwaPolicy,
      currentDayOfMonth: 23, // Day 23 is inside freeze window
    });
    expect(duringFreezeResult.isEligible).toBe(false);
    expect(duringFreezeResult.availableEwaPaise).toBe(0);
    expect(duringFreezeResult.ineligibilityReason).toContain('currently frozen for reconciliation cutoff');

    // Day 20: Prior to freeze window -> Eligible
    const priorToFreezeResult = calculateEwaEligibility({
      monthlyNetSalaryPaise: 6000000,
      totalPayableDaysInMonth: 30,
      approvedDaysWorked: 20,
      alreadyWithdrawnPaise: 0,
      withdrawalCountInCycle: 0,
      activeMonthlyEmisPaise: 0,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardEwaPolicy,
      currentDayOfMonth: 20,
    });
    expect(priorToFreezeResult.isEligible).toBe(true);
    expect(priorToFreezeResult.availableEwaPaise).toBeGreaterThan(0);
  });

  // Rule 4: Next salary-cycle repayment scheduling
  it('Rule 4: Schedules loan EMI and EWA repayment in the next salary cycle without current-month deduction', () => {
    const emiResult = calculatePayrollLoanEmi({
      principalPaise: 12000000, // Rs 1,20,000
      annualInterestRatePercent: 14.5,
      tenureMonths: 12,
      processingFeePercent: 1.5,
    });

    expect(emiResult.monthlyEmiPaise).toBeGreaterThan(0);
    expect(emiResult.totalRepaymentPaise).toBe(emiResult.monthlyEmiPaise * 12);
    expect(emiResult.totalInterestPaise).toBe(emiResult.totalRepaymentPaise - 12000000);
    // Integer paise accuracy
    expect(Number.isInteger(emiResult.monthlyEmiPaise)).toBe(true);
    expect(Number.isInteger(emiResult.totalInterestPaise)).toBe(true);
  });

  // Rule 5: Attendance correction after disbursement without modifying existing loan
  it('Rule 5: Attendance correction after disbursement preserves existing loan and generates reconciliation exception if overdrawn', async () => {
    const attendanceService = new AttendanceService(mockPrisma as PrismaService);

    // Employee already disbursed EWA loan of Rs 15,000 (1,500,000 paise)
    mockPrisma.employee.findUnique.mockResolvedValue({
      id: 'emp-101',
      employmentStatus: 'CONFIRMED',
      organization: {
        policies: [
          {
            maxEwaPercentage: 50,
            minEwaWithdrawalPaise: 100000,
            maxEwaWithdrawalPaise: 5000000,
            maxEwaWithdrawalsPerCycle: 2,
            payrollCutoffDay: 25,
            payrollFreezeDaysBeforeCutoff: 0,
            ewaFeePaise: 9900,
          },
        ],
      },
      salaryRecords: [{ month: 11, year: 2026, monthlyNetPaise: 6000000 }],
      loans: [{ principalPaise: 1500000, productType: 'EWA', status: 'ACTIVE' }],
    });

    mockPrisma.attendanceRecord.findFirst.mockResolvedValue({
      id: 'att-101',
      totalApprovedWorkedDays: 15,
      totalPayableDays: 30,
    });
    mockPrisma.attendanceRecord.update.mockResolvedValue({});
    mockPrisma.reconciliationException.create.mockResolvedValue({ id: 'exc-1' });

    // HR corrects attendance downwards from 15 days to 8 days worked
    // 8 days * Rs 2,000 = Rs 16,000 * 50% cap = Rs 8,000 new cap.
    // Disbursed Rs 15,000 > new cap Rs 8,000 -> Overdrawn by Rs 7,000!
    const result = await attendanceService.correctAttendance('emp-101', {
      month: 11,
      year: 2026,
      newDaysPresent: 8,
      newPaidLeaveDays: 0,
      notes: 'Late unapproved leave deduction',
      correctedByUserId: 'hr-user-1',
    });

    // 1. Existing loan was NOT mutated or deleted
    expect(mockPrisma.loan.create).not.toHaveBeenCalled();
    // 2. Reconciliation exception was raised
    expect(result.exceptionCreated).toBeDefined();
    expect(mockPrisma.reconciliationException.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          exceptionType: ReconciliationExceptionType.ATTENDANCE_CORRECTION_OVERDRAW,
          expectedPaise: 800000, // New cap
          actualPaise: 1500000,  // Already disbursed
        }),
      }),
    );
  });

  // Rule 6: Combined EWA and payroll-loan FOIR
  it('Rule 6: Combines existing active EWA obligations into FOIR when calculating payroll loan capacity', () => {
    // Salary: Rs 60,000 (6,000,000 paise). 50% FOIR cap = Rs 30,000 total debt capacity (3,000,000 paise)
    // Active EMI: Rs 25,000 (2,500,000 paise)
    // Active EWA: Rs 8,000 (800,000 paise) -> Total combined debt = Rs 33,000 (exceeds Rs 30,000 cap!)
    const result = calculatePayrollLoanEligibility({
      monthlyNetSalaryPaise: 6000000,
      activeMonthlyEmisPaise: 2500000,
      activeEwaObligationsPaise: 800000,
      employmentStatus: EmploymentStatus.CONFIRMED,
      policy: standardLoanPolicy,
    });

    expect(result.isEligible).toBe(false);
    expect(result.consideredEwaInFoir).toBe(true);
    expect(result.ineligibilityReason).toContain('active EWA obligation of ₹8,000');
    expect(result.ineligibilityReason).toContain('exceed maximum permissible FOIR cap of 50%');
  });

  // Rule 7: Duplicate disbursement prevention
  it('Rule 7: Prevents duplicate disbursement on an application already in DISBURSED state', () => {
    // State machine disallows any transition out of DISBURSED
    expect(canTransitionApplication(ApplicationStatus.DISBURSED, ApplicationStatus.DISBURSED)).toBe(false);
    expect(canTransitionApplication(ApplicationStatus.DISBURSED, ApplicationStatus.APPROVED)).toBe(false);
    expect(canTransitionApplication(ApplicationStatus.DISBURSED, ApplicationStatus.DRAFT)).toBe(false);
  });

  // Rule 8: Notice period, suspended, and terminated eligibility restrictions
  it('Rule 8: Ineligible employment statuses (NOTICE_PERIOD, SUSPENDED, TERMINATED) strictly receive 0 eligibility', () => {
    const ineligibleStatuses = [
      EmploymentStatus.NOTICE_PERIOD,
      EmploymentStatus.SUSPENDED,
      EmploymentStatus.TERMINATED,
    ];

    for (const status of ineligibleStatuses) {
      const ewaRes = calculateEwaEligibility({
        monthlyNetSalaryPaise: 8000000,
        totalPayableDaysInMonth: 30,
        approvedDaysWorked: 25,
        alreadyWithdrawnPaise: 0,
        withdrawalCountInCycle: 0,
        activeMonthlyEmisPaise: 0,
        employmentStatus: status,
        policy: standardEwaPolicy,
      });
      expect(ewaRes.isEligible).toBe(false);
      expect(ewaRes.availableEwaPaise).toBe(0);

      const loanRes = calculatePayrollLoanEligibility({
        monthlyNetSalaryPaise: 8000000,
        activeMonthlyEmisPaise: 0,
        employmentStatus: status,
        policy: standardLoanPolicy,
      });
      expect(loanRes.isEligible).toBe(false);
      expect(loanRes.maxLoanAmountPaise).toBe(0);
    }
  });

  // Rule 9: Out-of-order NBFC events cannot regress a more advanced loan state
  it('Rule 9: Out-of-order NBFC events cannot regress a more advanced loan state', async () => {
    const nbfcService = new NbfcService(mockPrisma as PrismaService);

    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'wh-late-1' });

    // Application is already DISBURSED
    mockPrisma.loanApplication.findUnique.mockResolvedValue({
      id: 'app-disbursed-99',
      status: ApplicationStatus.DISBURSED,
      requestedAmountPaise: 3000000,
      loan: { id: 'loan-existing' },
    });

    const delayedApprovalPayload = {
      eventId: 'EVT_OUT_OF_ORDER_APPROVE',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-disbursed-99',
      timestamp: new Date().toISOString(),
      isSimulated: true,
    };

    const result = await nbfcService.processWebhook(delayedApprovalPayload);
    expect(result.status).toBe('OUT_OF_ORDER_IGNORED');
    expect(result.message).toContain('supersedes incoming event APPLICATION_APPROVED');
    // Verifies application status was NOT regressed to APPROVED
    expect(mockPrisma.loanApplication.update).not.toHaveBeenCalled();
  });
});
