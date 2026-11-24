import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('KYC & Verification')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly service: KycService) {}

  @Post('verify-pan')
  @ApiOperation({ summary: 'Simulate PAN verification' })
  verifyPan(@CurrentUser() user: any, @Body() body: { panNumber: string; employeeId?: string }) {
    return this.service.verifyPan(body.employeeId || user.employeeId, body.panNumber);
  }

  @Post('send-aadhaar-otp')
  @ApiOperation({ summary: 'Request simulated Aadhaar OTP' })
  sendAadhaarOtp(@CurrentUser() user: any, @Body() body: { aadhaarNumber: string; employeeId?: string }) {
    return this.service.sendAadhaarOtp(body.employeeId || user.employeeId, body.aadhaarNumber);
  }

  @Post('verify-aadhaar-otp')
  @ApiOperation({ summary: 'Verify simulated Aadhaar OTP (Demo OTP: 123456)' })
  verifyAadhaarOtp(@CurrentUser() user: any, @Body() body: { aadhaarNumber: string; otp: string; employeeId?: string }) {
    return this.service.verifyAadhaarOtp(body.employeeId || user.employeeId, body.aadhaarNumber, body.otp);
  }

  @Post('verify-bank-account')
  @ApiOperation({ summary: 'Simulate Penny-drop bank verification' })
  verifyBankAccount(@CurrentUser() user: any, @Body() body: { accountNumber: string; ifscCode: string; employeeId?: string }) {
    return this.service.verifyBankAccount(body.employeeId || user.employeeId, body.accountNumber, body.ifscCode);
  }
}
