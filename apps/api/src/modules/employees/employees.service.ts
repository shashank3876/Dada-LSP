import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any) {
    let where: any = {};

    if (user.role === 'EMPLOYEE') {
      where = { id: user.employeeId };
    } else if (user.role.startsWith('HR_')) {
      where = { organizationId: user.organizationId };
    } else if (user.role.startsWith('DADA_')) {
      where = {};
    }

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

  async findOne(id: string, user: any) {
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

    // Multi-tenant check: Prevent IDOR
    if (user.role === 'EMPLOYEE' && employee.id !== user.employeeId) {
      throw new ForbiddenException('Access denied: You can only view your own employee record.');
    }
    if (user.role.startsWith('HR_') && employee.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied: Employee belongs to another organization.');
    }

    return employee;
  }

  async importEmployees(user: any, employeeList: any[]) {
    if (!user.role.startsWith('HR_') && !user.role.startsWith('DADA_')) {
      throw new ForbiddenException('Access denied: Only HR and Dada administrators can import employees.');
    }

    const organizationId = user.role.startsWith('HR_')
      ? user.organizationId
      : employeeList[0]?.organizationId || user.organizationId;

    if (!organizationId) {
      throw new BadRequestException('Organization ID is required for employee import.');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException('Target organization not found.');
    }

    const validRows: any[] = [];
    const rejectedRows: any[] = [];

    // Pre-fetch existing employee codes and emails for this org to prevent duplicate conflicts
    const existingEmployees = await this.prisma.employee.findMany({
      where: { organizationId },
      select: { employeeCode: true, officialEmail: true },
    });
    const existingCodes = new Set(existingEmployees.map((e) => e.employeeCode.toUpperCase()));
    const existingEmails = new Set(existingEmployees.map((e) => e.officialEmail.toLowerCase()));

    const seenCodesInBatch = new Set<string>();
    const seenEmailsInBatch = new Set<string>();

    for (let i = 0; i < (employeeList || []).length; i++) {
      const row = employeeList[i];
      const rowNum = i + 1;

      const code = String(row.employeeCode || '').trim().toUpperCase();
      const firstName = String(row.firstName || '').trim();
      const lastName = String(row.lastName || '').trim();
      const email = String(row.officialEmail || '').trim().toLowerCase();
      const phone = String(row.mobileNumber || '+919800000000').trim();
      const department = String(row.department || 'Operations').trim();
      const designation = String(row.designation || 'Specialist').trim();
      const netSalaryPaise =
        Number(row.monthlyNetSalaryPaise) ||
        (Number(row.monthlyNetSalary) ? Math.round(Number(row.monthlyNetSalary) * 100) : 5000000);
      const pan = String(row.panNumber || 'ABCDE1234F').trim().toUpperCase();

      if (!code) {
        rejectedRows.push({ row: rowNum, code: 'N/A', email, reason: 'Missing employeeCode' });
        continue;
      }
      if (!firstName || !lastName) {
        rejectedRows.push({ row: rowNum, code, email, reason: 'Missing firstName or lastName' });
        continue;
      }
      if (!email || !email.includes('@')) {
        rejectedRows.push({ row: rowNum, code, email, reason: 'Invalid or missing officialEmail' });
        continue;
      }
      if (existingCodes.has(code) || seenCodesInBatch.has(code)) {
        rejectedRows.push({ row: rowNum, code, email, reason: `Employee code ${code} already exists in organization` });
        continue;
      }
      if (existingEmails.has(email) || seenEmailsInBatch.has(email)) {
        rejectedRows.push({ row: rowNum, code, email, reason: `Official email ${email} already registered` });
        continue;
      }

      seenCodesInBatch.add(code);
      seenEmailsInBatch.add(email);

      validRows.push({
        organizationId,
        employeeCode: code,
        firstName,
        lastName,
        officialEmail: email,
        mobileNumber: phone,
        panNumberMasked: `${pan.slice(0, 2)}XXXXX${pan.slice(-2)}`,
        department,
        designation,
        dateOfJoining: new Date(),
        employmentStatus: 'CONFIRMED',
        netSalaryPaise,
        bankAccountNo: String(row.bankAccountNumber || 'XXXX-XXXX-8822'),
        ifscCode: String(row.ifscCode || 'HDFC0000123'),
      });
    }

    const createdEmployees: any[] = [];
    for (const item of validRows) {
      const emp = await this.prisma.employee.create({
        data: {
          organizationId: item.organizationId,
          employeeCode: item.employeeCode,
          firstName: item.firstName,
          lastName: item.lastName,
          officialEmail: item.officialEmail,
          mobileNumber: item.mobileNumber,
          panNumberMasked: item.panNumberMasked,
          department: item.department,
          designation: item.designation,
          dateOfJoining: item.dateOfJoining,
          employmentStatus: item.employmentStatus,
        },
      });

      // Seed current salary record
      await this.prisma.salaryRecord.create({
        data: {
          employeeId: emp.id,
          month: 11,
          year: 2026,
          monthlyGrossPaise: Math.round(item.netSalaryPaise * 1.15),
          monthlyNetPaise: item.netSalaryPaise,
          basicPayPaise: Math.round(item.netSalaryPaise * 0.5),
          hraPaise: Math.round(item.netSalaryPaise * 0.25),
          allowancesPaise: Math.round(item.netSalaryPaise * 0.25),
          pfDeductionPaise: Math.round(item.netSalaryPaise * 0.06),
          taxDeductionPaise: Math.round(item.netSalaryPaise * 0.09),
        },
      });

      // Seed bank account
      await this.prisma.bankAccount.create({
        data: {
          employeeId: emp.id,
          accountNumber: item.bankAccountNo,
          ifscCode: item.ifscCode,
          bankName: 'HDFC Bank Ltd',
          isSalaryAccount: true,
          isPennyDropVerified: true,
          beneficiaryName: `${item.firstName} ${item.lastName}`,
        },
      });

      // Seed default attendance for current month
      await this.prisma.attendanceRecord.create({
        data: {
          employeeId: emp.id,
          month: 11,
          year: 2026,
          totalPayableDays: 30,
          daysPresent: 20,
          paidLeaveDays: 2,
          lossOfPayDays: 8,
          totalApprovedWorkedDays: 22,
        },
      });

      createdEmployees.push(emp);
    }

    return {
      message: `Employee roster import completed: ${createdEmployees.length} imported, ${rejectedRows.length} rejected.`,
      importedCount: createdEmployees.length,
      rejectedCount: rejectedRows.length,
      rejectedRows,
    };
  }
}
