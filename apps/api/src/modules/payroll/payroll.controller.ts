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
  @ApiOperation({ summary: 'Get details of specific batch with items' })
  getBatchById(@Param('id') id: string) {
    return this.service.getBatchById(id);
  }

  @Post('batches/generate')
  @ApiOperation({ summary: 'Generate new payroll deduction batch at cutoff' })
  generateBatch(@CurrentUser() user: any, @Body() body: { month?: number; year?: number; organizationId?: string }) {
    const orgId = body.organizationId || user.organizationId;
    return this.service.generateBatch(orgId, body.month || 11, body.year || 2026);
  }

  @Get('batches/:id/export')
  @ApiOperation({ summary: 'Export batch deduction ledger to CSV' })
  exportBatchCsv(@Param('id') id: string) {
    return this.service.exportBatchCsv(id);
  }
}
