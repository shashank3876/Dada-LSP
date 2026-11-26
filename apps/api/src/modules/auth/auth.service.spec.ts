import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException, HttpException } from '@nestjs/common';
import { InMemoryRateLimiter } from '../../common/rate-limiter';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

describe('AuthService - Hardening, Lockout & Password Reset', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwt: any;
  let mockNotifications: any;
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('CorrectPass@123', 10);
  });

  beforeEach(() => {
    InMemoryRateLimiter.clear();
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      organization: {
        findFirst: jest.fn(),
      },
      employee: {
        findFirst: jest.fn(),
      },
    };

    mockJwt = {
      sign: jest.fn().mockReturnValue('mock_jwt_token_xyz'),
    };

    mockNotifications = {
      sendDualOtp: jest.fn().mockResolvedValue({
        smsResult: { success: true },
        emailResult: { success: true },
      }),
    };

    service = new AuthService(
      mockPrisma as PrismaService,
      mockJwt as JwtService,
      mockNotifications as any,
    );
  });

  it('successful login resets failed login attempts and updates lastLoginAt', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      isActive: true,
      failedLoginAttempts: 2,
      lockedUntil: null,
      organizationId: 'org-1',
      employeeId: 'emp-1',
      fullName: 'Test User',
      role: 'EMPLOYEE',
    });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await service.login({
      email: 'test@example.com',
      password: 'CorrectPass@123',
    });

    expect(res.accessToken).toBe('mock_jwt_token_xyz');
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        failedLoginAttempts: 0,
        lockedUntil: null,
      }),
    });
  });

  it('increments failedLoginAttempts on invalid password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      isActive: true,
      failedLoginAttempts: 1,
      lockedUntil: null,
    });
    mockPrisma.user.update.mockResolvedValue({});

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'WrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        failedLoginAttempts: 2,
        lockedUntil: null,
      }),
    });
  });

  it('locks account for 15 minutes after 5 consecutive failed login attempts', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      isActive: true,
      failedLoginAttempts: 4, // 5th attempt now
      lockedUntil: null,
    });
    mockPrisma.user.update.mockResolvedValue({});

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'WrongPassword',
      }),
    ).rejects.toThrow('Account has been locked for 15 minutes');

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        failedLoginAttempts: 5,
        lockedUntil: expect.any(Date),
      }),
    });
  });

  it('rejects login immediately while account is locked', async () => {
    const futureLockTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      isActive: true,
      failedLoginAttempts: 5,
      lockedUntil: futureLockTime,
    });

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'CorrectPass@123',
      }),
    ).rejects.toThrow('Account is temporarily locked');
  });

  it('enforces rate limiting on login endpoint (exceeding 5 attempts in 60s)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // Run 5 attempts
    for (let i = 0; i < 5; i++) {
      try {
        await service.login({ email: 'spam@example.com', password: 'xyz' }, '10.0.0.1');
      } catch (e: any) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    }

    // 6th attempt must trigger rate limiter
    await expect(
      service.login({ email: 'spam@example.com', password: 'xyz' }, '10.0.0.1'),
    ).rejects.toThrow(HttpException);
  });

  it('stores SHA-256 hash of reset token in database rather than raw token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await service.forgotPassword({ email: 'test@example.com' });
    expect(res.message).toContain('password reset instructions have been generated');
    expect(res.resetToken).toBeDefined();

    // Verify what was stored in the database: must be the SHA-256 hash of res.resetToken!
    const expectedHash = crypto.createHash('sha256').update(res.resetToken!).digest('hex');
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        passwordResetToken: expectedHash,
      }),
    });
  });

  it('resets password and clears lockout with valid hashed reset token', async () => {
    const rawToken = 'my_secret_reset_token_2026';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000),
    });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await service.resetPassword({
      token: rawToken,
      newPassword: 'BrandNewSecret@2026',
    });

    expect(res.success).toBe(true);
    // Verifies that query looked for the hashed token, not raw token
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: expect.any(Date) },
      },
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }),
    });
  });

  it('protects OTP verification against brute-force (3 failures trigger 15-minute lockout)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-otp-1',
      email: 'otp@example.com',
      failedOtpAttempts: 2, // 3rd failure now
      otpLockedUntil: null,
    });
    mockPrisma.user.update.mockResolvedValue({});

    await expect(
      service.verifyOtp({ email: 'otp@example.com', otp: '999999' }),
    ).rejects.toThrow('OTP verification has been locked for 15 minutes');

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-otp-1' },
      data: expect.objectContaining({
        failedOtpAttempts: 3,
        otpLockedUntil: expect.any(Date),
      }),
    });
  });

  it('omits resetToken in response when running in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-prod',
        email: 'prod@example.com',
      });
      mockPrisma.user.update.mockResolvedValue({});

      const res = await service.forgotPassword({ email: 'prod@example.com' });
      expect(res.message).toBeDefined();
      expect(res.resetToken).toBeUndefined(); // Never leaked in production!
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  describe('initiateEmployeeRegistration - Dual OTP Dispatch', () => {
    it('dispatches dual OTP and returns masked phone and email', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({
        id: 'org-techcorp',
        code: 'TECHCORP',
        name: 'TechCorp Solutions',
      });
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-1002',
        employeeCode: 'TC-1002',
        firstName: 'Priya',
        lastName: 'Sharma',
        officialEmail: 'priya.s@techcorp.in',
        mobileNumber: '+919820011002',
        organizationId: 'org-techcorp',
      });
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await service.initiateEmployeeRegistration({
        organizationCode: 'TECHCORP',
        employeeCode: 'TC-1002',
        officialEmail: 'priya.s@techcorp.in',
      });

      expect(res.success).toBe(true);
      expect(mockNotifications.sendDualOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          mobile: '+919820011002',
          email: 'priya.s@techcorp.in',
          organizationName: 'TechCorp Solutions',
          recipientName: 'Priya Sharma',
        }),
      );
      expect(res.maskedEmail).toMatch(/^p\*\*\*s@techcorp\.in$/);
      expect(res.maskedPhone).toMatch(/^\+9198\*\*\*\*02$/);
      expect(res.message).toContain(res.maskedEmail!);
      expect(res.demoOtpHint).toBe('123456');
    });
  });
});
