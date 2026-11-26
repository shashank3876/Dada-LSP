import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, OtpVerifyDto, ForgotPasswordDto, ResetPasswordDto, RegisterEmployeeDto, InitiateEmployeeRegistrationDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password (Rate limited & lockout protected)' })
  login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
    return this.authService.login(loginDto, String(ip));
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify mock OTP (use demo OTP: 123456)' })
  verifyOtp(@Body() dto: OtpVerifyDto, @Req() req: any) {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
    return this.authService.verifyOtp(dto, String(ip));
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset token (Enumeration-safe)' })
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: any) {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
    return this.authService.forgotPassword(dto, String(ip));
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with cryptographic token' })
  resetPassword(@Body() dto: ResetPasswordDto, @Req() req: any) {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
    return this.authService.resetPassword(dto, String(ip));
  }

  @Post('initiate-registration')
  @ApiOperation({ summary: 'Initiate employee registration and dispatch verification OTP' })
  initiateRegistration(@Body() dto: InitiateEmployeeRegistrationDto) {
    return this.authService.initiateEmployeeRegistration(dto);
  }

  @Post('register-employee')
  @ApiOperation({ summary: 'Verify registration OTP and create active employee account' })
  registerEmployee(@Body() dto: RegisterEmployeeDto) {
    return this.authService.registerEmployee(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged in user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }
}
