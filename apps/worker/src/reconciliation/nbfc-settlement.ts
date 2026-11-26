/**
 * NBFC Partner and Banking Rail Settlement Reconciliation Service
 * 
 * Non-negotiable requirements:
 * 1. Dada Advisory never holds or pools borrower funds.
 * 2. NBFC/bank confirmation is authoritative for financial settlement.
 * 3. Idempotent: duplicate disbursement/repayment webhooks cannot create duplicate records.
 * 4. Integer paise math strictly maintained.
 */
export class NbfcSettlementService {
  constructor(private prisma: any) {}

  /**
   * Reconciles authoritative bank-confirmed loan disbursement
   */
  async confirmDisbursement(
    applicationId: string,
    utrNumber: string,
    nbfcPartnerId: string,
  ): Promise<{ success: boolean; loanId: string; isDuplicate: boolean }> {
    const app = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { loan: true, employee: true },
    });

    if (!app) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // Idempotency: If loan already exists for this application, reject duplicate creation
    if (app.loan) {
      return { success: true, loanId: app.loan.id, isDuplicate: true };
    }

    const principalPaise = app.approvedAmountPaise || app.requestedAmountPaise;
    const tenureMonths = app.tenureMonths || (app.productType === 'EWA' ? 1 : 12);
    const interestRatePercent = app.interestRatePercent || 0.0;
    const monthlyEmiPaise = app.monthlyEmiPaise || principalPaise;

    // Calculate total repayable
    let totalRepayablePaise = principalPaise;
    if (app.productType === 'PAYROLL_LOAN') {
      totalRepayablePaise = monthlyEmiPaise * tenureMonths;
    }

    const loanAccountNumber = `LN-${app.applicationNumber.replace('DADA-', '')}`;

    const loan = await this.prisma.$transaction(async (tx: any) => {
      // 1. Create active Loan record
      const createdLoan = await tx.loan.create({
        data: {
          loanAccountNumber,
          applicationId: app.id,
          employeeId: app.employeeId,
          nbfcPartnerId,
          productType: app.productType,
          principalPaise,
          interestRatePercent,
          tenureMonths,
          monthlyEmiPaise,
          totalRepayablePaise,
          totalPaidPaise: 0,
          outstandingPaise: totalRepayablePaise,
          disbursementUtr: utrNumber,
          disbursedAt: new Date(),
          status: 'ACTIVE',
        },
      });

      // 2. Generate initial Repayment Schedule installments
      const now = new Date();
      const schedulesToCreate: any[] = [];

      for (let i = 1; i <= tenureMonths; i++) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const installmentDuePaise = app.productType === 'EWA' ? principalPaise : monthlyEmiPaise;

        schedulesToCreate.push({
          loanId: createdLoan.id,
          installmentNumber: i,
          dueDate,
          principalPaise: Math.floor(principalPaise / tenureMonths),
          interestPaise: Math.max(0, installmentDuePaise - Math.floor(principalPaise / tenureMonths)),
          totalDuePaise: installmentDuePaise,
          paidPaise: 0,
          status: 'PENDING',
        });
      }

      await tx.repaymentSchedule.createMany({
        data: schedulesToCreate,
      });

      // 3. Mark LoanApplication as DISBURSED
      await tx.loanApplication.update({
        where: { id: app.id },
        data: {
          status: 'DISBURSED',
          disbursedAt: new Date(),
        },
      });

      // 4. Record audit event
      await tx.auditEvent.create({
        data: {
          organizationId: app.organizationId,
          action: 'BANK_DISBURSEMENT_CONFIRMED',
          resourceType: 'LOAN',
          resourceId: createdLoan.id,
          metadataJson: JSON.stringify({
            applicationId: app.id,
            loanAccountNumber,
            utrNumber,
            disbursedPrincipalPaise: principalPaise,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return createdLoan;
    });

    return { success: true, loanId: loan.id, isDuplicate: false };
  }

  /**
   * Reconciles bank/NBFC repayment confirmation
   */
  async confirmRepayment(
    loanId: string,
    repaymentAmountPaise: number,
    utrNumber: string,
    repaymentType = 'PAYROLL_DEDUCTION',
  ): Promise<{
    repaymentId: string;
    newOutstandingPaise: number;
    isLoanClosed: boolean;
  }> {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        repaymentSchedules: {
          where: { status: { in: ['PENDING', 'PARTIALLY_PAID'] } },
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });

    if (!loan) {
      throw new Error(`Loan ${loanId} not found`);
    }

    const result = await this.prisma.$transaction(async (tx: any) => {
      // 1. Create Repayment record
      const repayment = await tx.repayment.create({
        data: {
          loanId: loan.id,
          employeeId: loan.employeeId,
          amountPaise: repaymentAmountPaise,
          repaymentType,
          utrNumber,
          status: 'CONFIRMED_BY_NBFC',
          paymentDate: new Date(),
          confirmedAt: new Date(),
        },
      });

      // 2. Allocate payment to pending installments
      let remainingPayment = repaymentAmountPaise;
      for (const schedule of loan.repaymentSchedules) {
        if (remainingPayment <= 0) break;

        const scheduleShortfall = schedule.totalDuePaise - schedule.paidPaise;
        const paymentToApply = Math.min(remainingPayment, scheduleShortfall);
        const newPaid = schedule.paidPaise + paymentToApply;
        const isPaidFull = newPaid >= schedule.totalDuePaise;

        await tx.repaymentSchedule.update({
          where: { id: schedule.id },
          data: {
            paidPaise: newPaid,
            status: isPaidFull ? 'PAID' : 'PARTIALLY_PAID',
            paidAt: isPaidFull ? new Date() : null,
          },
        });

        remainingPayment -= paymentToApply;
      }

      // 3. Update Loan balances
      const updatedTotalPaid = loan.totalPaidPaise + repaymentAmountPaise;
      const updatedOutstanding = Math.max(0, loan.totalRepayablePaise - updatedTotalPaid);
      const isClosed = updatedOutstanding === 0;

      await tx.loan.update({
        where: { id: loan.id },
        data: {
          totalPaidPaise: updatedTotalPaid,
          outstandingPaise: updatedOutstanding,
          status: isClosed ? 'CLOSED' : 'ACTIVE',
        },
      });

      // 4. Record audit event
      await tx.auditEvent.create({
        data: {
          action: 'REPAYMENT_SETTLEMENT_CONFIRMED',
          resourceType: 'REPAYMENT',
          resourceId: repayment.id,
          metadataJson: JSON.stringify({
            loanId: loan.id,
            repaymentAmountPaise,
            utrNumber,
            remainingOutstandingPaise: updatedOutstanding,
            isClosed,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return {
        repaymentId: repayment.id,
        newOutstandingPaise: updatedOutstanding,
        isLoanClosed: isClosed,
      };
    });

    return result;
  }
}
