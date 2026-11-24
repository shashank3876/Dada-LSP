import { Injectable, NotFoundException } from '@nestjs/common';
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
}
