import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@dada/contracts';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees for organization or all (tenant isolated)' })
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user);
  }

  @Post('import')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_OPERATOR, UserRole.DADA_ADMIN, UserRole.DADA_SUPER_ADMIN)
  @ApiOperation({ summary: 'Batch import employees with validation and rejected-row reporting (tenant isolated)' })
  importEmployees(@Body() body: { employees: any[] }, @CurrentUser() user: any) {
    return this.service.importEmployees(user, body.employees);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee details with masked PII (tenant isolated)' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }
}
