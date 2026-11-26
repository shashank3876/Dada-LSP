import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SalaryService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any, month = 11, year = 2026) {
    const where: any = { month, year };
    if (user.role === 'EMPLOYEE') {
      where.employeeId = user.employeeId;
    } else if (user.role.startsWith('HR_')) {
      where.employee = { organizationId: user.organizationId };
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

  async findByEmployee(employeeId: string, user: any) {
    if (user.role === 'EMPLOYEE' && employeeId !== user.employeeId) {
      throw new ForbiddenException('Access denied: You can only view your own salary records.');
    }

    if (user.role.startsWith('HR_')) {
      const emp = await this.prisma.employee.findUnique({
        where: { id: employeeId },
        select: { organizationId: true },
      });
      if (!emp || emp.organizationId !== user.organizationId) {
        throw new ForbiddenException('Access denied: Employee belongs to another organization.');
      }
    }

    return this.prisma.salaryRecord.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
