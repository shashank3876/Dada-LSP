import { AuthService } from './auth/auth.service';
import { EmployeesService } from './employees/employees.service';
import { LoanApplicationsService } from './loan-applications/loan-applications.service';
import { HrmsService } from './hrms/hrms.service';
import { NbfcService } from './nbfc/nbfc.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ApplicationStatus } from '@dada/contracts';
import * as bcrypt from 'bcryptjs';

describe('Checkpoint 3 - Real User Journeys, Hardened State Machine & Compliance', () => {
  let authService: AuthService;
  let employeesService: EmployeesService;
  let loanAppsService: LoanApplicationsService;
  let hrmsService: HrmsService;
  let nbfcService: NbfcService;
  let mockPrisma: any;
  let mockJwt: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      organization: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      employee: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(4),
      },
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      salaryRecord: {
        create: jest.fn(),
      },
      bankAccount: {
        create: jest.fn(),
      },
      attendanceRecord: {
        create: jest.fn(),
      },
      loan: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      loanApplication: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      consentRecord: {
        create: jest.fn(),
      },
      auditEvent: {
        create: jest.fn(),
      },
      hRMSIntegration: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      nBFCPartner: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      webhookEvent: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      idempotencyRecord: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      corporatePolicy: {
        create: jest.fn(),
      },
    };

    mockJwt = {
      sign: jest.fn().mockReturnValue('mock_jwt_token_checkpoint3'),
    };

    authService = new AuthService(mockPrisma as PrismaService, mockJwt as JwtService);
    employeesService = new EmployeesService(mockPrisma as PrismaService);
    loanAppsService = new LoanApplicationsService(mockPrisma as PrismaService);
    hrmsService = new HrmsService(mockPrisma as PrismaService);
    nbfcService = new NbfcService(mockPrisma as PrismaService);
  });

  describe('P0.1 — Employee OTP-Based Registration Flow', () => {
    it('returns uniform non-distinguishable response if organization does not exist', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue(null);

      const res = await authService.initiateEmployeeRegistration({
        organizationCode: 'NONEXISTENT',
        employeeCode: 'TC-9999',
        officialEmail: 'unknown@example.com',
      });
      expect(res.success).toBe(true);
      expect(res.message).toContain('If your corporate employee details match our records');
    });

    it('returns uniform non-distinguishable response if employee is not found under organization', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({
        id: 'org-1',
        code: 'TECHCORP',
        name: 'TechCorp Solutions',
      });
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      const res = await authService.initiateEmployeeRegistration({
        organizationCode: 'TECHCORP',
        employeeCode: 'TC-9999',
        officialEmail: 'notfound@techcorp.in',
      });
      expect(res.success).toBe(true);
      expect(res.message).toContain('If your corporate employee details match our records');
    });

    it('returns uniform non-distinguishable response if user account is already registered', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({
        id: 'org-1',
        code: 'TECHCORP',
        name: 'TechCorp Solutions',
      });
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-101',
        employeeCode: 'TC-1001',
        officialEmail: 'rajesh.k@techcorp.in',
        organizationId: 'org-1',
      });
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-already-exists',
        email: 'rajesh.k@techcorp.in',
      });

      const res = await authService.initiateEmployeeRegistration({
        organizationCode: 'TECHCORP',
        employeeCode: 'TC-1001',
        officialEmail: 'rajesh.k@techcorp.in',
      });
      expect(res.success).toBe(true);
      expect(res.message).toContain('If your corporate employee details match our records');
    });

    it('dispatches OTP and rejects registration if wrong OTP is submitted', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({
        id: 'org-1',
        code: 'TECHCORP',
        name: 'TechCorp Solutions',
      });
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-102',
        employeeCode: 'TC-1002',
        firstName: 'Priya',
        lastName: 'Sharma',
        officialEmail: 'priya.s@techcorp.in',
        mobileNumber: '+919820011002',
        organizationId: 'org-1',
      });
      mockPrisma.user.findFirst.mockResolvedValue(null);

      // Initiate registration
      const initRes = await authService.initiateEmployeeRegistration({
        organizationCode: 'TECHCORP',
        employeeCode: 'TC-1002',
        officialEmail: 'priya.s@techcorp.in',
      });
      expect(initRes.success).toBe(true);

      // Attempt registration with invalid OTP
      await expect(
        authService.registerEmployee({
          organizationCode: 'TECHCORP',
          employeeCode: 'TC-1002',
          officialEmail: 'priya.s@techcorp.in',
          otp: '000000', // Wrong OTP
          password: 'SecurePassword@2026',
        }),
      ).rejects.toThrow(/Invalid registration OTP/);
    });

    it('successfully verifies OTP, creates active User, and returns token', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({
        id: 'org-1',
        code: 'TECHCORP',
        name: 'TechCorp Solutions',
      });
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-102',
        employeeCode: 'TC-1002',
        firstName: 'Priya',
        lastName: 'Sharma',
        officialEmail: 'priya.s@techcorp.in',
        mobileNumber: '+919820011002',
        organizationId: 'org-1',
      });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-new',
        email: 'priya.s@techcorp.in',
        fullName: 'Priya Sharma',
        role: 'EMPLOYEE',
        organizationId: 'org-1',
        employeeId: 'emp-102',
      });

      // Initiate OTP
      await authService.initiateEmployeeRegistration({
        organizationCode: 'TECHCORP',
        employeeCode: 'TC-1002',
        officialEmail: 'priya.s@techcorp.in',
      });

      // Complete with verified OTP
      const res = await authService.registerEmployee({
        organizationCode: 'TECHCORP',
        employeeCode: 'TC-1002',
        officialEmail: 'priya.s@techcorp.in',
        otp: '123456',
        password: 'SecurePassword@2026',
      });

      expect(res.accessToken).toBe('mock_jwt_token_checkpoint3');
      expect(res.user.email).toBe('priya.s@techcorp.in');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('P0.3 — KFS Statutory Review & Immutable Consent Record', () => {
    it('creates an immutable ConsentRecord capturing exact sanctioned terms when borrower accepts KFS', async () => {
      const borrowerUser = {
        id: 'user-borrower',
        role: 'EMPLOYEE',
        employeeId: 'emp-101',
        organizationId: 'org-1',
        ip: '192.168.1.10',
        userAgent: 'Mozilla/5.0 DadaApp/1.0',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-kfs-1',
        applicationNumber: 'DADA-PL-2026-101',
        organizationId: 'org-1',
        employeeId: 'emp-101',
        nbfcPartnerId: 'apex-capital-id',
        status: ApplicationStatus.APPROVED, // Sanctioned by NBFC
        requestedAmountPaise: 10000000,
        approvedAmountPaise: 10000000,
        interestRatePercent: 14.5,
        processingFeePaise: 150000,
        monthlyEmiPaise: 900000,
        tenureMonths: 12,
        kfsDocumentId: 'KFS-DOC-2026-099',
        loan: null,
      });

      mockPrisma.loanApplication.update.mockResolvedValue({
        id: 'app-kfs-1',
        status: ApplicationStatus.OFFER_ACCEPTED,
        kfsAcceptedAt: new Date(),
      });

      await loanAppsService.transitionStatus(
        'app-kfs-1',
        ApplicationStatus.OFFER_ACCEPTED,
        borrowerUser,
        'Borrower accepted statutory Key Fact Statement terms',
      );

      // Verify immutable consent record creation
      expect(mockPrisma.consentRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-borrower',
            purpose: 'KFS_ACCEPTANCE',
            consentVersion: 'KFS-DOC-2026-099',
            ipAddress: '192.168.1.10',
            userAgent: 'Mozilla/5.0 DadaApp/1.0',
          }),
        }),
      );

      // Verify detailed KFS terms recorded in audit event
      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'BORROWER_KFS_STATUTORY_ACCEPTANCE',
            metadataJson: expect.stringContaining('"sanctionedPrincipalPaise":10000000'),
          }),
        }),
      );

      // Verify timestamp recorded on application
      expect(mockPrisma.loanApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'app-kfs-1' },
          data: expect.objectContaining({
            status: ApplicationStatus.OFFER_ACCEPTED,
            kfsAcceptedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('rejects KFS acceptance if application has no sanctioned amount from NBFC', async () => {
      const borrowerUser = {
        id: 'user-borrower',
        role: 'EMPLOYEE',
        employeeId: 'emp-101',
        organizationId: 'org-1',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-kfs-invalid',
        applicationNumber: 'DADA-PL-2026-999',
        organizationId: 'org-1',
        employeeId: 'emp-101',
        status: ApplicationStatus.APPROVED,
        approvedAmountPaise: 0, // Unsanctioned
        loan: null,
      });

      await expect(
        loanAppsService.transitionStatus(
          'app-kfs-invalid',
          ApplicationStatus.OFFER_ACCEPTED,
          borrowerUser,
          'Attempted accept',
        ),
      ).rejects.toThrow(/No NBFC-sanctioned credit terms recorded/);
    });
  });

  describe('P0.5 — HRMS Integration Real API Endpoints', () => {
    it('returns connector status and provisions default connector for organization', async () => {
      mockPrisma.hRMSIntegration.findFirst.mockResolvedValue(null);
      mockPrisma.hRMSIntegration.create.mockResolvedValue({
        id: 'hrms-1',
        organizationId: 'org-1',
        provider: 'KEKA',
        status: 'CONNECTED',
        apiUrl: 'https://api.keka.com/v1/techcorp',
      });

      const res = await hrmsService.getStatus('org-1');
      expect(res.provider).toBe('KEKA');
      expect(res.status).toBe('CONNECTED');
    });

    it('executes manual synchronization and creates immutable audit event', async () => {
      const hrUser = { id: 'hr-user-1', email: 'hr.admin@techcorp.in', role: 'HR_ADMIN' };
      mockPrisma.hRMSIntegration.findFirst.mockResolvedValue({
        id: 'hrms-1',
        organizationId: 'org-1',
        provider: 'KEKA',
      });
      mockPrisma.hRMSIntegration.update.mockResolvedValue({
        id: 'hrms-1',
        status: 'CONNECTED',
        lastSyncStatus: 'SUCCESS',
        lastSyncAt: new Date(),
      });

      const res = await hrmsService.triggerSync('org-1', hrUser);
      expect(res.success).toBe(true);
      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'HRMS_MANUAL_DELTA_SYNC',
            resourceId: 'hrms-1',
          }),
        }),
      );
    });
  });

  describe('P1.9 — Webhook State Machine Matrix Enforcement', () => {
    it('strictly forbids a REJECTED application from being disbursed by a webhook event', async () => {
      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-rejected',
        status: ApplicationStatus.REJECTED, // Terminal rejected state
        productType: 'EWA',
        requestedAmountPaise: 2000000,
        loan: null,
      });

      const webhookPayload = {
        eventId: 'EVT_DISBURSE_ILLEGAL_1',
        applicationId: 'app-rejected',
        eventType: 'DISBURSEMENT_CONFIRMED',
        isSimulated: true,
        data: { utrNumber: 'CMS9999999999' },
      };

      const res = await nbfcService.processWebhook(webhookPayload);
      expect(res.status).toBe('INVALID_TRANSITION_IGNORED');
      expect(res.message).toContain('State machine prohibits transitioning application');
      expect(mockPrisma.loan.create).not.toHaveBeenCalled();
    });

    it('strictly forbids a CANCELLED application from being disbursed by a webhook event', async () => {
      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-cancelled',
        status: ApplicationStatus.CANCELLED, // Terminal cancelled state
        productType: 'PAYROLL_LOAN',
        requestedAmountPaise: 5000000,
        loan: null,
      });

      const webhookPayload = {
        eventId: 'EVT_DISBURSE_ILLEGAL_2',
        applicationId: 'app-cancelled',
        eventType: 'DISBURSEMENT_CONFIRMED',
        isSimulated: true,
        data: { utrNumber: 'CMS8888888888' },
      };

      const res = await nbfcService.processWebhook(webhookPayload);
      expect(res.status).toBe('INVALID_TRANSITION_IGNORED');
      expect(mockPrisma.loan.create).not.toHaveBeenCalled();
    });

    it('rejects external webhook if raw body string is missing in production/staging environment', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const payload = {
          eventId: 'EVT_PROD_1',
          applicationId: 'app-1',
          eventType: 'APPLICATION_APPROVED',
          isSimulated: false,
          timestamp: new Date().toISOString(),
        };

        await expect(
          nbfcService.processWebhook(payload, 'signature_123', undefined), // rawBodyString missing
        ).rejects.toThrow(/Raw request body string is strictly required for HMAC signature verification/);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe('HR Employee CSV Import & Rejected Rows Reporting', () => {
    it('correctly categorizes valid vs rejected rows with exact rejection reasons', async () => {
      const hrUser = { role: 'HR_ADMIN', organizationId: 'org-1' };

      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        name: 'TechCorp',
      });

      mockPrisma.employee.findMany.mockResolvedValue([
        { employeeCode: 'TC-1001', officialEmail: 'rajesh.k@techcorp.in' },
      ]);

      mockPrisma.employee.create.mockImplementation((args: any) => ({
        id: 'new-emp-' + Math.random(),
        ...args.data,
      }));
      mockPrisma.salaryRecord.create.mockResolvedValue({});
      mockPrisma.bankAccount.create.mockResolvedValue({});
      mockPrisma.attendanceRecord.create.mockResolvedValue({});

      const batchToImport = [
        {
          employeeCode: 'TC-2001',
          firstName: 'Ananya',
          lastName: 'Iyer',
          officialEmail: 'ananya.i@techcorp.in',
          monthlyNetSalary: 75000,
          department: 'Engineering',
        },
        {
          employeeCode: 'TC-1001',
          firstName: 'Duplicate',
          lastName: 'Guy',
          officialEmail: 'dup@techcorp.in',
        },
        {
          employeeCode: 'TC-2002',
          firstName: '',
          lastName: 'Sharma',
          officialEmail: 'sharma@techcorp.in',
        },
        {
          employeeCode: 'TC-2003',
          firstName: 'Rohit',
          lastName: 'Verma',
          officialEmail: 'invalidemailformat',
        },
      ];

      const res = await employeesService.importEmployees(hrUser, batchToImport);

      expect(res.importedCount).toBe(1);
      expect(res.rejectedCount).toBe(3);
      expect(res.rejectedRows).toHaveLength(3);
      expect(res.rejectedRows[0].reason).toContain('already exists in organization');
      expect(res.rejectedRows[1].reason).toContain('Missing firstName or lastName');
      expect(res.rejectedRows[2].reason).toContain('Invalid or missing officialEmail');
    });
  });
});
