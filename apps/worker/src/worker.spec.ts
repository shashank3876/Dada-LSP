import { OutboxProcessor, computeBackoffDelayMs } from './outbox/outbox-processor';
import { AttendanceSyncJob } from './jobs/attendance-sync.job';
import { PayrollCutoffJob } from './jobs/payroll-cutoff.job';
import { ReconciliationEngine } from './reconciliation/reconciliation-engine';
import { NbfcSettlementService } from './reconciliation/nbfc-settlement';
import { CrashRecoveryService } from './monitoring/crash-recovery';
import {
  OutboxStatus,
  DEFAULT_RETRY_POLICY,
  AllocationWaterfallModel,
} from './types';

describe('Dada Advisory — Background Worker Automated Test Suite (apps/worker)', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      outboxEvent: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      organization: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      employee: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      eligibilitySnapshot: {
        create: jest.fn().mockResolvedValue({ id: 'snapshot-1' }),
      },
      reconciliationException: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'ex-101', ...args.data })),
        count: jest.fn().mockResolvedValue(0),
      },
      reconciliationRecord: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'rec-101', ...args.data })),
      },
      payrollBatch: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      payrollBatchItem: {
        update: jest.fn(),
      },
      employerRemittance: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      loanApplication: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      loan: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      repaymentSchedule: {
        createMany: jest.fn(),
        update: jest.fn(),
      },
      repayment: {
        create: jest.fn(),
      },
      auditEvent: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
  });

  // ---------------------------------------------------------------------------
  // 1. Two workers attempting to process the same outbox event (Race Condition)
  // ---------------------------------------------------------------------------
  describe('1. Concurrency: Two workers claiming the same outbox event', () => {
    it('grants atomic lease to Worker 1 and causes Worker 2 to safely yield', async () => {
      const worker1 = new OutboxProcessor(mockPrisma, DEFAULT_RETRY_POLICY, 'worker-instance-1');
      const worker2 = new OutboxProcessor(mockPrisma, DEFAULT_RETRY_POLICY, 'worker-instance-2');

      const eventId = 'evt-concurrent-1';
      mockPrisma.outboxEvent.findUnique.mockResolvedValue({
        id: eventId,
        status: OutboxStatus.PENDING,
        payloadJson: JSON.stringify({ data: { test: true } }),
      });

      // Worker 1 succeeds in atomic updateMany (count: 1)
      mockPrisma.outboxEvent.updateMany.mockResolvedValueOnce({ count: 1 });
      const claim1 = await worker1.claimEvent(eventId);
      expect(claim1.claimed).toBe(true);
      expect(claim1.wrapper.lockedBy).toBe('worker-instance-1');

      // Worker 2 attempts at the same millisecond; database condition returns count: 0
      mockPrisma.outboxEvent.updateMany.mockResolvedValueOnce({ count: 0 });
      const claim2 = await worker2.claimEvent(eventId);
      expect(claim2.claimed).toBe(false); // Worker 2 is safely blocked from duplicate processing!
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Worker crash after processing starts (Stale Lease Recovery)
  // ---------------------------------------------------------------------------
  describe('2. Worker crash after processing starts (Stale Lease Expiry)', () => {
    it('allows a healthy worker to acquire lease once the crashed worker lease expires', async () => {
      const worker2 = new OutboxProcessor(mockPrisma, DEFAULT_RETRY_POLICY, 'worker-instance-2');
      const eventId = 'evt-crashed-in-flight';

      // Event was locked 10 minutes ago with a 1-minute lease (expired)
      const expiredLease = new Date(Date.now() - 9 * 60 * 1000).toISOString();
      mockPrisma.outboxEvent.findUnique.mockResolvedValue({
        id: eventId,
        status: OutboxStatus.PROCESSING,
        payloadJson: JSON.stringify({
          data: { test: true },
          lockedBy: 'crashed-worker-1',
          leaseExpiresAt: expiredLease,
        }),
      });

      mockPrisma.outboxEvent.updateMany.mockResolvedValueOnce({ count: 1 });

      const claim = await worker2.claimEvent(eventId);
      expect(claim.claimed).toBe(true);
      expect(claim.wrapper.lockedBy).toBe('worker-instance-2');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Worker crash after financial mutation but before marking complete
  // ---------------------------------------------------------------------------
  describe('3. Worker crash after financial mutation (Zero Duplicate Financial Effect)', () => {
    it('bypasses re-executing financial mutation on reboot and directly marks PUBLISHED', async () => {
      const processor = new OutboxProcessor(mockPrisma);
      const eventId = 'evt-crash-after-mutation';

      // Event where financial mutation already succeeded in the database before worker died
      mockPrisma.outboxEvent.findMany.mockResolvedValue([
        {
          id: eventId,
          topic: 'nbfc.loan.submit',
          payloadJson: JSON.stringify({
            data: { applicationId: 'app-99' },
            financialMutationExecuted: true, // Mutation was committed
            lockedBy: 'dead-worker',
            leaseExpiresAt: new Date(Date.now() - 60000).toISOString(),
          }),
          status: OutboxStatus.PENDING,
          retryCount: 0,
        },
      ]);
      mockPrisma.outboxEvent.findUnique.mockResolvedValue({
        id: eventId,
        status: OutboxStatus.PENDING,
        payloadJson: JSON.stringify({
          data: { applicationId: 'app-99' },
          financialMutationExecuted: true,
        }),
      });
      mockPrisma.outboxEvent.updateMany.mockResolvedValue({ count: 1 });

      const res = await processor.processBatch(5);
      expect(res.published).toBe(1);

      // Verifies the event was marked PUBLISHED without throwing or re-executing
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: expect.objectContaining({
          status: OutboxStatus.PUBLISHED,
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Duplicate Payroll Cutoff Execution
  // ---------------------------------------------------------------------------
  describe('4. Duplicate Payroll Cutoff Execution Concurrency', () => {
    it('handles concurrent cutoff generation safely without creating duplicate batches or items', async () => {
      const job = new PayrollCutoffJob(mockPrisma);
      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-1',
          code: 'TECH',
          isActive: true,
          policies: [{ payrollCutoffDay: 25 }],
        },
      ]);

      mockPrisma.loan.findMany.mockResolvedValue([
        {
          id: 'loan-1',
          employeeId: 'emp-1',
          productType: 'EWA',
          outstandingPaise: 2000000,
        },
      ]);

      // Worker 1 creates batch; Worker 2 throws unique constraint violation P2002
      mockPrisma.payrollBatch.findUnique
        .mockResolvedValueOnce(null) // Worker 1 sees no batch initially
        .mockResolvedValueOnce({ id: 'existing-batch-tech', status: 'GENERATED' }); // Worker 2 fetches after P2002

      mockPrisma.payrollBatch.create.mockRejectedValueOnce({ code: 'P2002', message: 'Unique constraint failed' });

      // Worker 2 runs cutoff; catches P2002, does not throw, and locks the batch safely
      const res = await job.processCutoffBatches(25, 11, 2026);
      expect(res.batchesCreated).toBe(0);
      expect(res.batchesLocked).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Duplicate Remittance Processing
  // ---------------------------------------------------------------------------
  describe('5. Duplicate Remittance Processing Defense', () => {
    it('blocks double-crediting when identical UTR is replayed', async () => {
      const engine = new ReconciliationEngine(mockPrisma);
      mockPrisma.employerRemittance.findUnique.mockResolvedValue({
        id: 'remit-replay',
        utrNumber: 'CMS_REPLAYED_UTR',
        remittedAmountPaise: 4000000,
        payrollBatch: {
          id: 'batch-1',
          totalDuePaise: 4000000,
          items: [],
        },
      });

      // Database already has a MATCHED remittance with this exact UTR
      mockPrisma.employerRemittance.findFirst.mockResolvedValue({
        id: 'remit-original',
        utrNumber: 'CMS_REPLAYED_UTR',
        status: 'MATCHED',
      });

      const res = await engine.reconcileRemittance('remit-replay');
      expect(res.status).toBe('RECONCILED_WITH_EXCEPTIONS');
      expect(res.exceptionCount).toBe(1);

      // Verify DUPLICATE_REMITTANCE exception recorded and remittance flagged MISMATCH
      expect(mockPrisma.reconciliationException.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          exceptionType: 'DUPLICATE_REMITTANCE',
          actualPaise: 4000000,
        }),
      });
      expect(mockPrisma.employerRemittance.update).toHaveBeenCalledWith({
        where: { id: 'remit-replay' },
        data: expect.objectContaining({ status: 'MISMATCH' }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Retry Exhaustion and Dead-Letter Transition
  // ---------------------------------------------------------------------------
  describe('6. Retry Exhaustion and Dead-Letter Queue (DLQ)', () => {
    it('transitions outbox event to DEAD_LETTER when retryCount reaches maxRetries', async () => {
      const processor = new OutboxProcessor(mockPrisma, { ...DEFAULT_RETRY_POLICY, maxRetries: 4 });
      const eventId = 'evt-retry-exhaust';

      mockPrisma.outboxEvent.findMany.mockResolvedValue([
        {
          id: eventId,
          topic: 'nbfc.loan.submit',
          payloadJson: JSON.stringify({ data: { shouldSimulateFailure: true } }),
          status: OutboxStatus.FAILED,
          retryCount: 3, // Next will be 4 (equals maxRetries)
        },
      ]);
      mockPrisma.outboxEvent.findUnique.mockResolvedValue({
        id: eventId,
        status: OutboxStatus.FAILED,
        payloadJson: JSON.stringify({ data: { shouldSimulateFailure: true } }),
      });
      mockPrisma.outboxEvent.updateMany.mockResolvedValue({ count: 1 });

      const res = await processor.processBatch(5);
      expect(res.deadLettered).toBe(1);

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: expect.objectContaining({
          status: OutboxStatus.DEAD_LETTER,
          retryCount: 4,
        }),
      });

      // Verify audit event alert created
      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'OUTBOX_DEAD_LETTER_EXHAUSTED',
          resourceId: eventId,
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Recovery of Stranded Jobs Without Duplicate Financial Effects
  // ---------------------------------------------------------------------------
  describe('7. Crash Recovery Service Lease & Idempotency Inspection', () => {
    it('marks completed stranded jobs as PUBLISHED and resets uncommitted jobs to PENDING', async () => {
      const recovery = new CrashRecoveryService(mockPrisma);

      mockPrisma.outboxEvent.findMany.mockResolvedValue([
        {
          id: 'job-stranger-done',
          status: OutboxStatus.PROCESSING,
          payloadJson: JSON.stringify({
            financialMutationExecuted: true,
            leaseExpiresAt: new Date(Date.now() - 60000).toISOString(),
          }),
        },
        {
          id: 'job-stranger-uncommitted',
          status: OutboxStatus.PROCESSING,
          retryCount: 1,
          payloadJson: JSON.stringify({
            financialMutationExecuted: false,
            leaseExpiresAt: new Date(Date.now() - 60000).toISOString(),
          }),
        },
      ]);

      const res = await recovery.recoverCrashedJobs(1);
      expect(res.alreadyCompletedEvents).toBe(1); // Job with mutation marked PUBLISHED
      expect(res.recoveredOutboxEvents).toBe(1); // Job without mutation reset to PENDING

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'job-stranger-done' },
        data: expect.objectContaining({ status: OutboxStatus.PUBLISHED }),
      });
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'job-stranger-uncommitted' },
        data: expect.objectContaining({ status: OutboxStatus.PENDING, retryCount: 2 }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Transactional Outbox Atomicity
  // ---------------------------------------------------------------------------
  describe('8. Transactional Outbox Atomicity Proof', () => {
    it('commits batch and outbox event together in the same transaction', async () => {
      const job = new PayrollCutoffJob(mockPrisma);
      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-atom',
          code: 'ATOM',
          isActive: true,
          policies: [{ payrollCutoffDay: 20 }],
        },
      ]);

      mockPrisma.payrollBatch.findUnique.mockResolvedValue(null);
      mockPrisma.loan.findMany.mockResolvedValue([
        {
          id: 'loan-atom-1',
          employeeId: 'emp-1',
          productType: 'EWA',
          outstandingPaise: 1000000,
        },
      ]);

      mockPrisma.payrollBatch.create.mockResolvedValue({ id: 'batch-atom-1', status: 'GENERATED' });
      mockPrisma.outboxEvent.create.mockResolvedValue({ id: 'outbox-atom-1' });

      await job.processCutoffBatches(20, 11, 2026);

      // Verify that both payrollBatch.create and outboxEvent.create were called within transaction
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.payrollBatch.create).toHaveBeenCalled();
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          topic: 'payroll.batch.generated',
          status: 'PENDING',
        }),
      });
    });

    it('rolls back batch creation if outbox event insertion fails', async () => {
      const job = new PayrollCutoffJob(mockPrisma);
      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-atom-fail',
          code: 'FAIL',
          isActive: true,
          policies: [{ payrollCutoffDay: 20 }],
        },
      ]);
      mockPrisma.payrollBatch.findUnique.mockResolvedValue(null);
      mockPrisma.loan.findMany.mockResolvedValue([
        {
          id: 'loan-1',
          employeeId: 'emp-1',
          productType: 'EWA',
          outstandingPaise: 1000000,
        },
      ]);

      // Simulate failure on outbox event creation inside transaction
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const txMock = {
          payrollBatch: { create: jest.fn().mockResolvedValue({ id: 'batch-temp' }) },
          outboxEvent: { create: jest.fn().mockRejectedValue(new Error('Outbox disk full')) },
        };
        return cb(txMock);
      });

      await expect(job.processCutoffBatches(20, 11, 2026)).rejects.toThrow('Outbox disk full');
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Remittance Allocation Waterfall: Pro-Rata & Seniority
  // ---------------------------------------------------------------------------
  describe('9. NBFC-Approved Remittance Allocation Waterfall Models', () => {
    it('allocates partial remittance proportionally under PRO_RATA_EQUAL model', async () => {
      const engine = new ReconciliationEngine(mockPrisma, {
        model: AllocationWaterfallModel.PRO_RATA_EQUAL,
        disclaimer: 'Provisional SLA',
      });

      mockPrisma.employerRemittance.findUnique.mockResolvedValue({
        id: 'remit-prorata',
        utrNumber: 'CMS_PRORATA_1',
        remittedAmountPaise: 4000000, // Rs 40,000 (80% of Rs 50,000 due)
        payrollBatch: {
          id: 'batch-1',
          totalDuePaise: 5000000,
          items: [
            { id: 'item-1', dueAmountPaise: 3000000, employee: { employeeCode: 'EMP-1' } }, // Expect 80% = 2,400,000
            { id: 'item-2', dueAmountPaise: 2000000, employee: { employeeCode: 'EMP-2' } }, // Expect 80% = 1,600,000
          ],
        },
      });
      mockPrisma.employerRemittance.findFirst.mockResolvedValue(null);

      const res = await engine.reconcileRemittance('remit-prorata');
      expect(res.status).toBe('RECONCILED_WITH_EXCEPTIONS');
      expect(res.exceptionCount).toBe(2);

      // Verify item 1 received 2,400,000 paise (Rs 24,000)
      expect(mockPrisma.payrollBatchItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: expect.objectContaining({
          deductedAmountPaise: 2400000,
          status: 'PARTIAL',
        }),
      });

      // Verify item 2 received 1,600,000 paise (Rs 16,000)
      expect(mockPrisma.payrollBatchItem.update).toHaveBeenCalledWith({
        where: { id: 'item-2' },
        data: expect.objectContaining({
          deductedAmountPaise: 1600000,
          status: 'PARTIAL',
        }),
      });
    });

    it('allocates partial remittance under SENIORITY_EWA_FIRST model', async () => {
      const engine = new ReconciliationEngine(mockPrisma, {
        model: AllocationWaterfallModel.SENIORITY_EWA_FIRST,
        disclaimer: 'Provisional SLA',
      });

      mockPrisma.employerRemittance.findUnique.mockResolvedValue({
        id: 'remit-senior',
        utrNumber: 'CMS_SENIOR_1',
        remittedAmountPaise: 3000000, // Rs 30,000
        payrollBatch: {
          id: 'batch-1',
          totalDuePaise: 5000000,
          items: [
            { id: 'item-pl', productType: 'PAYROLL_LOAN', dueAmountPaise: 2500000, employee: { employeeCode: 'EMP-PL' } },
            { id: 'item-ewa', productType: 'EWA', dueAmountPaise: 2500000, employee: { employeeCode: 'EMP-EWA' } },
          ],
        },
      });
      mockPrisma.employerRemittance.findFirst.mockResolvedValue(null);

      const res = await engine.reconcileRemittance('remit-senior');
      expect(res.status).toBe('RECONCILED_WITH_EXCEPTIONS');

      // Seniority: EWA bullet due gets fully satisfied first (2,500,000 paise)
      expect(mockPrisma.payrollBatchItem.update).toHaveBeenCalledWith({
        where: { id: 'item-ewa' },
        data: expect.objectContaining({
          deductedAmountPaise: 2500000,
          status: 'DEDUCTED',
        }),
      });

      // Term Loan receives remaining 500,000 paise
      expect(mockPrisma.payrollBatchItem.update).toHaveBeenCalledWith({
        where: { id: 'item-pl' },
        data: expect.objectContaining({
          deductedAmountPaise: 500000,
          status: 'PARTIAL',
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Attendance Sync vs Payroll Cutoff Race Condition
  // ---------------------------------------------------------------------------
  describe('10. Attendance Sync vs Payroll Cutoff Cycle Freeze', () => {
    it('freezes EWA limit to 0 when payroll cycle is already exported/locked', async () => {
      const job = new AttendanceSyncJob(mockPrisma);
      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-freeze-1',
          isActive: true,
          policies: [{ maxEwaPercentage: 50 }],
          employees: [
            {
              id: 'emp-late-attendance',
              salaryRecords: [{ month: 11, year: 2026, monthlyNetPaise: 5000000 }],
              attendanceRecords: [{ month: 11, year: 2026, totalApprovedWorkedDays: 25 }],
              loans: [],
            },
          ],
        },
      ]);

      // Cycle already exported by payroll cutoff
      mockPrisma.payrollBatch.findUnique.mockResolvedValue({
        id: 'batch-locked',
        status: 'EXPORTED',
      });

      const res = await job.runSyncAndRecalculate(11, 2026);
      expect(res.employeesRecalculated).toBe(1);

      // Eligibility snapshot sets available limit strictly to 0
      expect(mockPrisma.eligibilitySnapshot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          availableLimitPaise: 0,
          isEligible: false,
          ineligibilityReason: expect.stringContaining('Payroll cycle is locked following cutoff'),
        }),
      });
    });
  });
});
