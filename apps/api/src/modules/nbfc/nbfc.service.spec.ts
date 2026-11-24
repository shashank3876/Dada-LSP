import { NbfcService } from './nbfc.service';
import { PrismaService } from '../../common/prisma.service';
import { ApplicationStatus } from '@dada/contracts';

describe('NbfcService - Webhook & Idempotency', () => {
  let service: NbfcService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      idempotencyRecord: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      webhookEvent: {
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
    };

    service = new NbfcService(mockPrisma as PrismaService);
  });

  it('skips duplicate webhook events based on idempotency key', async () => {
    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue({
      id: 'idem-1',
      key: 'EVT_ALREADY_PROCESSED',
    });

    const result = await service.processWebhook({
      eventId: 'EVT_ALREADY_PROCESSED',
      eventType: 'APPLICATION_APPROVED',
      applicationId: 'app-1',
    });

    expect(result.status).toBe('IDEMPOTENT_IGNORED');
    expect(mockPrisma.webhookEvent.create).not.toHaveBeenCalled();
    expect(mockPrisma.loanApplication.update).not.toHaveBeenCalled();
  });

  it('processes disbursement webhook by creating loan with external UTR and updating application to DISBURSED', async () => {
    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'wh-1' });
    mockPrisma.loanApplication.findUnique.mockResolvedValue({
      id: 'app-99',
      requestedAmountPaise: 2500000,
      approvedAmountPaise: 2500000,
      productType: 'EWA',
      employeeId: 'emp-1',
      nbfcPartnerId: 'nbfc-1',
      status: ApplicationStatus.APPROVED,
      tenureMonths: 1,
      monthlyEmiPaise: 2500000,
    });
    mockPrisma.loan.create.mockResolvedValue({
      id: 'loan-1',
      principalPaise: 2500000,
      totalRepayablePaise: 2500000,
      monthlyEmiPaise: 2500000,
    });

    const result = await service.processWebhook({
      eventId: 'EVT_DISBURSE_101',
      eventType: 'DISBURSEMENT_CONFIRMED',
      applicationId: 'app-99',
      data: { utrNumber: 'CMS9988776655' },
    });

    expect(result.status).toBe('PROCESSED');
    expect(mockPrisma.loan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          disbursementUtr: 'CMS9988776655',
          productType: 'EWA',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(mockPrisma.loanApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'app-99' },
        data: expect.objectContaining({
          status: ApplicationStatus.DISBURSED,
        }),
      }),
    );
  });
});
