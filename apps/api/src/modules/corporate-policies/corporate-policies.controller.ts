import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CorporatePoliciesService } from './corporate-policies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@dada/contracts';

@ApiTags('Corporate Policies')
@Controller('policies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CorporatePoliciesController {
  constructor(private readonly service: CorporatePoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization lending policies' })
  findPolicy(@CurrentUser() user: any) {
    return this.service.findByOrganization(user.organizationId);
  }

  @Put()
  @Roles(UserRole.HR_ADMIN, UserRole.DADA_ADMIN)
  @ApiOperation({ summary: 'Update organization lending policies' })
  updatePolicy(@CurrentUser() user: any, @Body() data: any) {
    return this.service.updatePolicy(user.organizationId, data);
  }
}
