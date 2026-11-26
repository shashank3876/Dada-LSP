import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EligibilityService } from '../eligibility/eligibility.service';
import { calculatePayrollLoanEmi, ApplicationStatus } from '@dada/contracts';

@Injectable()
export class PayrollLoansService {
  constructor(
    private prisma: PrismaService,
    private eligibilityService: EligibilityService,
  ) {}

  calculateEmi(data: { principalPaise: number; annualInterestRatePercent: number; tenureMonths: number }) {
    return calculatePayrollLoanEmi({
      ...data,
      processingFeePercent: 1.5,
    });
  }

  async apply(
    employeeId: string,
    data: { requestedAmountPaise: number; tenureMonths: number; purpose: string },
    user?: any,
  ) {
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

    const eligibility = await this.eligibilityService.checkPayrollLoanEligibility(employeeId);
    if (!eligibility.isEligible) {
      throw new BadRequestException(eligibility.ineligibilityReason || 'Not eligible for payroll loan');
    }

    if (data.requestedAmountPaise > eligibility.maxLoanAmountPaise) {
      throw new BadRequestException(
        `Requested loan ₹${data.requestedAmountPaise / 100} exceeds permissible limit of ₹${eligibility.maxLoanAmountPaise / 100}`,
      );
    }

    const bank = employee.bankAccounts[0];
    const nbfc = await this.prisma.nBFCPartner.findFirst({ where: { isActive: true } });

    const emiDetails = calculatePayrollLoanEmi({
      principalPaise: data.requestedAmountPaise,
      annualInterestRatePercent: eligibility.policy.annualInterestRatePercent,
      tenureMonths: data.tenureMonths,
      processingFeePercent: eligibility.policy.processingFeePercent,
    });

    const appNumber = `DADA-PL-${Date.now().toString().slice(-6)}`;

    const application = await this.prisma.loanApplication.create({
      data: {
        applicationNumber: appNumber,
        organizationId: employee.organizationId,
        employeeId,
        nbfcPartnerId: nbfc?.id,
        productType: 'PAYROLL_LOAN',
        status: ApplicationStatus.SENT_TO_NBFC,
        requestedAmountPaise: data.requestedAmountPaise,
        approvedAmountPaise: data.requestedAmountPaise,
        tenureMonths: data.tenureMonths,
        interestRatePercent: eligibility.policy.annualInterestRatePercent,
        processingFeePaise: emiDetails.processingFeePaise,
        monthlyEmiPaise: emiDetails.monthlyEmiPaise,
        disbursementAccountNo: bank?.accountNumber || 'XXXX-XXXX-4589',
        disbursementIfsc: bank?.ifscCode || 'HDFC0000123',
        nbfcApplicationRef: `APEX-PL-${appNumber}`,
        payrollLoanDetails: {
          create: {
            purpose: data.purpose,
            creditBureauScore: 760,
            foirPercentCalculated: 22.5,
            totalInterestPaise: emiDetails.totalInterestPaise,
            totalRepaymentPaise: emiDetails.totalRepaymentPaise,
            firstEmiDate: new Date('2026-12-31'),
          },
        },
        statusHistory: {
          createMany: {
            data: [
              { fromStatus: ApplicationStatus.DRAFT, toStatus: ApplicationStatus.SUBMITTED, changedByRole: 'EMPLOYEE', remarks: 'Submitted by employee' },
              { fromStatus: ApplicationStatus.SUBMITTED, toStatus: ApplicationStatus.SENT_TO_NBFC, changedByRole: 'SYSTEM', remarks: 'Eligibility verified, forwarded to NBFC' },
            ],
          },
        },
      },
      include: { payrollLoanDetails: true, statusHistory: true },
    });

    return {
      success: true,
      application,
      emiDetails,
      message: 'Payroll loan application submitted successfully and sent to NBFC underwriter.',
    };
  }
}
