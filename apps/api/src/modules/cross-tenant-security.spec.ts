import { EmployeesService } from './employees/employees.service';
import { SalaryService } from './salary/salary.service';
import { AttendanceService } from './attendance/attendance.service';
import { PayrollService } from './payroll/payroll.service';
import { ReconciliationService } from './reconciliation/reconciliation.service';
import { LoanApplicationsService } from './loan-applications/loan-applications.service';
import { EwaService } from './ewa/ewa.service';
import { PayrollLoansService } from './payroll-loans/payroll-loans.service';
import { PrismaService } from '../common/prisma.service';
import { EligibilityService } from './eligibility/eligibility.service';
import { ApplicationStatus } from '@dada/contracts';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('Comprehensive Multi-Tenant Isolation & IDOR Security Test Suite', () => {
  let mockPrisma: any;
  let employeesService: EmployeesService;
  let salaryService: SalaryService;
  let attendanceService: AttendanceService;
  let payrollService: PayrollService;
  let reconciliationService: ReconciliationService;
  let loanApplicationsService: LoanApplicationsService;
  let ewaService: EwaService;
  let payrollLoansService: PayrollLoansService;
  let mockEligibilityService: any;

  const employeeA = {
    id: 'user-emp-a',
    employeeId: 'emp-a',
    organizationId: 'org-alpha',
    role: 'EMPLOYEE',
  };

  const employeeB = {
    id: 'user-emp-b',
    employeeId: 'emp-b',
    organizationId: 'org-beta',
    role: 'EMPLOYEE',
  };

  const hrAdminAlpha = {
    id: 'user-hr-alpha',
    organizationId: 'org-alpha',
    role: 'HR_ADMIN',
  };

  const hrAdminBeta = {
    id: 'user-hr-beta',
    organizationId: 'org-beta',
    role: 'HR_ADMIN',
  };

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
      employee: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      salaryRecord: {
        findMany: jest.fn(),
      },
      attendanceRecord: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      payrollBatch: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      employerRemittance: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      loanApplication: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      loan: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      auditEvent: {
        create: jest.fn(),
      },
      reconciliationException: {
        create: jest.fn(),
      },
      reconciliationRecord: {
        create: jest.fn(),
      },
    };

    mockEligibilityService = {
      checkEwaEligibility: jest.fn().mockResolvedValue({
        isEligible: true,
        availableEwaPaise: 2500000,
        minWithdrawalAllowedPaise: 100000,
        policy: { convenienceFeePaise: 9900 },
        attendance: { totalApprovedWorkedDays: 15 },
        grossEarnedWagePaise: 3000000,
      }),
      checkPayrollLoanEligibility: jest.fn().mockResolvedValue({
        isEligible: true,
        maxLoanAmountPaise: 10000000,
        policy: {
          annualInterestRatePercent: 14.5,
          processingFeePercent: 1.5,
        },
      }),
    };

    employeesService = new EmployeesService(mockPrisma as PrismaService);
    salaryService = new SalaryService(mockPrisma as PrismaService);
    attendanceService = new AttendanceService(mockPrisma as PrismaService);
    payrollService = new PayrollService(mockPrisma as PrismaService);
    reconciliationService = new ReconciliationService(mockPrisma as PrismaService);
    loanApplicationsService = new LoanApplicationsService(mockPrisma as PrismaService);
    ewaService = new EwaService(mockPrisma as PrismaService, mockEligibilityService as EligibilityService);
    payrollLoansService = new PayrollLoansService(mockPrisma as PrismaService, mockEligibilityService as EligibilityService);
  });

  describe('1. Employee Records Multi-Tenant Security', () => {
    it('Employee A is denied access when attempting to read Employee B record', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-b',
        organizationId: 'org-beta',
      });

      await expect(employeesService.findOne('emp-b', employeeA)).rejects.toThrow(ForbiddenException);
      await expect(employeesService.findOne('emp-b', employeeA)).rejects.toThrow(
        'You can only view your own employee record',
      );
    });

    it('HR Admin Alpha is denied access when attempting to read Employee of Org Beta', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-b',
        organizationId: 'org-beta',
      });

      await expect(employeesService.findOne('emp-b', hrAdminAlpha)).rejects.toThrow(ForbiddenException);
      await expect(employeesService.findOne('emp-b', hrAdminAlpha)).rejects.toThrow(
        'Employee belongs to another organization',
      );
    });

    it('Employee A findAll is strictly constrained to their own record', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);
      await employeesService.findAll(employeeA);
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'emp-a' },
        }),
      );
    });
  });

  describe('2. Salary Records Multi-Tenant Security', () => {
    it('Employee A cannot read salary records of Employee B', async () => {
      await expect(salaryService.findByEmployee('emp-b', employeeA)).rejects.toThrow(ForbiddenException);
      await expect(salaryService.findByEmployee('emp-b', employeeA)).rejects.toThrow(
        'You can only view your own salary records',
      );
    });

    it('HR Admin Alpha cannot read salary records of Employee belonging to Org Beta', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-b',
        organizationId: 'org-beta',
      });

      await expect(salaryService.findByEmployee('emp-b', hrAdminAlpha)).rejects.toThrow(ForbiddenException);
      await expect(salaryService.findByEmployee('emp-b', hrAdminAlpha)).rejects.toThrow(
        'Employee belongs to another organization',
      );
    });

    it('Salary findAll scopes Employee to employeeId and HR to organizationId', async () => {
      mockPrisma.salaryRecord.findMany.mockResolvedValue([]);
      await salaryService.findAll(employeeA, 11, 2026);
      expect(mockPrisma.salaryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { month: 11, year: 2026, employeeId: 'emp-a' },
        }),
      );

      await salaryService.findAll(hrAdminAlpha, 11, 2026);
      expect(mockPrisma.salaryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { month: 11, year: 2026, employee: { organizationId: 'org-alpha' } },
        }),
      );
    });
  });

  describe('3. Attendance Records Multi-Tenant Security (Read & Write)', () => {
    it('Attendance findAll scopes HR query strictly to their organizationId', async () => {
      mockPrisma.attendanceRecord.findMany.mockResolvedValue([]);
      await attendanceService.findAll(hrAdminAlpha.organizationId, 11, 2026);
      expect(mockPrisma.attendanceRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { month: 11, year: 2026, employee: { organizationId: 'org-alpha' } },
        }),
      );
    });

    it('findEmployeeOrg accurately returns organizationId for cross-tenant check', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ organizationId: 'org-beta' });
      const emp = await attendanceService.findEmployeeOrg('emp-b');
      expect(emp?.organizationId).toBe('org-beta');
      expect(emp?.organizationId === hrAdminAlpha.organizationId).toBe(false);
    });
  });

  describe('4. Payroll Batches & Exports Multi-Tenant Security (Read & Write)', () => {
    it('HR Admin Alpha cannot read Payroll Batch belonging to Org Beta', async () => {
      mockPrisma.payrollBatch.findUnique.mockResolvedValue({
        id: 'batch-beta-1',
        organizationId: 'org-beta',
      });

      await expect(payrollService.getBatchById('batch-beta-1', hrAdminAlpha)).rejects.toThrow(ForbiddenException);
      await expect(payrollService.getBatchById('batch-beta-1', hrAdminAlpha)).rejects.toThrow(
        'Batch belongs to another organization',
      );
    });

    it('HR Admin Alpha cannot generate a Payroll Batch for Org Beta', async () => {
      await expect(
        payrollService.generateBatch('org-beta', 11, 2026, hrAdminAlpha),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        payrollService.generateBatch('org-beta', 11, 2026, hrAdminAlpha),
      ).rejects.toThrow('Cannot generate batch for another organization');
    });
  });

  describe('5. Reconciliation & Remittances Multi-Tenant Security (Read & Write)', () => {
    it('Reconciliation remittances query is strictly scoped to organizationId', async () => {
      mockPrisma.employerRemittance.findMany.mockResolvedValue([]);
      await reconciliationService.getRemittances('org-alpha');
      expect(mockPrisma.employerRemittance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-alpha' },
        }),
      );
    });

    it('HR Admin Alpha cannot upload remittance for a batch belonging to Org Beta', async () => {
      mockPrisma.payrollBatch.findUnique.mockResolvedValue({
        id: 'batch-beta-99',
        organizationId: 'org-beta',
        items: [],
      });

      await expect(
        reconciliationService.uploadRemittance(
          {
            payrollBatchId: 'batch-beta-99',
            utrNumber: 'CMS1234567890',
            remittedAmountPaise: 5000000,
          },
          hrAdminAlpha,
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        reconciliationService.uploadRemittance(
          {
            payrollBatchId: 'batch-beta-99',
            utrNumber: 'CMS1234567890',
            remittedAmountPaise: 5000000,
          },
          hrAdminAlpha,
        ),
      ).rejects.toThrow('Payroll batch belongs to another organization');
    });
  });

  describe('6. Loan Applications & Loans Multi-Tenant Security (Read & Write)', () => {
    it('Employee A cannot read Loan Application of Employee B', async () => {
      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-b-1',
        employeeId: 'emp-b',
        organizationId: 'org-beta',
      });

      await expect(loanApplicationsService.findOne('app-b-1', employeeA)).rejects.toThrow(ForbiddenException);
    });

    it('HR Admin Alpha cannot read Loan Application of Org Beta', async () => {
      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-b-1',
        employeeId: 'emp-b',
        organizationId: 'org-beta',
      });

      await expect(loanApplicationsService.findOne('app-b-1', hrAdminAlpha)).rejects.toThrow(ForbiddenException);
    });

    it('Employee A cannot apply for EWA using Employee B identifier (IDOR write defense)', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-b',
        organizationId: 'org-beta',
        bankAccounts: [{ isSalaryAccount: true }],
      });

      await expect(ewaService.apply('emp-b', 500000, employeeA)).rejects.toThrow(ForbiddenException);
      await expect(ewaService.apply('emp-b', 500000, employeeA)).rejects.toThrow(
        'You can only apply for your own account',
      );
    });

    it('Employee A cannot apply for Payroll Loan using Employee B identifier (IDOR write defense)', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-b',
        organizationId: 'org-beta',
        bankAccounts: [{ isSalaryAccount: true }],
      });

      await expect(
        payrollLoansService.apply(
          'emp-b',
          { requestedAmountPaise: 5000000, tenureMonths: 12, purpose: 'Medical' },
          employeeA,
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        payrollLoansService.apply(
          'emp-b',
          { requestedAmountPaise: 5000000, tenureMonths: 12, purpose: 'Medical' },
          employeeA,
        ),
      ).rejects.toThrow('You can only apply for your own account');
    });

    it('HR Admin Alpha cannot transition Loan Application belonging to Org Beta', async () => {
      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-beta-1',
        organizationId: 'org-beta',
        status: ApplicationStatus.DRAFT,
      });

      await expect(
        loanApplicationsService.transitionStatus(
          'app-beta-1',
          ApplicationStatus.SUBMITTED,
          hrAdminAlpha,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
