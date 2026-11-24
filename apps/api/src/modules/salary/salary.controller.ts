import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalaryService } from './salary.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Salary')
@Controller('salary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalaryController {
  constructor(private readonly service: SalaryService) {}

  @Get()
  @ApiOperation({ summary: 'List salary records' })
  findAll(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const orgId = user.role.startsWith('HR_') ? user.organizationId : undefined;
    return this.service.findAll(orgId, month ? Number(month) : 11, year ? Number(year) : 2026);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get salary records for specific employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }
}
