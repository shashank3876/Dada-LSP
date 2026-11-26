import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EligibilityService } from './eligibility.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Eligibility')
@Controller('eligibility')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EligibilityController {
  constructor(private readonly service: EligibilityService) {}

  @Get('ewa')
  @ApiOperation({ summary: 'Check live EWA eligibility for current employee (Tenant Scoped)' })
  checkEwa(@CurrentUser() user: any, @Query('employeeId') employeeId?: string) {
    let targetEmpId = user.employeeId;
    if (user.role.startsWith('HR_') || user.role.startsWith('DADA_')) {
      targetEmpId = employeeId || user.employeeId;
    }
    return this.service.checkEwaEligibility(targetEmpId);
  }

  @Get('payroll-loan')
  @ApiOperation({ summary: 'Check live Payroll loan eligibility for current employee (Tenant Scoped)' })
  checkPayrollLoan(@CurrentUser() user: any, @Query('employeeId') employeeId?: string) {
    let targetEmpId = user.employeeId;
    if (user.role.startsWith('HR_') || user.role.startsWith('DADA_')) {
      targetEmpId = employeeId || user.employeeId;
    }
    return this.service.checkPayrollLoanEligibility(targetEmpId);
  }
}
