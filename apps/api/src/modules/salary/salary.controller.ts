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
  @ApiOperation({ summary: 'List salary records (Tenant Scoped)' })
  findAll(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.service.findAll(user, month ? Number(month) : 11, year ? Number(year) : 2026);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get salary records for specific employee (Tenant Scoped)' })
  findByEmployee(@Param('employeeId') employeeId: string, @CurrentUser() user: any) {
    return this.service.findByEmployee(employeeId, user);
  }
}
