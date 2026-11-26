import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EligibilityService } from '../eligibility/eligibility.service';
import { ApplicationStatus } from '@dada/contracts';

@Injectable()
export class EwaService {
  constructor(
    private prisma: PrismaService,
    private eligibilityService: EligibilityService,
  ) {}

  async apply(employeeId: string, requestedAmountPaise: number, user?: any) {
    if (!employeeId) {
      throw new BadRequestException('Employee ID is required.');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        bankAccounts: { where: { isSalaryAccount: true } },
        organization: true,
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    // Multi-tenant validation: Prevent IDOR
    if (user) {
      if (user.role === 'EMPLOYEE' && employee.id !== user.employeeId) {
        throw new ForbiddenException('Access denied: You can only apply for your own account.');
      }
      if (user.role.startsWith('HR_') && employee.organizationId !== user.organizationId) {
        throw new ForbiddenException('Access denied: Employee belongs to another organization.');
      }
    }

    const eligibility = await this.eligibilityService.checkEwaEligibility(employeeId);
    if (!eligibility.isEligible) {
      throw new BadRequestException(eligibility.ineligibilityReason || 'Not eligible for EWA withdrawal.');
    }

    if (requestedAmountPaise > eligibility.availableEwaPaise) {
      throw new BadRequestException(
        `Requested amount ₹${requestedAmountPaise / 100} exceeds available EWA limit of ₹${eligibility.availableEwaPaise / 100}`,
      );
    }

    if (requestedAmountPaise < eligibility.minWithdrawalAllowedPaise) {
      throw new BadRequestException(
        `Minimum withdrawal allowed is ₹${eligibility.minWithdrawalAllowedPaise / 100}`,
      );
    }
    const bank = employee.bankAccounts[0];
    if (!bank) throw new BadRequestException('No verified salary bank account linked');

    // Get active NBFC partner
    const nbfc = await this.prisma.nBFCPartner.findFirst({
      where: { isActive: true },
    });

    const appNumber = `DADA-EWA-${Date.now().toString().slice(-6)}`;
    const feePaise = eligibility.policy.convenienceFeePaise;
    const netDisbursementPaise = requestedAmountPaise - feePaise;

    // Create loan application with state machine: DRAFT -> SUBMITTED -> SENT_TO_NBFC
    const application = await this.prisma.loanApplication.create({
      data: {
        applicationNumber: appNumber,
        organizationId: employee.organizationId,
        employeeId,
        nbfcPartnerId: nbfc?.id,
        productType: 'EWA',
        status: ApplicationStatus.SENT_TO_NBFC,
        requestedAmountPaise,
        approvedAmountPaise: requestedAmountPaise,
        tenureMonths: 1,
        interestRatePercent: 0,
        processingFeePaise: feePaise,
        monthlyEmiPaise: requestedAmountPaise,
        disbursementAccountNo: bank.accountNumber,
        disbursementIfsc: bank.ifscCode,
        nbfcApplicationRef: `APEX-EWA-${appNumber}`,
        ewaDetails: {
          create: {
            salaryCycleMonth: 11,
            salaryCycleYear: 2026,
            approvedDaysWorked: eligibility.attendance.totalApprovedWorkedDays,
            grossEarnedPaise: eligibility.grossEarnedWagePaise,
            convenienceFeePaise: feePaise,
            netDisbursementPaise,
            repaymentDueDate: new Date('2026-11-30'),
          },
        },
        statusHistory: {
          createMany: {
            data: [
              { fromStatus: ApplicationStatus.DRAFT, toStatus: ApplicationStatus.SUBMITTED, changedByRole: 'EMPLOYEE', remarks: 'Employee initiated EWA withdrawal' },
              { fromStatus: ApplicationStatus.SUBMITTED, toStatus: ApplicationStatus.SENT_TO_NBFC, changedByRole: 'SYSTEM', remarks: 'Eligibility verified, routed to NBFC partner' },
            ],
          },
        },
      },
      include: { ewaDetails: true, statusHistory: true },
    });

    return {
      success: true,
      application,
      message: 'EWA withdrawal application successfully submitted and forwarded to NBFC for disbursement approval.',
    };
  }
}
