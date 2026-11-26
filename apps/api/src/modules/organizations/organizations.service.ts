import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: { employees: true, loanApplications: true, users: true },
        },
        policies: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        employees: { take: 20 },
        policies: true,
        hrmsIntegrations: true,
        _count: {
          select: { employees: true, loanApplications: true, payrollBatches: true },
        },
      },
    });
    if (!org) throw new NotFoundException('Organization not found.');
    return org;
  }

  async create(data: {
    code: string;
    name: string;
    cinNumber: string;
    registeredAddress: string;
    domain?: string;
  }) {
    const normalizedCode = data.code.trim().toUpperCase();
    const existing = await this.prisma.organization.findFirst({
      where: { code: normalizedCode },
    });
    if (existing) {
      throw new BadRequestException(`Organization with code ${normalizedCode} already exists.`);
    }

    const org = await this.prisma.organization.create({
      data: {
        code: normalizedCode,
        name: data.name.trim(),
        cinNumber: data.cinNumber.trim().toUpperCase(),
        registeredAddress: data.registeredAddress.trim(),
        domain: data.domain?.trim().toLowerCase(),
        isActive: true,
      },
    });

    // Automatically create default corporate policy for newly onboarded organization
    await this.prisma.corporatePolicy.create({
      data: {
        organizationId: org.id,
        maxEwaPercentage: 50,
        minEwaWithdrawalPaise: 100000,
        maxEwaWithdrawalPaise: 5000000,
        maxEwaWithdrawalsPerCycle: 2,
        payrollCutoffDay: 25,
        ewaFeePaise: 9900,
        allowPayrollLoans: true,
        salaryMultiplier: 3,
        minTenureMonths: 6,
        maxTenureMonths: 24,
        annualInterestRatePercent: 14.5,
        processingFeePercent: 1.5,
        maxFoirPercent: 50,
      },
    });

    return org;
  }
}
