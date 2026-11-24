import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SalaryService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId?: string, month = 11, year = 2026) {
    const where: any = { month, year };
    if (organizationId) {
      where.employee = { organizationId };
    }
    return this.prisma.salaryRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
          },
        },
      },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.salaryRecord.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
