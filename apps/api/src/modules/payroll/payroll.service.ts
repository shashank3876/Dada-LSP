import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async getBatches(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};
    return this.prisma.payrollBatch.findMany({
      where,
      include: {
        organization: { select: { name: true, code: true } },
        items: {
          include: {
            employee: { select: { firstName: true, lastName: true, employeeCode: true, department: true } },
            loan: true,
          },
        },
        remittances: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBatchById(id: string) {
    const batch = await this.prisma.payrollBatch.findUnique({
      where: { id },
      include: {
        organization: true,
        items: {
          include: {
            employee: { select: { firstName: true, lastName: true, employeeCode: true, department: true } },
            loan: true,
            exceptions: true,
          },
        },
        remittances: { include: { reconciliations: true } },
      },
    });
    if (!batch) throw new NotFoundException('Payroll batch not found');
    return batch;
  }

  /**
   * Generates Payroll Deduction Batch for organization cutoff cycle
   */
  async generateBatch(organizationId: string, month = 11, year = 2026) {
    // 1. Fetch active loans due in this cycle
    const activeLoans = await this.prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        employee: { organizationId },
      },
      include: {
        employee: true,
        repaymentSchedules: {
          where: {
            status: 'PENDING',
          },
          orderBy: { installmentNumber: 'asc' },
          take: 1,
        },
      },
    });

    if (activeLoans.length === 0) {
      throw new BadRequestException('No active loans found due for payroll deduction in this cycle.');
    }

    const batchNumber = `PB-BATCH-${year}-${month}-${Date.now().toString().slice(-4)}`;
    let totalDuePaise = 0;

    const itemsData = activeLoans.map((loan) => {
      const schedule = loan.repaymentSchedules[0];
      const duePaise = schedule ? schedule.totalDuePaise : loan.monthlyEmiPaise;
      totalDuePaise += duePaise;

      return {
        employeeId: loan.employeeId,
        loanId: loan.id,
        productType: loan.productType,
        dueAmountPaise: duePaise,
        deductedAmountPaise: duePaise,
        status: 'PENDING',
      };
    });

    const batch = await this.prisma.payrollBatch.create({
      data: {
        batchNumber,
        organizationId,
        month,
        year,
        cutoffDate: new Date(year, month - 1, 25),
        totalEmployees: itemsData.length,
        totalDuePaise,
        totalDeductedPaise: totalDuePaise,
        status: 'GENERATED',
        generatedAt: new Date(),
        items: {
          createMany: {
            data: itemsData,
          },
        },
      },
      include: { items: true },
    });

    return {
      success: true,
      batch,
      message: `Payroll deduction batch generated for ${itemsData.length} employees totaling ₹${totalDuePaise / 100}. Ready for payroll run export.`,
    };
  }

  async exportBatchCsv(id: string) {
    const batch = await this.getBatchById(id);
    const headers = 'Employee Code,Employee Name,Department,Product Type,Loan Account No,Due Amount (INR)\n';
    const rows = batch.items
      .map(
        (item) =>
          `"${item.employee.employeeCode}","${item.employee.firstName} ${item.employee.lastName}","${item.employee.department}","${item.productType}","${item.loan.loanAccountNumber}",${item.dueAmountPaise / 100}`,
      )
      .join('\n');

    return {
      fileName: `Deductions_${batch.batchNumber}.csv`,
      csvData: headers + rows,
    };
  }
}
