import { NbfcService } from './nbfc.service';
import { PrismaService } from '../../common/prisma.service';
import { ApplicationStatus } from '@dada/contracts';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('NbfcService - Webhook Security, Replay Windows & Idempotency', () => {
  let service: NbfcService;
  let mockPrisma: any;
  const mockSecret = 'test_webhook_secret_key_12345';

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
      idempotencyRecord: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      webhookEvent: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      loanApplication: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      loan: {
        create: jest.fn(),
      },
      repaymentSchedule: {
        create: jest.fn(),
      },
      nBFCPartner: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'nbfc-1',
          code: 'APEX_CAPITAL',
          webhookSecret: mockSecret,
        }),
      },
    };

    service = new NbfcService(mockPrisma as PrismaService);
  });

  it('rejects external webhook when signature is missing', async () => {
    const payload = {
      eventId: 'EVT_NO_SIG',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-1',
      timestamp: new Date().toISOString(),
    };

    await expect(service.processWebhook(payload)).rejects.toThrow(UnauthorizedException);
    await expect(service.processWebhook(payload)).rejects.toThrow('Missing NBFC webhook signature header');
  });

  it('rejects external webhook when timestamp is missing', async () => {
    const payload = {
      eventId: 'EVT_NO_TS',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-1',
    };

    await expect(service.processWebhook(payload, 'some-sig')).rejects.toThrow(UnauthorizedException);
    await expect(service.processWebhook(payload, 'some-sig')).rejects.toThrow('Missing required timestamp');
  });

  it('rejects external webhook when timestamp is outside replay window (> 5 minutes old)', async () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const payload = {
      eventId: 'EVT_OLD_TS',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-1',
      timestamp: tenMinutesAgo,
    };

    await expect(service.processWebhook(payload, 'some-sig')).rejects.toThrow(UnauthorizedException);
    await expect(service.processWebhook(payload, 'some-sig')).rejects.toThrow(
      'Webhook timestamp outside acceptable replay window (±5 minutes)',
    );
  });

  it('rejects external webhook when HMAC signature is invalid or tampered', async () => {
    const payload = {
      eventId: 'EVT_BAD_SIG',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-1',
      timestamp: new Date().toISOString(),
    };

    const invalidSignature = 'deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678';
    await expect(service.processWebhook(payload, invalidSignature)).rejects.toThrow(UnauthorizedException);
    await expect(service.processWebhook(payload, invalidSignature)).rejects.toThrow('Invalid NBFC webhook HMAC signature');
  });

  it('accepts external webhook with valid HMAC-SHA256 signature and timestamp', async () => {
    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'wh-1' });
    mockPrisma.loanApplication.findUnique.mockResolvedValue({
      id: 'app-1',
      status: ApplicationStatus.SENT_TO_NBFC,
      requestedAmountPaise: 5000000,
    });

    const payload = {
      eventId: 'EVT_VALID_SIG',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-1',
      timestamp: new Date().toISOString(),
    };

    const rawPayload = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac('sha256', mockSecret)
      .update(rawPayload)
      .digest('hex');

    const result = await service.processWebhook(payload, validSignature, rawPayload);
    expect(result.status).toBe('PROCESSED');
    expect(mockPrisma.loanApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'app-1' },
        data: expect.objectContaining({
          status: ApplicationStatus.APPROVED,
        }),
      }),
    );
  });

  it('safely ignores out-of-order event and does not regress advanced loan state', async () => {
    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'wh-late' });

    // Application has already progressed to ESIGN_PENDING
    mockPrisma.loanApplication.findUnique.mockResolvedValue({
      id: 'app-advanced',
      status: ApplicationStatus.ESIGN_PENDING,
      requestedAmountPaise: 5000000,
    });

    const payload = {
      eventId: 'EVT_LATE_APPROVED',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-advanced',
      timestamp: new Date().toISOString(),
    };

    const validSignature = crypto
      .createHmac('sha256', mockSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const result = await service.processWebhook(payload, validSignature);
    expect(result.status).toBe('OUT_OF_ORDER_IGNORED');
    expect(result.message).toContain('supersedes incoming event APPLICATION_APPROVED');
    // Ensure application status was NOT regressed to APPROVED!
    expect(mockPrisma.loanApplication.update).not.toHaveBeenCalled();
  });

  it('skips duplicate webhook events based on idempotency key', async () => {
    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue({
      id: 'idem-1',
      key: 'EVT_ALREADY_PROCESSED',
    });

    const payload = {
      eventId: 'EVT_ALREADY_PROCESSED',
      source: 'APEX_CAPITAL',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-1',
      isSimulated: true,
    };

    const result = await service.processWebhook(payload);
    expect(result.status).toBe('IDEMPOTENT_IGNORED');
    expect(mockPrisma.webhookEvent.create).not.toHaveBeenCalled();
    expect(mockPrisma.loanApplication.update).not.toHaveBeenCalled();
  });

  it('prevents duplicate disbursement when loan already exists', async () => {
    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'wh-dup' });
    mockPrisma.loanApplication.findUnique.mockResolvedValue({
      id: 'app-already-disbursed',
      status: ApplicationStatus.DISBURSED,
      loan: { id: 'existing-loan-1' },
    });

    const payload = {
      eventId: 'EVT_DUP_DISBURSE',
      source: 'APEX_CAPITAL',
      eventType: 'DISBURSEMENT_CONFIRMED',
      applicationId: 'app-already-disbursed',
      isSimulated: true,
    };

    const result = await service.processWebhook(payload);
    expect(result.status).toBe('DUPLICATE_IGNORED');
    expect(mockPrisma.loan.create).not.toHaveBeenCalled();
  });

  it('blocks NBFC simulator in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      await expect(
        service.simulateAction({
          applicationId: 'app-1',
          action: 'APPROVE',
        }),
      ).rejects.toThrow(ForbiddenException);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
