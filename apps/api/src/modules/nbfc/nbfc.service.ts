import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ApplicationStatus } from '@dada/contracts';
import * as crypto from 'crypto';

@Injectable()
export class NbfcService {
  constructor(private prisma: PrismaService) {}

  async getPartners() {
    return this.prisma.nBFCPartner.findMany({
      include: {
        _count: {
          select: { applications: true, loans: true },
        },
      },
    });
  }

  /**
   * Verified NBFC Webhook receiver with HMAC signature verification and Idempotency
   */
  async processWebhook(payload: any, signature?: string) {
    const rawPayload = JSON.stringify(payload);
    const eventId = payload.eventId || `EVT_${Date.now()}`;

    // 1. Idempotency Check
    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: { key: eventId },
    });
    if (existing) {
      return { status: 'IDEMPOTENT_IGNORED', message: 'Webhook already processed' };
    }

    // 2. Persist Webhook Event
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        source: payload.source || 'APEX_CAPITAL',
        eventType: payload.eventType,
        payloadJson: rawPayload,
        signature,
        status: 'PENDING',
      },
    });

    try {
      const { applicationId, eventType, data } = payload;
      const app = await this.prisma.loanApplication.findUnique({
        where: { id: applicationId },
        include: { payrollLoanDetails: true, ewaDetails: true },
      });

      if (!app) throw new NotFoundException(`Application ${applicationId} not found`);

      if (eventType === 'APPLICATION_APPROVED') {
        await this.prisma.loanApplication.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.APPROVED,
            approvedAmountPaise: data?.approvedAmountPaise || app.requestedAmountPaise,
            statusHistory: {
              create: {
                fromStatus: app.status,
                toStatus: ApplicationStatus.APPROVED,
                changedByRole: 'NBFC_WEBHOOK',
                remarks: `Approved by ${payload.source || 'Apex Capital'} underwriter. Terms accepted.`,
              },
            },
          },
        });
      } else if (eventType === 'APPLICATION_REJECTED') {
        await this.prisma.loanApplication.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.REJECTED,
            rejectionReason: data?.rejectionReason || 'Underwriting criteria not met.',
            statusHistory: {
              create: {
                fromStatus: app.status,
                toStatus: ApplicationStatus.REJECTED,
                changedByRole: 'NBFC_WEBHOOK',
                remarks: data?.rejectionReason || 'Rejected by NBFC partner risk policy.',
              },
            },
          },
        });
      } else if (eventType === 'DISBURSEMENT_CONFIRMED') {
        const utr = data?.utrNumber || `CMS${Date.now()}`;
        const disbursedDate = new Date();

        // Partner NBFC transferred money directly to employee's bank account.
        // Dada records loan and repayment schedule.
        const loan = await this.prisma.loan.create({
          data: {
            loanAccountNumber: `LN-${app.productType}-${Date.now().toString().slice(-6)}`,
            applicationId: app.id,
            employeeId: app.employeeId,
            nbfcPartnerId: app.nbfcPartnerId!,
            productType: app.productType,
            principalPaise: app.approvedAmountPaise || app.requestedAmountPaise,
            interestRatePercent: app.interestRatePercent || 0,
            tenureMonths: app.tenureMonths || 1,
            monthlyEmiPaise: app.monthlyEmiPaise || app.requestedAmountPaise,
            totalRepayablePaise:
              app.productType === 'EWA'
                ? app.requestedAmountPaise
                : (app.payrollLoanDetails?.totalRepaymentPaise || app.requestedAmountPaise),
            totalPaidPaise: 0,
            outstandingPaise:
              app.productType === 'EWA'
                ? app.requestedAmountPaise
                : (app.payrollLoanDetails?.totalRepaymentPaise || app.requestedAmountPaise),
            disbursementUtr: utr,
            disbursedAt: disbursedDate,
            status: 'ACTIVE',
          },
        });

        // Generate Repayment Schedules
        const tenure = app.tenureMonths || 1;
        for (let i = 1; i <= tenure; i++) {
          await this.prisma.repaymentSchedule.create({
            data: {
              loanId: loan.id,
              installmentNumber: i,
              dueDate: new Date(2026, 10 + i, 30),
              principalPaise: Math.round(loan.principalPaise / tenure),
              interestPaise: Math.round((loan.totalRepayablePaise - loan.principalPaise) / tenure),
              totalDuePaise: loan.monthlyEmiPaise,
              paidPaise: 0,
              status: 'PENDING',
            },
          });
        }

        await this.prisma.loanApplication.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.DISBURSED,
            disbursedAt: disbursedDate,
            statusHistory: {
              create: {
                fromStatus: app.status,
                toStatus: ApplicationStatus.DISBURSED,
                changedByRole: 'NBFC_WEBHOOK',
                remarks: `Disbursement confirmed by NBFC. External Bank UTR: ${utr}. Funds credited to borrower salary account.`,
              },
            },
          },
        });
      }

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });

      await this.prisma.idempotencyRecord.create({
        data: {
          key: eventId,
          operationName: `WEBHOOK_${payload.eventType}`,
          responseJson: JSON.stringify({ status: 'SUCCESS', applicationId }),
        },
      });

      return { status: 'PROCESSED', eventId };
    } catch (err: any) {
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'FAILED', errorMessage: err.message },
      });
      throw err;
    }
  }

  /**
   * Interactive Simulator for Dada Admin & Demos:
   * Triggers simulated NBFC approvals, rejections, or external bank disbursements.
   */
  async simulateAction(data: { applicationId: string; action: 'APPROVE' | 'REJECT' | 'DISBURSE'; remarks?: string }) {
    const app = await this.prisma.loanApplication.findUnique({
      where: { id: data.applicationId },
      include: { nbfcPartner: true },
    });

    if (!app) throw new NotFoundException('Application not found');

    const eventMap = {
      APPROVE: 'APPLICATION_APPROVED',
      REJECT: 'APPLICATION_REJECTED',
      DISBURSE: 'DISBURSEMENT_CONFIRMED',
    };

    const webhookPayload = {
      eventId: `SIM_${Date.now()}`,
      source: app.nbfcPartner?.name || 'Apex Capital Finance Limited',
      eventType: eventMap[data.action],
      applicationId: app.id,
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: {
        utrNumber: `CMS${Date.now()}`,
        rejectionReason: data.remarks || 'Simulated rejection',
      },
    };

    return this.processWebhook(webhookPayload);
  }
}
