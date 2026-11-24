import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payroll Deduction Reconciliation')
@Controller('reconciliation')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReconciliationController {
  constructor(private readonly service: ReconciliationService) {}

  @Get('remittances')
  @ApiOperation({ summary: 'List remittances and UTR confirmations' })
  getRemittances(@CurrentUser() user: any) {
    const orgId = user.role.startsWith('HR_') ? user.organizationId : undefined;
    return this.service.getRemittances(orgId);
  }

  @Get('exceptions')
  @ApiOperation({ summary: 'List all open and resolved reconciliation exceptions' })
  getExceptions() {
    return this.service.getExceptions();
  }

  @Post('upload-remittance')
  @ApiOperation({ summary: 'Upload employer remittance information with UTR' })
  uploadRemittance(
    @Body() body: { payrollBatchId: string; utrNumber: string; remittedAmountPaise: number; notes?: string },
  ) {
    return this.service.uploadRemittance(body);
  }

  @Post('exceptions/:id/resolve')
  @ApiOperation({ summary: 'Resolve a reconciliation exception' })
  resolveException(@Param('id') id: string, @Body() body: { notes: string }) {
    return this.service.resolveException(id, body.notes);
  }
}
