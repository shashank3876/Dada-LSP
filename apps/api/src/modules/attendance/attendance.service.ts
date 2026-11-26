import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { calculateEwaEligibility, EmploymentStatus, ReconciliationExceptionType } from '@dada/contracts';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findEmployeeOrg(employeeId: string) {
    return this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { organizationId: true },
    });
  }

  async findAll(organizationId?: string, month = 11, year = 2026) {
    const where: any = { month, year };
    if (organizationId) {
      where.employee = { organizationId };
    }
    return this.prisma.attendanceRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            employmentStatus: true,
          },
        },
      },
    });
  }

  /**
   * Corrects attendance record and enforces all 5 business rules:
   * 1. Preserves original disbursed loan and repayment obligation without silent mutation.
   * 2. Recalculates employee remaining eligibility.
   * 3. Creates an exception if already-withdrawn amount exceeds new eligible cap.
   * 4. Logs audit event.
   */
  async correctAttendance(
    employeeId: string,
    data: {
      month: number;
      year: number;
      newDaysPresent: number;
      newPaidLeaveDays: number;
      notes: string;
      correctedByUserId: string;
    },
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        organization: { include: { policies: true } },
        salaryRecords: { where: { month: data.month, year: data.year } },
        attendanceRecords: { where: { month: data.month, year: data.year } },
        loans: {
          where: { productType: 'EWA', status: 'ACTIVE' },
          include: { application: true },
        },
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    const salary = employee.salaryRecords[0];
    if (!salary) throw new BadRequestException('No salary record found for this cycle');
    const policy = employee.organization.policies[0];
    if (!policy) throw new BadRequestException('No corporate policy configured');

    const totalPayableDays = 30;
    const lossOfPayDays = Math.max(0, totalPayableDays - (data.newDaysPresent + data.newPaidLeaveDays));
    const totalApprovedWorkedDays = data.newDaysPresent + data.newPaidLeaveDays;

    // Update attendance record
    const updatedAttendance = await this.prisma.attendanceRecord.upsert({
      where: { employeeId_year_month: { employeeId, year: data.year, month: data.month } },
      create: {
        employeeId,
        month: data.month,
        year: data.year,
        totalPayableDays,
        daysPresent: data.newDaysPresent,
        paidLeaveDays: data.newPaidLeaveDays,
        lossOfPayDays,
        totalApprovedWorkedDays,
        correctionNotes: data.notes,
      },
      update: {
        daysPresent: data.newDaysPresent,
        paidLeaveDays: data.newPaidLeaveDays,
        lossOfPayDays,
        totalApprovedWorkedDays,
        correctionNotes: data.notes,
      },
    });

    // Sum already-withdrawn EWA in this cycle
    const alreadyWithdrawnPaise = employee.loans.reduce((sum, l) => sum + l.principalPaise, 0);

    // Recalculate remaining eligibility
    const newEligibility = calculateEwaEligibility({
      monthlyNetSalaryPaise: salary.monthlyNetPaise,
      totalPayableDaysInMonth: totalPayableDays,
      approvedDaysWorked: totalApprovedWorkedDays,
      alreadyWithdrawnPaise,
      withdrawalCountInCycle: employee.loans.length,
      activeMonthlyEmisPaise: 0,
      employmentStatus: employee.employmentStatus as EmploymentStatus,
      policy: {
        maxEwaPercentage: policy.maxEwaPercentage,
        minWithdrawalPaise: policy.minEwaWithdrawalPaise,
        maxWithdrawalPaise: policy.maxEwaWithdrawalPaise,
        maxWithdrawalsPerCycle: policy.maxEwaWithdrawalsPerCycle,
        payrollCutoffDay: policy.payrollCutoffDay,
        payrollFreezeDaysBeforeCutoff: policy.payrollFreezeDaysBeforeCutoff || 0,
        flatConvenienceFeePaise: policy.ewaFeePaise,
      },
    });

    let createdException = null;

    // Rule 3: Check if already withdrawn amount exceeds new eligible cap
    if (alreadyWithdrawnPaise > newEligibility.eligibleEarnedCapPaise) {
      createdException = await this.prisma.reconciliationException.create({
        data: {
          exceptionType: ReconciliationExceptionType.ATTENDANCE_CORRECTION_OVERDRAW,
          expectedPaise: newEligibility.eligibleEarnedCapPaise,
          actualPaise: alreadyWithdrawnPaise,
          status: 'OPEN',
          resolutionNotes: `Attendance corrected to ${totalApprovedWorkedDays} days worked. Overdraw detected: Employee previously withdrew ₹${alreadyWithdrawnPaise / 100}, but new cap is ₹${newEligibility.eligibleEarnedCapPaise / 100}. Disbursed loan of ₹${alreadyWithdrawnPaise / 100} is strictly preserved.`,
        },
      });
    }

    // Log audit event
    await this.prisma.auditEvent.create({
      data: {
        organizationId: employee.organizationId,
        userId: data.correctedByUserId,
        action: 'ATTENDANCE_CORRECTED',
        resourceType: 'ATTENDANCE',
        resourceId: updatedAttendance.id,
        metadataJson: JSON.stringify({
          employeeId,
          daysPresent: data.newDaysPresent,
          paidLeaveDays: data.newPaidLeaveDays,
          lossOfPayDays,
          overdrawn: alreadyWithdrawnPaise > newEligibility.eligibleEarnedCapPaise,
          exceptionId: createdException?.id,
        }),
      },
    });

    return {
      attendance: updatedAttendance,
      recalculatedEligibility: newEligibility,
      exceptionCreated: createdException,
      message: 'Attendance corrected. Existing disbursed loans and repayment obligations remain intact.',
    };
  }
}
