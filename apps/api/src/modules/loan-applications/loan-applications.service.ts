import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  ApplicationStatus,
  canTransitionApplication,
} from '@dada/contracts';

@Injectable()
export class LoanApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    options: { productType?: string; status?: string; employeeId?: string; organizationId?: string },
    user: any,
  ) {
    const where: any = {};

    // Multi-tenant isolation: Never trust client-supplied tenant identifiers
    if (user.role === 'EMPLOYEE') {
      where.employeeId = user.employeeId;
      if (user.organizationId) {
        where.organizationId = user.organizationId;
      }
    } else if (user.role.startsWith('HR_')) {
      where.organizationId = user.organizationId;
      if (options.employeeId) {
        // Verify employee belongs to this HR's organization
        const emp = await this.prisma.employee.findUnique({
          where: { id: options.employeeId },
          select: { organizationId: true },
        });
        if (emp && emp.organizationId === user.organizationId) {
          where.employeeId = options.employeeId;
        } else {
          where.employeeId = 'NOT_FOUND_FOR_ORG';
        }
      }
    } else if (user.role.startsWith('DADA_')) {
      // Dada Admin has cross-organization visibility
      if (options.organizationId) where.organizationId = options.organizationId;
      if (options.employeeId) where.employeeId = options.employeeId;
    }

    if (options.productType) where.productType = options.productType;
    if (options.status) where.status = options.status;

    return this.prisma.loanApplication.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        ewaDetails: true,
        payrollLoanDetails: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        loan: {
          include: {
            repaymentSchedules: { orderBy: { installmentNumber: 'asc' } },
            nbfcPartner: true,
          },
        },
        nbfcPartner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEmployeeLoans(user: any) {
    if (!user.employeeId) return [];
    return this.prisma.loan.findMany({
      where: { employeeId: user.employeeId },
      include: {
        application: true,
        repaymentSchedules: { orderBy: { installmentNumber: 'asc' } },
        repayments: { orderBy: { paymentDate: 'desc' } },
        nbfcPartner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    const app = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            organization: true,
            bankAccounts: true,
            kycRecords: true,
          },
        },
        nbfcPartner: true,
        ewaDetails: true,
        payrollLoanDetails: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        loan: {
          include: {
            repaymentSchedules: { orderBy: { installmentNumber: 'asc' } },
          },
        },
      },
    });

    if (!app) throw new NotFoundException('Application not found');

    // Multi-tenant check: Prevent IDOR
    if (user.role === 'EMPLOYEE' && app.employeeId !== user.employeeId) {
      throw new ForbiddenException('Access denied: You can only view your own applications.');
    }
    if (user.role.startsWith('HR_') && app.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied: Application belongs to another organization.');
    }

    return app;
  }

  async transitionStatus(
    id: string,
    toStatus: ApplicationStatus,
    user: any,
    remarks?: string,
  ) {
    const app = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: { loan: true },
    });
    if (!app) throw new NotFoundException('Application not found');

    // 1. Multi-tenant verification
    if (user.role === 'EMPLOYEE' && app.employeeId !== user.employeeId) {
      throw new ForbiddenException('Access denied: You can only manage your own applications.');
    }
    if (user.role.startsWith('HR_') && app.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied: Application belongs to another organization.');
    }

    const currentStatus = app.status as ApplicationStatus;

    // 2. Terminal state check
    if (currentStatus === ApplicationStatus.DISBURSED) {
      throw new BadRequestException('Cannot transition application: Already disbursed (terminal state).');
    }
    if (currentStatus === ApplicationStatus.REJECTED || currentStatus === ApplicationStatus.CANCELLED) {
      throw new BadRequestException(`Cannot transition application: Terminal state ${currentStatus}.`);
    }

    // 3. Centralized state machine transition validation
    if (!canTransitionApplication(currentStatus, toStatus)) {
      throw new BadRequestException(
        `Invalid loan state transition: Cannot move application from ${currentStatus} to ${toStatus}.`,
      );
    }

    // 4. Role-based transition authorization
    if (user.role === 'EMPLOYEE') {
      const allowedEmployeeTransitions = [
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.OFFER_ACCEPTED,
        ApplicationStatus.ESIGN_PENDING,
        ApplicationStatus.MANDATE_PENDING,
        ApplicationStatus.CANCELLED,
      ];
      if (!allowedEmployeeTransitions.includes(toStatus)) {
        throw new ForbiddenException(`Employees are not permitted to transition application to ${toStatus}.`);
      }
    }

    let isManualOverride = false;
    let effectiveRole = user.role;

    // 5. NBFC Approval & Disbursement Authority
    if (toStatus === ApplicationStatus.APPROVED || toStatus === ApplicationStatus.DISBURSED) {
      if (user.role !== 'NBFC_WEBHOOK') {
        if (user.role !== 'DADA_ADMIN' && user.role !== 'DADA_SUPER_ADMIN') {
          throw new ForbiddenException(
            `Final lending approval and disbursement authority rests exclusively with partner NBFCs. Role ${user.role} is not permitted to approve or disburse loans.`,
          );
        }

        // DADA_ADMIN manual override requires rigorous audit reason
        if (!remarks || remarks.trim().length < 15) {
          throw new BadRequestException(
            'Manual NBFC approval/disbursement override requires an explicit audit reason of at least 15 characters.',
          );
        }

        isManualOverride = true;
        effectiveRole = 'DADA_ADMIN_OVERRIDE';
      }
    }

    // 6. Duplicate disbursement protection
    if (toStatus === ApplicationStatus.DISBURSED) {
      if (app.loan) {
        throw new BadRequestException('Duplicate disbursement rejected: A loan record already exists for this application.');
      }
      if (currentStatus !== ApplicationStatus.DISBURSEMENT_PENDING) {
        throw new BadRequestException('Disbursement can only occur when status is DISBURSEMENT_PENDING.');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (isManualOverride) {
        await tx.auditEvent.create({
          data: {
            organizationId: app.organizationId,
            userId: user.id,
            action: 'DADA_ADMIN_MANUAL_OVERRIDE_EXCEPTION',
            resourceType: 'LOAN_APPLICATION',
            resourceId: app.id,
            metadataJson: JSON.stringify({
              fromStatus: currentStatus,
              toStatus,
              remarks,
              actorUserId: user.id,
              actorRole: user.role,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      }

      if (toStatus === ApplicationStatus.OFFER_ACCEPTED) {
        if (!app.approvedAmountPaise || app.approvedAmountPaise <= 0) {
          throw new BadRequestException(
            'Cannot accept KFS offer: No NBFC-sanctioned credit terms recorded on this application.',
          );
        }

        // Create immutable statutory borrower consent record capturing exact NBFC terms
        await tx.consentRecord.create({
          data: {
            userId: user.id,
            purpose: 'KFS_ACCEPTANCE',
            consentVersion: app.kfsDocumentId || `KFS-${app.applicationNumber}-v1.0`,
            ipAddress: user.ip || '127.0.0.1',
            userAgent: user.userAgent || 'DADA_PORTAL_WEB',
          },
        });

        // Record immutable audit event capturing full sanctioned KFS financial parameters
        await tx.auditEvent.create({
          data: {
            organizationId: app.organizationId,
            userId: user.id,
            action: 'BORROWER_KFS_STATUTORY_ACCEPTANCE',
            resourceType: 'LOAN_APPLICATION',
            resourceId: app.id,
            metadataJson: JSON.stringify({
              applicationNumber: app.applicationNumber,
              productType: app.productType,
              sanctionedPrincipalPaise: app.approvedAmountPaise,
              interestRatePercent: app.interestRatePercent || 0,
              processingFeePaise: app.processingFeePaise || 0,
              monthlyEmiPaise: app.monthlyEmiPaise || app.approvedAmountPaise,
              tenureMonths: app.tenureMonths || 1,
              nbfcPartnerId: app.nbfcPartnerId,
              kfsDocumentId: app.kfsDocumentId || `KFS-${app.applicationNumber}-v1.0`,
              acceptedTimestamp: new Date().toISOString(),
              legalDeclaration:
                'Borrower confirms statutory review and acceptance of Key Fact Statement (KFS) terms underwritten directly by partner NBFC.',
            }),
          },
        });
      }

      return tx.loanApplication.update({
        where: { id },
        data: {
          status: toStatus,
          kfsAcceptedAt: toStatus === ApplicationStatus.OFFER_ACCEPTED ? new Date() : undefined,
          statusHistory: {
            create: {
              fromStatus: currentStatus,
              toStatus,
              changedByRole: effectiveRole,
              remarks: remarks || `Transitioned to ${toStatus} by ${effectiveRole}`,
            },
          },
        },
        include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
      });
    });

    return updated;

    return updated;
  }
}
