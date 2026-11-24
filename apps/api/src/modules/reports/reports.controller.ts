import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports & Portfolio Analytics')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Get executive Dada Admin portfolio dashboard statistics' })
  getAdminStats() {
    return this.service.getAdminOverview();
  }

  @Get('hr')
  @ApiOperation({ summary: 'Get Corporate HR portal dashboard statistics' })
  getHrStats(@CurrentUser() user: any) {
    return this.service.getHrOverview(user.organizationId);
  }
}
