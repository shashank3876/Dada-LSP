import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  calculateEwaEligibility,
  calculatePayrollLoanEligibility,
  EmploymentStatus,
} from '@dada/contracts';

@Injectable()
export class EligibilityService {
  constructor(private prisma: PrismaService) {}

  async checkEwaEligibility(employeeId: string, month = 11, year = 2026) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        organization: { include: { policies: true } },
        salaryRecords: { where: { month, year } },
        attendanceRecords: { where: { month, year } },
        loans: {
          where: { productType: 'EWA', status: 'ACTIVE' },
          include: { application: true },
        },
      },
    });

    if (!employee) throw new NotFoundException('Employee record not found');
    const policy = employee.organization.policies[0];
    if (!policy) throw new BadRequestException('No corporate policy found for employer');

    const salary = employee.salaryRecords[0] || {
      monthlyNetPaise: 6000000,
    };
    const attendance = employee.attendanceRecords[0] || {
      totalPayableDays: 30,
      totalApprovedWorkedDays: 15,
    };

    const alreadyWithdrawnPaise = employee.loans.reduce((sum, l) => sum + l.principalPaise, 0);
    const activeMonthlyEmisPaise = employee.loans
      .filter((l) => l.productType === 'PAYROLL_LOAN')
      .reduce((sum, l) => sum + l.monthlyEmiPaise, 0);

    const calculation = calculateEwaEligibility({
      monthlyNetSalaryPaise: salary.monthlyNetPaise,
      totalPayableDaysInMonth: attendance.totalPayableDays,
      approvedDaysWorked: attendance.totalApprovedWorkedDays,
      alreadyWithdrawnPaise,
      withdrawalCountInCycle: employee.loans.length,
      activeMonthlyEmisPaise,
      employmentStatus: employee.employmentStatus as EmploymentStatus,
      currentDayOfMonth: new Date().getDate(),
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

    return {
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        employmentStatus: employee.employmentStatus,
        monthlyNetSalaryPaise: salary.monthlyNetPaise,
      },
      attendance: {
        totalPayableDays: attendance.totalPayableDays,
        totalApprovedWorkedDays: attendance.totalApprovedWorkedDays,
      },
      policy: {
        maxEwaPercentage: policy.maxEwaPercentage,
        convenienceFeePaise: policy.ewaFeePaise,
        payrollCutoffDay: policy.payrollCutoffDay,
      },
      ...calculation,
    };
  }

  async checkPayrollLoanEligibility(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        organization: { include: { policies: true } },
        salaryRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
        loans: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    const policy = employee.organization.policies[0];
    if (!policy) throw new BadRequestException('No corporate policy found');

    const salary = employee.salaryRecords[0] || { monthlyNetPaise: 6000000 };
    const activeMonthlyEmisPaise = employee.loans
      .filter((l) => l.productType === 'PAYROLL_LOAN')
      .reduce((sum, l) => sum + l.monthlyEmiPaise, 0);

    const activeEwaObligationsPaise = employee.loans
      .filter((l) => l.productType === 'EWA')
      .reduce((sum, l) => sum + l.principalPaise, 0);

    let provisionalTenuresMonths = [6, 12, 18, 24, 36];
    if (policy.provisionalTenuresJson) {
      try {
        provisionalTenuresMonths = JSON.parse(policy.provisionalTenuresJson);
      } catch (e) {
        provisionalTenuresMonths = [6, 12, 18, 24, 36];
      }
    }

    const result = calculatePayrollLoanEligibility({
      monthlyNetSalaryPaise: salary.monthlyNetPaise,
      activeMonthlyEmisPaise,
      activeEwaObligationsPaise,
      employmentStatus: employee.employmentStatus as EmploymentStatus,
      policy: {
        salaryMultiplier: policy.salaryMultiplier,
        minTenureMonths: policy.minTenureMonths,
        maxTenureMonths: policy.maxTenureMonths,
        provisionalTenuresMonths,
        annualInterestRatePercent: policy.annualInterestRatePercent,
        processingFeePercent: policy.processingFeePercent,
        maxFoirPercent: policy.maxFoirPercent,
        considerEwaInFoir: policy.considerEwaInFoir,
        maxCombinedDebtPaise: policy.maxCombinedDebtPaise || undefined,
      },
    });

    return {
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        monthlyNetSalaryPaise: salary.monthlyNetPaise,
        employmentStatus: employee.employmentStatus,
        activeMonthlyEmisPaise,
        activeEwaObligationsPaise,
      },
      policy: {
        annualInterestRatePercent: policy.annualInterestRatePercent,
        processingFeePercent: policy.processingFeePercent,
        salaryMultiplier: policy.salaryMultiplier,
        maxFoirPercent: policy.maxFoirPercent,
        provisionalTenuresMonths,
        considerEwaInFoir: policy.considerEwaInFoir,
      },
      ...result,
    };
  }
}
