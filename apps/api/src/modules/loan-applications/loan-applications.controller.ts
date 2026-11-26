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
    @Query('employeeId') employeeId?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.service.findAll({ organizationId, employeeId, productType, status }, user);
  }

  @Get('my-loans')
  @ApiOperation({ summary: 'Get active loans and repayment schedules for current employee' })
  getMyLoans(@CurrentUser() user: any) {
    return this.service.findEmployeeLoans(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details and status stepper (Tenant Scoped)' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Transition application state (Validated State Machine)' })
  transition(
    @Param('id') id: string,
    @Body() body: { toStatus: ApplicationStatus; remarks?: string },
    @CurrentUser() user: any,
  ) {
    return this.service.transitionStatus(id, body.toStatus, user, body.remarks);
  }
}
