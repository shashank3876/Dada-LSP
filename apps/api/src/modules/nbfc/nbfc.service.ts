import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ApplicationStatus, canTransitionApplication } from '@dada/contracts';
import * as crypto from 'crypto';

const APPLICATION_STATE_RANKS: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  ELIGIBILITY_CHECK_PENDING: 2,
  ELIGIBLE: 3,
  KYC_PENDING: 4,
  KYC_VERIFIED: 5,
  SENT_TO_NBFC: 6,
  NBFC_REVIEW_PENDING: 7,
  APPROVED: 8,
  OFFER_ACCEPTED: 9,
  ESIGN_PENDING: 10,
  MANDATE_PENDING: 11,
  READY_FOR_DISBURSEMENT: 12,
  DISBURSEMENT_PENDING: 13,
  DISBURSED: 14,
  REJECTED: 15,
  CANCELLED: 16,
  FAILED: 17,
};

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
   * Helper to verify HMAC-SHA256 signature against webhook raw body and partner secret
   */
  verifyHmacSignature(rawPayload: string, signature: string, secret: string): boolean {
    try {
      const computed = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
      const sigBuf = Buffer.from(signature.trim().toLowerCase(), 'hex');
      const compBuf = Buffer.from(computed.toLowerCase(), 'hex');

      if (sigBuf.length !== compBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuf, compBuf);
    } catch {
      return false;
    }
  }

  /**
   * Verified NBFC Webhook receiver with HMAC signature verification, Timestamp Replay-Window Validation,
   * Idempotency, Database-level Deduplication, and Out-of-Order Regression Protection.
   */
  async processWebhook(payload: any, signature?: string, rawBodyString?: string) {
    const isProductionOrStaging =
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

    if (!payload.isSimulated && isProductionOrStaging && !rawBodyString) {
      throw new UnauthorizedException(
        'Security Policy Violation: Raw request body string is strictly required for HMAC signature verification in production/staging. JSON stringification fallback is prohibited.',
      );
    }

    const rawPayload = rawBodyString || JSON.stringify(payload);
    const eventId = payload.eventId || `EVT_${Date.now()}`;

    // 1. Simulator Production Guard
    if (payload.isSimulated) {
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
        throw new ForbiddenException(
          'NBFC Simulator is strictly disabled in production and staging environments.',
        );
      }
    } else {
      // 2. Strict HMAC Verification for External Partner Webhooks
      if (!signature) {
        throw new UnauthorizedException('Missing NBFC webhook signature header (x-nbfc-signature).');
      }

      // 3. Timestamp Replay-Window Validation (Strict ±5 minutes)
      if (!payload.timestamp) {
        throw new UnauthorizedException('Missing required timestamp in webhook payload.');
      }
      const eventTime = new Date(payload.timestamp).getTime();
      if (isNaN(eventTime)) {
        throw new UnauthorizedException('Invalid webhook timestamp format.');
      }
      const now = Date.now();
      const driftMs = Math.abs(now - eventTime);
      if (driftMs > 5 * 60 * 1000) {
        throw new UnauthorizedException('Webhook timestamp outside acceptable replay window (±5 minutes).');
      }

      // Lookup partner secret
      const partner = await this.prisma.nBFCPartner.findFirst({
        where: {
          OR: [
            { code: payload.source || '' },
            { name: payload.source || '' },
          ],
        },
      });

      const secret =
        partner?.webhookSecret ||
        process.env.APEX_NBFC_WEBHOOK_SECRET ||
        'apex_webhook_mock_secret_key_2026';

      const isValid = this.verifyHmacSignature(rawPayload, signature, secret);
      if (!isValid) {
        throw new UnauthorizedException('Invalid NBFC webhook HMAC signature.');
      }
    }

    // 4. Idempotency & Database-Level Event ID Deduplication
    const existingIdempotency = await this.prisma.idempotencyRecord.findUnique({
      where: { key: eventId },
    });
    if (existingIdempotency) {
      return { status: 'IDEMPOTENT_IGNORED', message: 'Webhook already processed' };
    }

    const existingWebhookEvent = await this.prisma.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existingWebhookEvent) {
      return { status: 'IDEMPOTENT_IGNORED', message: 'Webhook event ID already processed' };
    }

    // 5. Persist Webhook Event with unique eventId
    let webhookEvent: any;
    try {
      webhookEvent = await this.prisma.webhookEvent.create({
        data: {
          eventId,
          source: payload.source || 'APEX_CAPITAL',
          eventType: payload.eventType,
          payloadJson: rawPayload,
          signature,
          status: 'PENDING',
        },
      });
    } catch (err: any) {
      // Handle race condition on unique eventId
      if (err.code === 'P2002') {
        return { status: 'IDEMPOTENT_IGNORED', message: 'Duplicate webhook event ID caught by database constraint' };
      }
      throw err;
    }

    try {
      const { applicationId, eventType, data } = payload;
      const app = await this.prisma.loanApplication.findUnique({
        where: { id: applicationId },
        include: { payrollLoanDetails: true, ewaDetails: true, loan: true },
      });

      if (!app) throw new NotFoundException(`Application ${applicationId} not found`);

      let targetStatus: ApplicationStatus;
      if (eventType === 'APPLICATION_APPROVED') {
        targetStatus = ApplicationStatus.APPROVED;
      } else if (eventType === 'APPLICATION_REJECTED') {
        targetStatus = ApplicationStatus.REJECTED;
      } else if (eventType === 'DISBURSEMENT_CONFIRMED') {
        targetStatus = ApplicationStatus.DISBURSED;
      } else {
        throw new BadRequestException(`Unrecognized webhook eventType: ${eventType}`);
      }

      const currentStatus = app.status as ApplicationStatus;
      const currentRank = (APPLICATION_STATE_RANKS as any)[currentStatus] ?? 0;
      const targetRank = (APPLICATION_STATE_RANKS as any)[targetStatus] ?? 0;

      // Duplicate check for terminal/disbursed state
      if (targetStatus === ApplicationStatus.DISBURSED && (currentStatus === ApplicationStatus.DISBURSED || app.loan)) {
        return { status: 'DUPLICATE_IGNORED', message: 'Application is already disbursed.' };
      }

      // Out-of-order check: if current state is already further in the lifecycle than incoming approval/event
      if (currentRank >= targetRank && targetStatus === ApplicationStatus.APPROVED && currentStatus !== targetStatus) {
        return {
          status: 'OUT_OF_ORDER_IGNORED',
          message: `Current application status ${currentStatus} supersedes incoming event ${eventType}. Status was not regressed.`,
        };
      }

      // Explicit finite state machine transition matrix validation
      if (!canTransitionApplication(currentStatus, targetStatus)) {
        return {
          status: 'INVALID_TRANSITION_IGNORED',
          message: `State transition rejected: State machine prohibits transitioning application ${applicationId} from current state ${currentStatus} to ${targetStatus}. Terminal states (REJECTED/CANCELLED/DISBURSED) and illegal forward skips are strictly preserved.`,
        };
      }

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
                remarks: `Approved by ${payload.source || 'NBFC Partner'}. Terms accepted.`,
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

        // Transactional Execution: Loan + Schedules + App update + Webhook event + Idempotency
        await this.prisma.$transaction(async (tx) => {
          const loan = await tx.loan.create({
            data: {
              loanAccountNumber: `LN-${app.productType}-${Date.now().toString().slice(-6)}`,
              applicationId: app.id,
              employeeId: app.employeeId,
              nbfcPartnerId: app.nbfcPartnerId || 'apex-capital-id',
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
            await tx.repaymentSchedule.create({
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

          await tx.loanApplication.update({
            where: { id: applicationId },
            data: {
              status: ApplicationStatus.DISBURSED,
              disbursedAt: disbursedDate,
              statusHistory: {
                create: {
                  fromStatus: app.status,
                  toStatus: ApplicationStatus.DISBURSED,
                  changedByRole: 'NBFC_WEBHOOK',
                  remarks: `Disbursement confirmed by NBFC. External Bank UTR: ${utr}. Funds credited directly to employee salary account.`,
                },
              },
            },
          });

          await tx.webhookEvent.update({
            where: { id: webhookEvent.id },
            data: { status: 'PROCESSED', processedAt: new Date() },
          });

          await tx.idempotencyRecord.create({
            data: {
              key: eventId,
              operationName: `WEBHOOK_${payload.eventType}`,
              responseJson: JSON.stringify({ status: 'SUCCESS', applicationId, loanId: loan.id }),
            },
          });
        });

        return { status: 'PROCESSED', eventId };
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
      if (webhookEvent?.id) {
        await this.prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { status: 'FAILED', errorMessage: err.message },
        });
      }
      throw err;
    }
  }

  /**
   * Interactive Simulator for Dada Admin & Demos:
   * Blocked in production / staging.
   */
  async simulateAction(data: { applicationId: string; action: 'APPROVE' | 'REJECT' | 'DISBURSE'; remarks?: string }) {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
      throw new ForbiddenException(
        'NBFC Simulator is strictly disabled in production and staging environments.',
      );
    }

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
      source: app.nbfcPartner?.code || 'APEX_CAPITAL',
      eventType: eventMap[data.action],
      applicationId: app.id,
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: {
        utrNumber: `MOCK-CMS-${Date.now()}`,
        rejectionReason: data.remarks || 'Simulated rejection by policy rules',
      },
    };

    return this.processWebhook(webhookPayload);
  }
}
