import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../common/prisma.service';
import { EmploymentStatus, ReconciliationExceptionType } from '@dada/contracts';

describe('AttendanceService - Business Rules & Corrections', () => {
  let service: AttendanceService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findUnique: jest.fn(),
      },
      attendanceRecord: {
        upsert: jest.fn(),
      },
      reconciliationException: {
        create: jest.fn(),
      },
      auditEvent: {
        create: jest.fn(),
      },
    };

    service = new AttendanceService(mockPrisma as PrismaService);
  });

  it('preserves existing disbursed loan and flags an exception when attendance correction reduces earned wage cap below withdrawn amount', async () => {
    // Employee had withdrawn Rs 20,000 (2,000,000 paise)
    // New attendance correction reduces worked days from 20 to 5 days
    // Monthly net salary: Rs 60,000 (6,000,000 paise). 30 days => Rs 2,000/day.
    // 5 days worked => Rs 10,000 earned. 50% cap => Rs 5,000 (500,000 paise).
    // Rs 20,000 already withdrawn > Rs 5,000 new cap => Overdraw exception generated!
    const mockEmployee = {
      id: 'emp-101',
      organizationId: 'org-1',
      employmentStatus: EmploymentStatus.CONFIRMED,
      organization: {
        policies: [
          {
            maxEwaPercentage: 50,
            minEwaWithdrawalPaise: 100000,
            maxEwaWithdrawalPaise: 5000000,
            maxEwaWithdrawalsPerCycle: 2,
            payrollCutoffDay: 25,
            ewaFeePaise: 9900,
          },
        ],
      },
      salaryRecords: [{ monthlyNetPaise: 6000000 }],
      attendanceRecords: [{ totalPayableDays: 30, totalApprovedWorkedDays: 20 }],
      loans: [
        {
          id: 'loan-1',
          productType: 'EWA',
          principalPaise: 2000000, // Rs 20,000 already disbursed
          status: 'ACTIVE',
        },
      ],
    };

    mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
    mockPrisma.attendanceRecord.upsert.mockResolvedValue({
      id: 'att-1',
      daysPresent: 5,
      totalApprovedWorkedDays: 5,
    });
    mockPrisma.reconciliationException.create.mockResolvedValue({
      id: 'exc-99',
      exceptionType: ReconciliationExceptionType.ATTENDANCE_CORRECTION_OVERDRAW,
    });
    mockPrisma.auditEvent.create.mockResolvedValue({ id: 'aud-1' });

    const result = await service.correctAttendance('emp-101', {
      month: 11,
      year: 2026,
      newDaysPresent: 5,
      newPaidLeaveDays: 0,
      notes: 'LOP adjustments after leave audit',
      correctedByUserId: 'hr-user-1',
    });

    expect(result.recalculatedEligibility.eligibleEarnedCapPaise).toBe(500000);
    expect(result.recalculatedEligibility.availableEwaPaise).toBe(0); // Cannot withdraw more
    expect(mockPrisma.reconciliationException.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          exceptionType: ReconciliationExceptionType.ATTENDANCE_CORRECTION_OVERDRAW,
          actualPaise: 2000000, // Preserved disbursed amount
          expectedPaise: 500000, // New cap
        }),
      }),
    );
    expect(result.message).toContain('Existing disbursed loans and repayment obligations remain intact');
  });
});
