import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ApplicationStatus } from '@dada/contracts';

@Injectable()
export class LoanApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(options: { organizationId?: string; employeeId?: string; productType?: string; status?: string }) {
    const where: any = {};
    if (options.organizationId) where.organizationId = options.organizationId;
    if (options.employeeId) where.employeeId = options.employeeId;
    if (options.productType) where.productType = options.productType;
    if (options.status) where.status = options.status;

    return this.prisma.loanApplication.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        ewaDetails: true,
        payrollLoanDetails: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        loan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            organization: true,
            bankAccounts: true,
            kycRecords: true,
          },
        },
        nbfcPartner: true,
        ewaDetails: true,
        payrollLoanDetails: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        loan: {
          include: {
            repaymentSchedules: { orderBy: { installmentNumber: 'asc' } },
          },
        },
      },
    });

    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async transitionStatus(
    id: string,
    toStatus: ApplicationStatus,
    changedByRole: string,
    remarks: string,
  ) {
    const app = await this.prisma.loanApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');

    const updated = await this.prisma.loanApplication.update({
      where: { id },
      data: {
        status: toStatus,
        statusHistory: {
          create: {
            fromStatus: app.status,
            toStatus,
            changedByRole,
            remarks,
          },
        },
      },
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    });

    return updated;
  }
}
