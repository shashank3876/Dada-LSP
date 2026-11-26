import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EwaService } from './ewa.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Earned Wage Access (EWA)')
@Controller('ewa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EwaController {
  constructor(private readonly service: EwaService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Submit EWA withdrawal request' })
  apply(
    @CurrentUser() user: any,
    @Body() body: { requestedAmountPaise: number; employeeId?: string },
  ) {
    // Multi-tenant security: Employees can only submit for themselves
    let targetEmployeeId = user.employeeId;
    if (user.role.startsWith('HR_') || user.role.startsWith('DADA_')) {
      targetEmployeeId = body.employeeId || user.employeeId;
    }
    return this.service.apply(targetEmployeeId, body.requestedAmountPaise, user);
  }
}
