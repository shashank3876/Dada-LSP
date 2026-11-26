import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@dada/contracts';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get monthly attendance ledger (Tenant Scoped)' })
  findAll(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    let orgId: string | undefined;
    if (user.role.startsWith('HR_')) {
      orgId = user.organizationId;
    }
    return this.service.findAll(orgId, month ? Number(month) : 11, year ? Number(year) : 2026);
  }

  @Post(':employeeId/correction')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_OPERATOR, UserRole.DADA_ADMIN)
  @ApiOperation({ summary: 'Submit attendance correction with automated EWA eligibility recalculation' })
  async correctAttendance(
    @Param('employeeId') employeeId: string,
    @Body() body: { month: number; year: number; newDaysPresent: number; newPaidLeaveDays: number; notes: string },
    @CurrentUser() user: any,
  ) {
    // If HR user, ensure employee belongs to HR's organization
    if (user.role.startsWith('HR_')) {
      const emp = await this.service.findEmployeeOrg(employeeId);
      if (emp && emp.organizationId !== user.organizationId) {
        throw new ForbiddenException('Access denied: Employee belongs to another organization.');
      }
    }

    return this.service.correctAttendance(employeeId, {
      ...body,
      correctedByUserId: user.id,
    });
  }
}
