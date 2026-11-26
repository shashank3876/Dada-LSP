import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@dada/contracts';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  @Roles(UserRole.DADA_ADMIN, UserRole.DADA_OPERATIONS, UserRole.DADA_SUPER_ADMIN)
  @ApiOperation({ summary: 'List all corporate organizations (Admin only)' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(UserRole.DADA_ADMIN, UserRole.DADA_SUPER_ADMIN)
  @ApiOperation({ summary: 'Onboard a new corporate organization (Admin only)' })
  create(
    @Body()
    body: {
      code: string;
      name: string;
      cinNumber: string;
      registeredAddress: string;
      domain?: string;
    },
  ) {
    return this.service.create(body);
  }

  @Get(':id')
  @Roles(UserRole.DADA_ADMIN, UserRole.HR_ADMIN, UserRole.HR_OPERATOR)
  @ApiOperation({ summary: 'Get details of a specific organization' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
