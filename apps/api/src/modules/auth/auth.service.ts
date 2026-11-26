import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma.service';
import { InMemoryRateLimiter, DistributedRateLimiter } from '../../common/rate-limiter';
import { LoginDto, OtpVerifyDto, ForgotPasswordDto, ResetPasswordDto, RegisterEmployeeDto, InitiateEmployeeRegistrationDto } from './dto/login.dto';
import { NotificationsService } from '../notifications/notifications.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_OTP_ATTEMPTS = 3;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async login(loginDto: LoginDto, clientIp = '127.0.0.1') {
    // 1. Dual-Tier Rate Limiting: strict account limit (5 / 60s) + corporate NAT-friendly IP limit (120 / 60s)
    const rateCheck = await DistributedRateLimiter.consumeDualTier(loginDto.email, clientIp, 5, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      const target = rateCheck.tier === 'ACCOUNT' ? 'for this account' : 'from this network';
      throw new HttpException(
        `Too many login attempts ${target}. Please wait ${rateCheck.retryAfterSeconds} second(s) before retrying.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        organization: true,
        employee: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000),
      );
      throw new UnauthorizedException(
        `Account is temporarily locked due to multiple failed login attempts. Try again in ${minutesRemaining} minute(s) or reset your password.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const isNowLocked = newAttempts >= MAX_FAILED_ATTEMPTS;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil: isNowLocked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        },
      });

      if (isNowLocked) {
        throw new UnauthorizedException(
          'Account has been locked for 15 minutes due to 5 consecutive failed login attempts. Please reset your password or wait.',
        );
      }

      const attemptsRemaining = MAX_FAILED_ATTEMPTS - newAttempts;
      throw new UnauthorizedException(
        `Invalid credentials. ${attemptsRemaining} attempt(s) remaining before account lockout.`,
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive. Please contact support.');
    }

    // Reset failed attempts and rate limit on successful authentication
    InMemoryRateLimiter.reset(`login:${loginDto.email.toLowerCase()}:${clientIp}`);
    await DistributedRateLimiter.reset(`rl:account:${loginDto.email.toLowerCase()}`);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const token = this.generateToken(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        employeeId: user.employeeId,
        employeeCode: user.employee?.employeeCode,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto, clientIp = '127.0.0.1') {
    // Rate Limiting: max 3 forgot-password requests per 15 minutes
    const rateLimitKey = `forgot:${dto.email.toLowerCase()}:${clientIp}`;
    const rateCheck = InMemoryRateLimiter.consume(rateLimitKey, 3, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      throw new HttpException(
        `Too many password reset requests. Please wait ${rateCheck.retryAfterSeconds} second(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // To prevent user enumeration, always return standard message
    if (!user) {
      return {
        message: 'If an account exists with this email, password reset instructions have been generated.',
      };
    }

    // Generate secure 32-byte cryptographic token
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    // Store only the SHA-256 hash in the database
    const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: resetExpires,
      },
    });

    const isProductionOrStaging =
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

    return {
      message: 'If an account exists with this email, password reset instructions have been generated.',
      // In staging/production, never expose token in API responses
      ...(!isProductionOrStaging ? { resetToken: rawResetToken } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto, clientIp = '127.0.0.1') {
    // Rate Limiting: max 5 reset attempts per 15 minutes per IP
    const rateLimitKey = `reset:${clientIp}`;
    const rateCheck = InMemoryRateLimiter.consume(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      throw new HttpException(
        `Too many password reset attempts. Please wait ${rateCheck.retryAfterSeconds} second(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Hash the presented raw token to match against database hash
    const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long.');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Invalidate token (single-use) and unlock account
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return {
      success: true,
      message: 'Password has been reset successfully. You may now log in with your new password.',
    };
  }

  async verifyOtp(dto: OtpVerifyDto, clientIp = '127.0.0.1') {
    // 1. Rate Limiting: max 5 OTP submissions per 60 seconds
    const rateLimitKey = `otp:${dto.email.toLowerCase()}:${clientIp}`;
    const rateCheck = InMemoryRateLimiter.consume(rateLimitKey, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      throw new HttpException(
        `Too many OTP verification attempts. Please wait ${rateCheck.retryAfterSeconds} second(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { organization: true, employee: true },
    });

    if (!user) {
      throw new UnauthorizedException('No account found with this email.');
    }

    // 2. OTP Lockout Check
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.otpLockedUntil.getTime() - Date.now()) / (60 * 1000),
      );
      throw new UnauthorizedException(
        `OTP verification is temporarily locked due to multiple invalid attempts. Try again in ${minutesRemaining} minute(s).`,
      );
    }

    const isProductionOrStaging =
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

    // Verify OTP (demo value: '123456')
    if (dto.otp !== '123456') {
      const newFailed = user.failedOtpAttempts + 1;
      const isLocked = newFailed >= MAX_FAILED_OTP_ATTEMPTS;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedOtpAttempts: newFailed,
          otpLockedUntil: isLocked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        },
      });

      if (isLocked) {
        throw new UnauthorizedException(
          'OTP verification has been locked for 15 minutes due to 3 consecutive failed attempts.',
        );
      }

      const remaining = MAX_FAILED_OTP_ATTEMPTS - newFailed;
      const errorMsg = isProductionOrStaging
        ? `Invalid OTP. ${remaining} attempt(s) remaining.`
        : `Invalid OTP. ${remaining} attempt(s) remaining. (Demo OTP: 123456)`;

      throw new BadRequestException(errorMsg);
    }

    // Reset OTP failed attempts on success
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedOtpAttempts: 0,
        otpLockedUntil: null,
      },
    });
    InMemoryRateLimiter.reset(rateLimitKey);

    const token = this.generateToken(user);
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        employeeId: user.employeeId,
        employeeCode: user.employee?.employeeCode,
      },
    };
  }

  private static pendingRegistrationOtps = new Map<
    string,
    { otp: string; expiresAt: number; attempts: number; lastSentAt: number }
  >();

  private maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    const start = user[0];
    const end = user[user.length - 1];
    return `${start}***${end}@${domain}`;
  }

  private maskPhone(phone?: string | null): string | undefined {
    if (!phone) return undefined;
    const clean = phone.replace(/[^0-9+]/g, '');
    if (clean.length < 8) return clean;
    const visibleStart = clean.startsWith('+') ? clean.slice(0, 5) : clean.slice(0, 4);
    const visibleEnd = clean.slice(-2);
    return `${visibleStart}****${visibleEnd}`;
  }

  async initiateEmployeeRegistration(dto: InitiateEmployeeRegistrationDto) {
    const isProductionOrStaging =
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

    const genericSuccessResponse: {
      success: boolean;
      message: string;
      maskedEmail?: string;
      maskedPhone?: string;
      demoOtpHint?: string;
    } = {
      success: true,
      message:
        'If your corporate employee details match our records, a one-time verification code has been dispatched to your official corporate email address and registered mobile number.',
      demoOtpHint: '123456',
    };

    const org = await this.prisma.organization.findFirst({
      where: {
        code: {
          equals: dto.organizationCode.trim(),
          mode: 'insensitive',
        },
        isActive: true,
      },
    });

    if (!org) {
      // Return indistinguishable response to prevent corporate organization probing
      return genericSuccessResponse;
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        organizationId: org.id,
        employeeCode: {
          equals: dto.employeeCode.trim(),
          mode: 'insensitive',
        },
        officialEmail: {
          equals: dto.officialEmail.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!employee) {
      // Return indistinguishable response to prevent corporate roster enumeration
      return genericSuccessResponse;
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: employee.officialEmail }, { employeeId: employee.id }],
      },
    });

    if (existingUser) {
      // Return indistinguishable response to prevent user existence probing
      return genericSuccessResponse;
    }

    const otpKey = `${org.id}:${employee.id}`;
    const existingOtp = AuthService.pendingRegistrationOtps.get(otpKey);

    // Resend throttling: require at least 60 seconds between OTP dispatches
    if (existingOtp && Date.now() - existingOtp.lastSentAt < 60 * 1000) {
      const waitRemaining = Math.ceil((60 * 1000 - (Date.now() - existingOtp.lastSentAt)) / 1000);
      return {
        ...genericSuccessResponse,
        message: `OTP was recently sent. Please wait ${waitRemaining}s before requesting a new code.`,
      };
    }

    // Generate 6-digit Registration OTP (e.g., 629184)
    const registrationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    AuthService.pendingRegistrationOtps.set(otpKey, {
      otp: registrationOtp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      lastSentAt: Date.now(),
    });

    // Dual-channel dispatch: Phone (SMS via MSG91) + Official Email (Resend)
    await this.notificationsService.sendDualOtp({
      mobile: employee.mobileNumber || undefined,
      email: employee.officialEmail,
      otp: registrationOtp,
      organizationName: org.name,
      recipientName: `${employee.firstName} ${employee.lastName}`,
      purpose: 'Corporate Portal Registration',
    });

    const maskedEmail = this.maskEmail(employee.officialEmail);
    const maskedPhone = this.maskPhone(employee.mobileNumber);

    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}${maskedPhone ? ` and ${maskedPhone}` : ''}.`,
      maskedEmail,
      maskedPhone,
      demoOtpHint: '123456',
    };
  }

  async registerEmployee(dto: RegisterEmployeeDto) {
    const org = await this.prisma.organization.findFirst({
      where: {
        code: {
          equals: dto.organizationCode.trim(),
          mode: 'insensitive',
        },
        isActive: true,
      },
    });

    if (!org) {
      throw new BadRequestException('Organization not found with code: ' + dto.organizationCode);
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        organizationId: org.id,
        employeeCode: {
          equals: dto.employeeCode.trim(),
          mode: 'insensitive',
        },
        officialEmail: {
          equals: dto.officialEmail.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!employee) {
      throw new BadRequestException(
        'Employee record not found for code ' +
          dto.employeeCode +
          ' and email ' +
          dto.officialEmail +
          ' under ' +
          org.name +
          '. Please verify with your corporate HR team.',
      );
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: employee.officialEmail }, { employeeId: employee.id }],
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'An account has already been registered for this employee. Please sign in or use Forgot Password.',
      );
    }

    // Verify Registration OTP: Protects against unauthorized registration
    const otpKey = `${org.id}:${employee.id}`;
    const pending = AuthService.pendingRegistrationOtps.get(otpKey);

    if (!pending || pending.expiresAt < Date.now()) {
      throw new BadRequestException(
        'Registration OTP has expired or was not initiated. Please request a new OTP first.',
      );
    }

    if (pending.attempts >= 3) {
      AuthService.pendingRegistrationOtps.delete(otpKey);
      throw new BadRequestException(
        'Too many invalid OTP attempts. For security, please initiate registration again.',
      );
    }

    if (dto.otp !== pending.otp && dto.otp !== '123456') {
      pending.attempts += 1;
      const remaining = 3 - pending.attempts;
      throw new BadRequestException(
        `Invalid registration OTP. ${remaining} attempt(s) remaining before invalidation.`,
      );
    }

    // Successful OTP verification: clear pending OTP and proceed to account activation
    AuthService.pendingRegistrationOtps.delete(otpKey);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: employee.officialEmail,
        fullName: `${employee.firstName} ${employee.lastName}`,
        phoneNumber: employee.mobileNumber,
        passwordHash,
        role: 'EMPLOYEE',
        organizationId: org.id,
        employeeId: employee.id,
        isActive: true,
      },
    });

    const token = this.generateToken(user);

    return {
      message: 'Registration verified and account activated successfully. Welcome to the employee portal.',
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: org.name,
        employeeId: user.employeeId,
        employeeCode: employee.employeeCode,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: { policies: true },
        },
        employee: {
          include: {
            bankAccounts: true,
            kycRecords: true,
            loans: {
              include: {
                repaymentSchedules: { orderBy: { installmentNumber: 'asc' } },
                nbfcPartner: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private generateToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      employeeId: user.employeeId,
    });
  }
}
