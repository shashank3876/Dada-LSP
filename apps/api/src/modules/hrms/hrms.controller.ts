import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrmsService } from './hrms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@dada/contracts';

@ApiTags('HRMS Integration')
@Controller('hrms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HrmsController {
  constructor(private readonly service: HrmsService) {}

  @Get('status')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_OPERATOR, UserRole.DADA_ADMIN, UserRole.DADA_SUPER_ADMIN)
  @ApiOperation({ summary: 'Get HRMS connector configuration and live sync status (Tenant Scoped)' })
  getStatus(@CurrentUser() user: any) {
    return this.service.getStatus(user.organizationId);
  }

  @Post('sync')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_OPERATOR, UserRole.DADA_ADMIN, UserRole.DADA_SUPER_ADMIN)
  @ApiOperation({ summary: 'Trigger bidirectional roster & attendance synchronization with HRMS' })
  triggerSync(@CurrentUser() user: any) {
    return this.service.triggerSync(user.organizationId, user);
  }
}
