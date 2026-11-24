import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NbfcService } from './nbfc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@dada/contracts';

@ApiTags('NBFC Partners & Webhooks')
@Controller('nbfc')
export class NbfcController {
  constructor(private readonly service: NbfcService) {}

  @Get('partners')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List partner NBFC configurations' })
  getPartners() {
    return this.service.getPartners();
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Signed Webhook receiver from partner NBFCs' })
  handleWebhook(@Body() payload: any, @Headers('x-nbfc-signature') signature?: string) {
    return this.service.processWebhook(payload, signature);
  }

  @Post('simulate-action')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DADA_ADMIN, UserRole.DADA_SUPER_ADMIN, UserRole.DADA_OPERATIONS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simulate partner NBFC underwriting action (Demo only)' })
  simulateAction(
    @Body() body: { applicationId: string; action: 'APPROVE' | 'REJECT' | 'DISBURSE'; remarks?: string },
  ) {
    return this.service.simulateAction(body);
  }
}
