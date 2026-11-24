import { Controller, Get, Param, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoanApplicationsService } from './loan-applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApplicationStatus } from '@dada/contracts';

@ApiTags('Loan Applications')
@Controller('loan-applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoanApplicationsController {
  constructor(private readonly service: LoanApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List loan applications with tenant and role filtering' })
  findAll(
    @CurrentUser() user: any,
    @Query('productType') productType?: string,
    @Query('status') status?: string,
  ) {
    let orgId: string | undefined;
    let empId: string | undefined;

    if (user.role === 'EMPLOYEE') {
      empId = user.employeeId;
    } else if (user.role.startsWith('HR_')) {
      orgId = user.organizationId;
    }

    return this.service.findAll({ organizationId: orgId, employeeId: empId, productType, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details and status stepper' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Transition application state (Admin / Demo)' })
  transition(
    @Param('id') id: string,
    @Body() body: { toStatus: ApplicationStatus; remarks: string },
    @CurrentUser() user: any,
  ) {
    return this.service.transitionStatus(id, body.toStatus, user.role, body.remarks);
  }
}
