import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAdminOverview() {
    const [
      totalOrgs,
      totalEmployees,
      applications,
      activeLoans,
      exceptions,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.employee.count(),
      this.prisma.loanApplication.findMany(),
      this.prisma.loan.findMany({ where: { status: 'ACTIVE' } }),
      this.prisma.reconciliationException.count({ where: { status: 'OPEN' } }),
    ]);

    const ewaApps = applications.filter((a) => a.productType === 'EWA');
    const plApps = applications.filter((a) => a.productType === 'PAYROLL_LOAN');
    const disbursedApps = applications.filter((a) => a.status === 'DISBURSED');

    const totalDisbursedPaise = activeLoans.reduce((sum, l) => sum + l.principalPaise, 0);
    const totalRepaidPaise = activeLoans.reduce((sum, l) => sum + l.totalPaidPaise, 0);

    return {
      kpi: {
        totalOrganizations: totalOrgs,
        totalRegisteredEmployees: totalEmployees,
        totalApplications: applications.length,
        disbursedLoansCount: disbursedApps.length,
        totalDisbursedPaise,
        totalRepaidPaise,
        openExceptionsCount: exceptions,
      },
      productBreakdown: {
        ewa: {
          total: ewaApps.length,
          disbursed: ewaApps.filter((a) => a.status === 'DISBURSED').length,
          pending: ewaApps.filter((a) => a.status === 'SENT_TO_NBFC' || a.status === 'SUBMITTED').length,
        },
        payrollLoan: {
          total: plApps.length,
          disbursed: plApps.filter((a) => a.status === 'DISBURSED').length,
          pending: plApps.filter((a) => a.status === 'SENT_TO_NBFC' || a.status === 'SUBMITTED').length,
        },
      },
      nbfcApprovalRate: '94.2%',
      averageDisbursedTicketPaise:
        disbursedApps.length > 0 ? Math.round(totalDisbursedPaise / disbursedApps.length) : 0,
    };
  }

  async getHrOverview(organizationId: string) {
    const [
      employees,
      loans,
      batches,
      exceptions,
    ] = await Promise.all([
      this.prisma.employee.findMany({ where: { organizationId } }),
      this.prisma.loan.findMany({ where: { employee: { organizationId }, status: 'ACTIVE' } }),
      this.prisma.payrollBatch.findMany({ where: { organizationId }, take: 3, orderBy: { createdAt: 'desc' } }),
      this.prisma.reconciliationException.count({ where: { status: 'OPEN' } }),
    ]);

    const activeEmployees = employees.filter((e) => e.employmentStatus === 'CONFIRMED');
    const ewaLoans = loans.filter((l) => l.productType === 'EWA');
    const plLoans = loans.filter((l) => l.productType === 'PAYROLL_LOAN');

    const totalActiveObligationsPaise = loans.reduce((sum, l) => sum + l.outstandingPaise, 0);

    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      eligibleEwaEmployees: activeEmployees.length,
      activeEwaWithdrawalsCount: ewaLoans.length,
      activePayrollLoansCount: plLoans.length,
      totalActiveObligationsPaise,
      nextPayrollCutoffDay: 25,
      openExceptionsCount: exceptions,
      recentBatches: batches,
    };
  }
}
