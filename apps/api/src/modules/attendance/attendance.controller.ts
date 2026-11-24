import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get monthly attendance ledger' })
  findAll(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const orgId = user.role.startsWith('HR_') ? user.organizationId : undefined;
    return this.service.findAll(orgId, month ? Number(month) : 11, year ? Number(year) : 2026);
  }

  @Post(':employeeId/correction')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_OPERATOR, UserRole.DADA_ADMIN)
  @ApiOperation({ summary: 'Submit attendance correction with automated EWA eligibility recalculation' })
  correctAttendance(
    @Param('employeeId') employeeId: string,
    @Body() body: { month: number; year: number; newDaysPresent: number; newPaidLeaveDays: number; notes: string },
    @CurrentUser() user: any,
  ) {
    return this.service.correctAttendance(employeeId, {
      ...body,
      correctedByUserId: user.id,
    });
  }
}
