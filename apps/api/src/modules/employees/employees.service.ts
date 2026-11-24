import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};
    return this.prisma.employee.findMany({
      where,
      include: {
        organization: { select: { name: true, code: true } },
        salaryRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
        attendanceRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        organization: true,
        salaryRecords: { orderBy: { month: 'desc' }, take: 6 },
        attendanceRecords: { orderBy: { month: 'desc' }, take: 6 },
        bankAccounts: true,
        kycRecords: true,
        mandates: true,
        loans: { include: { repaymentSchedules: true } },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found.');
    return employee;
  }
}
