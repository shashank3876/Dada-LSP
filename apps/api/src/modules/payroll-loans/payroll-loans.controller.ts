import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollLoansService } from './payroll-loans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Corporate Payroll Loans')
@Controller('payroll-loans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayrollLoansController {
  constructor(private readonly service: PayrollLoansService) {}

  @Post('calculate-emi')
  @ApiOperation({ summary: 'Calculate reducing balance EMI' })
  calculateEmi(
    @Body() body: { principalPaise: number; annualInterestRatePercent: number; tenureMonths: number },
  ) {
    return this.service.calculateEmi(body);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Submit payroll personal loan application' })
  apply(
    @CurrentUser() user: any,
    @Body() body: { requestedAmountPaise: number; tenureMonths: number; purpose: string; employeeId?: string },
  ) {
    const employeeId = body.employeeId || user.employeeId;
    return this.service.apply(employeeId, body);
  }
}
