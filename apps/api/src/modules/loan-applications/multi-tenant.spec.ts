import { LoanApplicationsService } from './loan-applications.service';
import { PrismaService } from '../../common/prisma.service';
import { ApplicationStatus } from '@dada/contracts';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('LoanApplicationsService - Multi-Tenant Isolation & State Machine Validator', () => {
  let service: LoanApplicationsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
      loanApplication: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
      },
      auditEvent: {
        create: jest.fn(),
      },
    };

    service = new LoanApplicationsService(mockPrisma as PrismaService);
  });

  describe('Multi-Tenant Scoping (findAll)', () => {
    it('scopes employee queries strictly to employeeId and organizationId regardless of params', async () => {
      const employeeUser = {
        id: 'user-emp-1',
        role: 'EMPLOYEE',
        employeeId: 'emp-1',
        organizationId: 'org-techcorp',
      };

      mockPrisma.loanApplication.findMany.mockResolvedValue([]);

      await service.findAll(
        { employeeId: 'attacker-emp-2', organizationId: 'attacker-org-2' },
        employeeUser,
      );

      expect(mockPrisma.loanApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
            organizationId: 'org-techcorp',
          }),
        }),
      );
    });

    it('scopes HR queries strictly to their authenticated organizationId', async () => {
      const hrUser = {
        id: 'user-hr-1',
        role: 'HR_ADMIN',
        organizationId: 'org-techcorp',
      };

      mockPrisma.loanApplication.findMany.mockResolvedValue([]);

      await service.findAll(
        { organizationId: 'other-org-id' },
        hrUser,
      );

      expect(mockPrisma.loanApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-techcorp',
          }),
        }),
      );
    });
  });

  describe('IDOR Protection (findOne)', () => {
    it('rejects employee access to an application belonging to another employee', async () => {
      const employeeUser = {
        id: 'user-emp-1',
        role: 'EMPLOYEE',
        employeeId: 'emp-1',
        organizationId: 'org-techcorp',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-target',
        employeeId: 'emp-victim-2',
        organizationId: 'org-techcorp',
      });

      await expect(service.findOne('app-target', employeeUser)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne('app-target', employeeUser)).rejects.toThrow(
        'You can only view your own applications',
      );
    });

    it('rejects HR access to an application belonging to another organization', async () => {
      const hrUser = {
        id: 'user-hr-1',
        role: 'HR_ADMIN',
        organizationId: 'org-techcorp',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-other-org',
        employeeId: 'emp-xyz',
        organizationId: 'org-other-company',
      });

      await expect(service.findOne('app-other-org', hrUser)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne('app-other-org', hrUser)).rejects.toThrow(
        'Application belongs to another organization',
      );
    });

    it('allows Dada Admin cross-tenant visibility', async () => {
      const dadaAdmin = {
        id: 'user-dada-admin',
        role: 'DADA_ADMIN',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-target',
        employeeId: 'emp-xyz',
        organizationId: 'org-any',
      });

      const res = await service.findOne('app-target', dadaAdmin);
      expect(res.id).toBe('app-target');
    });
  });

  describe('Centralized Loan State Machine Validator (transitionStatus)', () => {
    it('allows permitted state transition and logs status history record', async () => {
      const user = {
        id: 'user-emp-1',
        role: 'EMPLOYEE',
        employeeId: 'emp-1',
        organizationId: 'org-techcorp',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        employeeId: 'emp-1',
        organizationId: 'org-techcorp',
        status: ApplicationStatus.DRAFT,
      });

      mockPrisma.loanApplication.update.mockResolvedValue({
        id: 'app-1',
        status: ApplicationStatus.SUBMITTED,
      });

      await service.transitionStatus(
        'app-1',
        ApplicationStatus.SUBMITTED,
        user,
        'Employee submitted application',
      );

      expect(mockPrisma.loanApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'app-1' },
          data: expect.objectContaining({
            status: ApplicationStatus.SUBMITTED,
            statusHistory: {
              create: expect.objectContaining({
                fromStatus: ApplicationStatus.DRAFT,
                toStatus: ApplicationStatus.SUBMITTED,
                changedByRole: 'EMPLOYEE',
              }),
            },
          }),
        }),
      );
    });

    it('rejects arbitrary, invalid state jumps with BadRequestException', async () => {
      const user = {
        id: 'user-admin',
        role: 'DADA_ADMIN',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        status: ApplicationStatus.DRAFT,
      });

      // Jump from DRAFT directly to DISBURSED is strictly forbidden
      await expect(
        service.transitionStatus('app-1', ApplicationStatus.DISBURSED, user),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.transitionStatus('app-1', ApplicationStatus.DISBURSED, user),
      ).rejects.toThrow('Invalid loan state transition: Cannot move application from DRAFT to DISBURSED');
    });

    it('blocks employees from performing privileged administrative transitions (e.g. APPROVED)', async () => {
      const employeeUser = {
        id: 'user-emp-1',
        role: 'EMPLOYEE',
        employeeId: 'emp-1',
        organizationId: 'org-techcorp',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        employeeId: 'emp-1',
        organizationId: 'org-techcorp',
        status: ApplicationStatus.SENT_TO_NBFC,
      });

      await expect(
        service.transitionStatus('app-1', ApplicationStatus.APPROVED, employeeUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('prevents transitioning an application that is already in terminal DISBURSED state', async () => {
      const adminUser = {
        id: 'user-admin',
        role: 'DADA_ADMIN',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-disbursed',
        status: ApplicationStatus.DISBURSED,
        loan: { id: 'loan-123' },
      });

      await expect(
        service.transitionStatus('app-disbursed', ApplicationStatus.DISBURSED, adminUser),
      ).rejects.toThrow('Already disbursed (terminal state)');
    });

    it('requires DADA_ADMIN manual override to provide explicit audit remarks (> 15 chars)', async () => {
      const adminUser = {
        id: 'user-admin',
        role: 'DADA_ADMIN',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        status: ApplicationStatus.SENT_TO_NBFC,
      });

      // Attempting manual approval with short remarks throws
      await expect(
        service.transitionStatus('app-1', ApplicationStatus.APPROVED, adminUser, 'too short'),
      ).rejects.toThrow('Manual NBFC approval/disbursement override requires an explicit audit reason of at least 15 characters');
    });

    it('records AuditEvent and DADA_ADMIN_OVERRIDE on authorized manual exception', async () => {
      const adminUser = {
        id: 'user-admin',
        role: 'DADA_ADMIN',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        organizationId: 'org-1',
        status: ApplicationStatus.SENT_TO_NBFC,
      });
      mockPrisma.loanApplication.update.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.APPROVED });

      const auditReason = 'Regulatory audit exception confirmed by Apex NBFC credit officer';
      await service.transitionStatus('app-1', ApplicationStatus.APPROVED, adminUser, auditReason);

      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'DADA_ADMIN_MANUAL_OVERRIDE_EXCEPTION',
            resourceType: 'LOAN_APPLICATION',
            resourceId: 'app-1',
          }),
        }),
      );
      expect(mockPrisma.loanApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ApplicationStatus.APPROVED,
            statusHistory: {
              create: expect.objectContaining({
                changedByRole: 'DADA_ADMIN_OVERRIDE',
              }),
            },
          }),
        }),
      );
    });

    it('denies HR Admin authority to approve or disburse lending applications', async () => {
      const hrUser = {
        id: 'user-hr-1',
        role: 'HR_ADMIN',
        organizationId: 'org-techcorp',
      };

      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        organizationId: 'org-techcorp',
        status: ApplicationStatus.SENT_TO_NBFC,
      });

      await expect(
        service.transitionStatus('app-1', ApplicationStatus.APPROVED, hrUser, 'HR attempting approval'),
      ).rejects.toThrow('Final lending approval and disbursement authority rests exclusively with partner NBFCs');
    });
  });
});
