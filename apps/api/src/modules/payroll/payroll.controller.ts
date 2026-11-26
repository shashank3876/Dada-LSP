import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Corporate Payroll Batches')
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Get('batches')
  @ApiOperation({ summary: 'List payroll deduction batches' })
  getBatches(@CurrentUser() user: any) {
    const orgId = user.role.startsWith('HR_') ? user.organizationId : undefined;
    return this.service.getBatches(orgId);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get details of specific batch with items (Tenant Scoped)' })
  getBatchById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getBatchById(id, user);
  }

  @Post('batches/generate')
  @ApiOperation({ summary: 'Generate new payroll deduction batch at cutoff (Tenant Scoped)' })
  generateBatch(@CurrentUser() user: any, @Body() body: { month?: number; year?: number; organizationId?: string }) {
    // Multi-tenant check: HR cannot generate for other organizations
    const orgId = user.role.startsWith('HR_') ? user.organizationId : (body.organizationId || user.organizationId);
    return this.service.generateBatch(orgId, body.month || 11, body.year || 2026, user);
  }

  @Get('batches/:id/export')
  @ApiOperation({ summary: 'Export batch deduction ledger to CSV (Tenant Scoped)' })
  exportBatchCsv(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getBatchById(id, user).then((batch) => {
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
    });
  }
}
