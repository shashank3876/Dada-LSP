import { OutboxProcessor, computeBackoffDelayMs } from '../../../worker/src/outbox/outbox-processor';
import { AttendanceSyncJob } from '../../../worker/src/jobs/attendance-sync.job';
import { PayrollCutoffJob } from '../../../worker/src/jobs/payroll-cutoff.job';
import { ReconciliationEngine } from '../../../worker/src/reconciliation/reconciliation-engine';
import { NbfcSettlementService } from '../../../worker/src/reconciliation/nbfc-settlement';
import { CrashRecoveryService } from '../../../worker/src/monitoring/crash-recovery';
import { OutboxStatus, DEFAULT_RETRY_POLICY, AllocationWaterfallModel } from '../../../worker/src/types';
import { DistributedRateLimiter, MemoryRateLimiterStore, RedisRateLimiterStore } from '../common/rate-limiter';

describe('Checkpoint 4 — Production Hardening & Background Processing Test Suite', () => {
  let mockPrisma: any;
  let outboxStore: any[] = [];

  beforeEach(() => {
    outboxStore = [];
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      outboxEvent: {
        findMany: jest.fn().mockImplementation(() => Promise.resolve(outboxStore)),
        findUnique: jest.fn().mockImplementation((args) =>
          Promise.resolve(outboxStore.find((e) => e.id === args.where.id) || null),
        ),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
  // 1. Transactional Outbox & Exponential Backoff & Dead-Letter Handling
  // ---------------------------------------------------------------------------
  describe('1. Transactional Outbox, Exponential Backoff & Dead-Letter Queue', () => {
    it('computes exponential backoff with ceiling and jitter correctly', () => {
      const delay0 = computeBackoffDelayMs(0, { ...DEFAULT_RETRY_POLICY, jitter: false });
      const delay1 = computeBackoffDelayMs(1, { ...DEFAULT_RETRY_POLICY, jitter: false });
      const delay2 = computeBackoffDelayMs(2, { ...DEFAULT_RETRY_POLICY, jitter: false });
      const delay3 = computeBackoffDelayMs(3, { ...DEFAULT_RETRY_POLICY, jitter: false });

      expect(delay0).toBe(1000); // 1s
      expect(delay1).toBe(2000); // 2s
      expect(delay2).toBe(4000); // 4s
      expect(delay3).toBe(8000); // 8s

      // Verify ceiling
      const delay15 = computeBackoffDelayMs(15, { ...DEFAULT_RETRY_POLICY, jitter: false });
      expect(delay15).toBe(DEFAULT_RETRY_POLICY.maxDelayMs); // 300s max
    });

    it('processes pending outbox event and marks as PUBLISHED on successful dispatch', async () => {
      const processor = new OutboxProcessor(mockPrisma);
      outboxStore = [
        {
          id: 'evt-outbox-1',
          topic: 'nbfc.loan.submit',
          payloadJson: JSON.stringify({ data: { applicationId: 'app-101' } }),
          status: OutboxStatus.PENDING,
          retryCount: 0,
        },
      ];
      mockPrisma.outboxEvent.findMany.mockResolvedValue(outboxStore);

      const res = await processor.processBatch(10);
      expect(res.published).toBe(1);
      expect(res.deadLettered).toBe(0);

      // Verify lock then published update
      expect(mockPrisma.outboxEvent.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ id: 'evt-outbox-1' }),
        data: expect.objectContaining({ status: OutboxStatus.PROCESSING }),
      });
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-outbox-1' },
        data: expect.objectContaining({
          status: OutboxStatus.PUBLISHED,
        }),
      });
    });

    it('applies exponential backoff and increments retry count on transient downstream failure', async () => {
      const processor = new OutboxProcessor(mockPrisma);
      outboxStore = [
        {
          id: 'evt-outbox-fail',
          topic: 'nbfc.loan.submit',
          payloadJson: JSON.stringify({ data: { shouldSimulateFailure: true } }),
          status: OutboxStatus.PENDING,
          retryCount: 1,
        },
      ];
      mockPrisma.outboxEvent.findMany.mockResolvedValue(outboxStore);

      const res = await processor.processBatch(10);
      expect(res.failed).toBe(1);
      expect(res.published).toBe(0);

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-outbox-fail' },
        data: expect.objectContaining({
          status: OutboxStatus.FAILED,
          retryCount: 2,
        }),
      });
    });

    it('transitions to DEAD_LETTER after maxRetries is reached', async () => {
      const processor = new OutboxProcessor(mockPrisma, { ...DEFAULT_RETRY_POLICY, maxRetries: 3 });
      outboxStore = [
        {
          id: 'evt-outbox-exhausted',
          topic: 'nbfc.loan.submit',
          payloadJson: JSON.stringify({ data: { shouldSimulateFailure: true } }),
          status: OutboxStatus.FAILED,
          retryCount: 2, // Next retry will be 3 (equals maxRetries)
        },
      ];
      mockPrisma.outboxEvent.findMany.mockResolvedValue(outboxStore);

      const res = await processor.processBatch(10);
      expect(res.deadLettered).toBe(1);

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-outbox-exhausted' },
        data: expect.objectContaining({
          status: OutboxStatus.DEAD_LETTER,
          retryCount: 3,
        }),
      });

      // Verifies dead letter event logged in audit ledger
      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'OUTBOX_DEAD_LETTER_EXHAUSTED',
            resourceId: 'evt-outbox-exhausted',
          }),
        }),
      );
    });

    it('allows manual recovery of dead-lettered outbox event back to PENDING', async () => {
      const processor = new OutboxProcessor(mockPrisma);
      mockPrisma.outboxEvent.findUnique.mockResolvedValue({
        id: 'evt-dl-1',
        status: OutboxStatus.DEAD_LETTER,
        payloadJson: JSON.stringify({ data: { test: true }, deadLetterReason: 'Error' }),
      });

      const recovered = await processor.reprocessDeadLetterEvent('evt-dl-1');
      expect(recovered).toBe(true);
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-dl-1' },
        data: expect.objectContaining({
          status: OutboxStatus.PENDING,
          retryCount: 0,
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Attendance Sync & Downward Revision (Loan Immutability Non-Negotiable)
  // ---------------------------------------------------------------------------
  describe('2. Attendance Synchronization & Statutory Loan Immutability', () => {
    it('recalculates EWA eligibility correctly based on approved days worked', async () => {
      const job = new AttendanceSyncJob(mockPrisma);
      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-1',
          isActive: true,
          policies: [{ maxEwaPercentage: 50, minEwaWithdrawalPaise: 100000, maxEwaWithdrawalPaise: 5000000 }],
          employees: [
            {
              id: 'emp-1',
              employeeCode: 'EMP-01',
              employmentStatus: 'CONFIRMED',
              salaryRecords: [{ month: 11, year: 2026, monthlyNetPaise: 6000000 }], // 60,000 net
              attendanceRecords: [{ month: 11, year: 2026, totalPayableDays: 30, totalApprovedWorkedDays: 20 }], // 20 days
              loans: [], // No existing withdrawals
            },
          ],
        },
      ]);

      const res = await job.runSyncAndRecalculate(11, 2026);
      expect(res.employeesRecalculated).toBe(1);
      expect(res.overdrawExceptionsFlagged).toBe(0);

      // Earned: (60,000 / 30) * 20 = 40,000. Cap 50% = 20,000 (2,000,000 paise)
      expect(mockPrisma.eligibilitySnapshot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          employeeId: 'emp-1',
          calculatedEligiblePaise: 2000000,
          availableLimitPaise: 2000000,
          isEligible: true,
        }),
      });
    });

    it('NEVER mutates an already-disbursed loan when attendance is revised downwards; flags ATTENDANCE_CORRECTION_OVERDRAW exception', async () => {
      const job = new AttendanceSyncJob(mockPrisma);
      // Existing active loan of ₹25,000 (2,500,000 paise)
      const existingLoan = {
        id: 'loan-disbursed-fixed',
        principalPaise: 2500000,
        status: 'ACTIVE',
        productType: 'EWA',
      };

      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-1',
          isActive: true,
          policies: [{ maxEwaPercentage: 50, minEwaWithdrawalPaise: 100000, maxEwaWithdrawalPaise: 5000000 }],
          employees: [
            {
              id: 'emp-overdrawn',
              employeeCode: 'EMP-OVERDRAW',
              employmentStatus: 'CONFIRMED',
              salaryRecords: [{ month: 11, year: 2026, monthlyNetPaise: 6000000 }],
              // Attendance corrected downward from 25 days to 10 days
              attendanceRecords: [{ month: 11, year: 2026, totalPayableDays: 30, totalApprovedWorkedDays: 10 }],
              loans: [existingLoan],
            },
          ],
        },
      ]);

      const res = await job.runSyncAndRecalculate(11, 2026);
      expect(res.employeesRecalculated).toBe(1);
      expect(res.overdrawExceptionsFlagged).toBe(1);

      // Earned: (60000 / 30) * 10 = 20,000. 50% = 10,000 (1,000,000 paise)
      // Already withdrawn = 2,500,000 paise. Overdraw = 1,500,000 paise (Rs 15,000)

      // CRITICAL CHECK: loan.update was NEVER called to mutate loan principal!
      expect(mockPrisma.loan.update).not.toHaveBeenCalled();

      // Overdraw exception flagged for payroll recovery
      expect(mockPrisma.reconciliationException.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          exceptionType: 'ATTENDANCE_CORRECTION_OVERDRAW',
          expectedPaise: 1000000,
          actualPaise: 2500000,
          status: 'OPEN',
          resolutionNotes: expect.stringContaining('Disbursed loans remain immutable; difference queued for payroll deduction recovery'),
        }),
      });

      // Available limit is strictly 0
      expect(mockPrisma.eligibilitySnapshot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          employeeId: 'emp-overdrawn',
          availableLimitPaise: 0,
          isEligible: false,
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Payroll Batch Automation & Cycle Locking
  // ---------------------------------------------------------------------------
  describe('3. Automated Payroll Batch Generation & Cycle Locking', () => {
    it('automatically compiles active loans and locks batch when cutoff date is reached', async () => {
      const job = new PayrollCutoffJob(mockPrisma);
      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-1',
          code: 'TC',
          isActive: true,
          policies: [{ payrollCutoffDay: 25 }],
        },
      ]);

      mockPrisma.payrollBatch.findUnique.mockResolvedValue(null); // No existing batch
      mockPrisma.loan.findMany.mockResolvedValue([
        {
          id: 'loan-ewa-1',
          employeeId: 'emp-1',
          productType: 'EWA',
          outstandingPaise: 1500000, // 15,000 due
        },
        {
          id: 'loan-pl-1',
          employeeId: 'emp-2',
          productType: 'PAYROLL_LOAN',
          monthlyEmiPaise: 850000, // 8,500 EMI
          repaymentSchedules: [{ totalDuePaise: 850000, status: 'PENDING' }],
        },
      ]);

      mockPrisma.payrollBatch.create.mockResolvedValue({
        id: 'batch-created-1',
        status: 'GENERATED',
      });

      // Day 25: Cutoff day
      const res = await job.processCutoffBatches(25, 11, 2026);
      expect(res.batchesCreated).toBe(1);
      expect(res.batchesLocked).toBe(1);
      expect(res.totalDeductionsCompiledPaise).toBe(2350000); // 15,000 + 8,500 = 23,500 (2,350,000 paise)

      expect(mockPrisma.payrollBatch.update).toHaveBeenCalledWith({
        where: { id: 'batch-created-1' },
        data: expect.objectContaining({
          status: 'EXPORTED',
        }),
      });
    });

    it('enforces idempotency and skips duplicate batch creation for already generated cycle', async () => {
      const job = new PayrollCutoffJob(mockPrisma);
      mockPrisma.organization.findMany.mockResolvedValue([
        {
          id: 'org-1',
          code: 'TC',
          isActive: true,
          policies: [{ payrollCutoffDay: 25 }],
        },
      ]);

      mockPrisma.payrollBatch.findUnique.mockResolvedValue({
        id: 'batch-already-exported',
        status: 'EXPORTED',
      });

      const res = await job.processCutoffBatches(26, 11, 2026);
      expect(res.batchesCreated).toBe(0);
      expect(mockPrisma.payrollBatch.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Remittance Reconciliation: Exact, Partial, Over, and Duplicate Matching
  // ---------------------------------------------------------------------------
  describe('4. Remittance Ingestion, Matching & Exception Scenarios', () => {
    it('fully reconciles batch on EXACT remittance match (0 exceptions)', async () => {
      const engine = new ReconciliationEngine(mockPrisma);
      mockPrisma.employerRemittance.findUnique.mockResolvedValue({
        id: 'remit-exact',
        utrNumber: 'CMS_EXACT_9999',
        remittedAmountPaise: 5000000, // Rs 50,000
        status: 'PENDING_VERIFICATION',
        payrollBatch: {
          id: 'batch-1',
          batchNumber: 'PB-TC-202611-001',
          totalDuePaise: 5000000,
          items: [
            { id: 'item-1', dueAmountPaise: 3000000 },
            { id: 'item-2', dueAmountPaise: 2000000 },
          ],
        },
      });
      mockPrisma.employerRemittance.findFirst.mockResolvedValue(null); // No duplicate UTR

      const res = await engine.reconcileRemittance('remit-exact');
      expect(res.status).toBe('RECONCILED');
      expect(res.matchedCount).toBe(2);
      expect(res.exceptionCount).toBe(0);
      expect(res.variancePaise).toBe(0);

      expect(mockPrisma.employerRemittance.update).toHaveBeenCalledWith({
        where: { id: 'remit-exact' },
        data: expect.objectContaining({ status: 'MATCHED' }),
      });
      expect(mockPrisma.payrollBatch.update).toHaveBeenCalledWith({
        where: { id: 'batch-1' },
        data: expect.objectContaining({ status: 'RECONCILED' }),
      });
    });

    it('allocates funds sequentially and flags PARTIAL_DEDUCTION exception on under-remittance shortfall', async () => {
      const engine = new ReconciliationEngine(mockPrisma, {
        model: AllocationWaterfallModel.SENIORITY_EWA_FIRST,
        disclaimer: 'Provisional SLA',
      });
      mockPrisma.employerRemittance.findUnique.mockResolvedValue({
        id: 'remit-under',
        utrNumber: 'CMS_UNDER_1111',
        remittedAmountPaise: 3500000, // Rs 35,000 remitted against 50,000 expected (15,000 shortfall)
        status: 'PENDING_VERIFICATION',
        payrollBatch: {
          id: 'batch-1',
          totalDuePaise: 5000000,
          items: [
            { id: 'item-1', dueAmountPaise: 3000000, employee: { employeeCode: 'EMP-1' } },
            { id: 'item-2', dueAmountPaise: 2000000, employee: { employeeCode: 'EMP-2' } },
          ],
        },
      });
      mockPrisma.employerRemittance.findFirst.mockResolvedValue(null);

      const res = await engine.reconcileRemittance('remit-under');
      expect(res.status).toBe('RECONCILED_WITH_EXCEPTIONS');
      expect(res.matchedCount).toBe(1); // Item 1 fully matched
      expect(res.exceptionCount).toBe(1); // Item 2 partial (5,000 allocated, 15,000 shortfall)
      expect(res.variancePaise).toBe(-1500000);

      // Verify partial status on senior waterfall allocation
      expect(mockPrisma.payrollBatchItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: expect.objectContaining({
          status: 'PARTIAL',
          deductedAmountPaise: 1500000,
        }),
      });

      // Verify exception created
      expect(mockPrisma.reconciliationException.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          exceptionType: 'PARTIAL_DEDUCTION',
          expectedPaise: 3000000,
          actualPaise: 1500000,
          status: 'OPEN',
        }),
      });
    });

    it('flags DUPLICATE_REMITTANCE exception and blocks double-crediting when UTR is already used', async () => {
      const engine = new ReconciliationEngine(mockPrisma);
      mockPrisma.employerRemittance.findUnique.mockResolvedValue({
        id: 'remit-duplicate',
        utrNumber: 'CMS_ALREADY_USED_UTR',
        remittedAmountPaise: 5000000,
        payrollBatch: {
          id: 'batch-1',
          totalDuePaise: 5000000,
          items: [],
        },
      });

      // Duplicate match found in database
      mockPrisma.employerRemittance.findFirst.mockResolvedValue({
        id: 'previous-matched-remittance-id',
        utrNumber: 'CMS_ALREADY_USED_UTR',
        status: 'MATCHED',
      });

      const res = await engine.reconcileRemittance('remit-duplicate');
      expect(res.status).toBe('RECONCILED_WITH_EXCEPTIONS');
      expect(res.matchedCount).toBe(0);
      expect(res.exceptionCount).toBe(1);

      expect(mockPrisma.reconciliationException.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          exceptionType: 'DUPLICATE_REMITTANCE',
          actualPaise: 5000000,
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 5. NBFC Disbursement and Repayment Settlement
  // ---------------------------------------------------------------------------
  describe('5. NBFC Disbursement & Repayment Settlement Reconciliation', () => {
    it('creates active loan and repayment schedule on bank disbursement confirmation', async () => {
      const service = new NbfcSettlementService(mockPrisma);
      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-disburse-1',
        applicationNumber: 'DADA-PL-2026-900',
        employeeId: 'emp-900',
        organizationId: 'org-1',
        productType: 'PAYROLL_LOAN',
        approvedAmountPaise: 5000000, // 50,000
        tenureMonths: 12,
        interestRatePercent: 14.5,
        monthlyEmiPaise: 450000,
        loan: null,
      });

      mockPrisma.loan.create.mockResolvedValue({
        id: 'loan-created-900',
        principalPaise: 5000000,
      });

      const res = await service.confirmDisbursement('app-disburse-1', 'BANK_UTR_90001', 'apex-nbfc-id');
      expect(res.success).toBe(true);
      expect(res.isDuplicate).toBe(false);

      expect(mockPrisma.loan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          loanAccountNumber: 'LN-PL-2026-900',
          disbursementUtr: 'BANK_UTR_90001',
          status: 'ACTIVE',
        }),
      });

      expect(mockPrisma.repaymentSchedule.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            installmentNumber: 1,
            totalDuePaise: 450000,
            status: 'PENDING',
          }),
        ]),
      });
    });

    it('is idempotent and rejects duplicate disbursement for already disbursed application', async () => {
      const service = new NbfcSettlementService(mockPrisma);
      mockPrisma.loanApplication.findUnique.mockResolvedValue({
        id: 'app-already-disbursed',
        loan: { id: 'existing-loan-id' },
      });

      const res = await service.confirmDisbursement('app-already-disbursed', 'BANK_UTR_DUPLICATE', 'apex-nbfc-id');
      expect(res.success).toBe(true);
      expect(res.isDuplicate).toBe(true);
      expect(mockPrisma.loan.create).not.toHaveBeenCalled();
    });

    it('settles repayment, updates schedule installments, and closes loan upon full repayment', async () => {
      const service = new NbfcSettlementService(mockPrisma);
      mockPrisma.loan.findUnique.mockResolvedValue({
        id: 'loan-closing-1',
        employeeId: 'emp-1',
        totalRepayablePaise: 1000000, // 10,000 total repayable
        totalPaidPaise: 500000, // 5,000 already paid
        outstandingPaise: 500000,
        repaymentSchedules: [
          {
            id: 'schedule-final',
            installmentNumber: 2,
            totalDuePaise: 500000,
            paidPaise: 0,
            status: 'PENDING',
          },
        ],
      });

      mockPrisma.repayment.create.mockResolvedValue({ id: 'repay-final-id' });

      // Remit remaining 5,000 (500,000 paise)
      const res = await service.confirmRepayment('loan-closing-1', 500000, 'CMS_SETTLE_PAYOFF');
      expect(res.newOutstandingPaise).toBe(0);
      expect(res.isLoanClosed).toBe(true);

      // Verify loan closed
      expect(mockPrisma.loan.update).toHaveBeenCalledWith({
        where: { id: 'loan-closing-1' },
        data: expect.objectContaining({
          totalPaidPaise: 1000000,
          outstandingPaise: 0,
          status: 'CLOSED',
        }),
      });

      // Verify schedule marked PAID
      expect(mockPrisma.repaymentSchedule.update).toHaveBeenCalledWith({
        where: { id: 'schedule-final' },
        data: expect.objectContaining({
          paidPaise: 500000,
          status: 'PAID',
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Worker Crash Recovery and Operational Health
  // ---------------------------------------------------------------------------
  describe('6. Worker Crash Recovery & Operational Monitoring', () => {
    it('recovers stuck PROCESSING outbox events on worker reboot and resets them to PENDING', async () => {
      const recovery = new CrashRecoveryService(mockPrisma);
      mockPrisma.outboxEvent.findMany.mockResolvedValue([
        {
          id: 'evt-crashed-1',
          status: OutboxStatus.PROCESSING,
          retryCount: 0,
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          payloadJson: JSON.stringify({ financialMutationExecuted: false }),
        },
        {
          id: 'evt-crashed-2',
          status: OutboxStatus.PROCESSING,
          retryCount: 1,
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          payloadJson: JSON.stringify({ financialMutationExecuted: false }),
        },
      ]);

      const res = await recovery.recoverCrashedJobs(5);
      expect(res.recoveredOutboxEvents).toBe(2);

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-crashed-1' },
        data: expect.objectContaining({ status: OutboxStatus.PENDING, retryCount: 1 }),
      });
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-crashed-2' },
        data: expect.objectContaining({ status: OutboxStatus.PENDING, retryCount: 2 }),
      });
    });

    it('generates operational health report reflecting system status', async () => {
      const recovery = new CrashRecoveryService(mockPrisma);
      mockPrisma.outboxEvent.count
        .mockResolvedValueOnce(4) // 4 pending outbox
        .mockResolvedValueOnce(0); // 0 dead letter
      mockPrisma.reconciliationException.count.mockResolvedValueOnce(1); // 1 open exception

      const report = await recovery.getHealthReport(Date.now() - 120000, ['outbox-job', 'attendance-job']);
      expect(report.status).toBe('HEALTHY');
      expect(report.uptimeSeconds).toBeGreaterThanOrEqual(120);
      expect(report.pendingOutboxCount).toBe(4);
      expect(report.deadLetterCount).toBe(0);
      expect(report.openExceptionsCount).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Distributed Rate Limiter: Corporate NAT IP & Account Limit Testing
  // ---------------------------------------------------------------------------
  describe('7. Distributed Rate Limiting & Corporate NAT Egress Allowance', () => {
    beforeEach(async () => {
      DistributedRateLimiter.setStore(new MemoryRateLimiterStore());
      await DistributedRateLimiter.clear();
    });

    it('enforces strict account-level limit (5 failed attempts / 60s) for a single user', async () => {
      const account = 'target.user@techcorp.in';
      const ip = '103.21.244.10';

      for (let i = 0; i < 5; i++) {
        const res = await DistributedRateLimiter.consumeDualTier(account, ip, 5, 120, 60000);
        expect(res.allowed).toBe(true);
      }

      // 6th attempt on the same account MUST be blocked
      const blockedRes = await DistributedRateLimiter.consumeDualTier(account, ip, 5, 120, 60000);
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.tier).toBe('ACCOUNT');
      expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('does NOT block other legitimate users sharing the same corporate NAT egress IP', async () => {
      const corporateSharedIp = '103.21.244.10'; // Single NAT IP for 500 office employees
      const userA = 'user.a@techcorp.in';
      const userB = 'user.b@techcorp.in';
      const userC = 'user.c@techcorp.in';

      // User A hits their account limit
      for (let i = 0; i < 5; i++) {
        await DistributedRateLimiter.consumeDualTier(userA, corporateSharedIp, 5, 120, 60000);
      }
      const userABlocked = await DistributedRateLimiter.consumeDualTier(userA, corporateSharedIp, 5, 120, 60000);
      expect(userABlocked.allowed).toBe(false);
      expect(userABlocked.tier).toBe('ACCOUNT');

      // User B and User C from the exact same corporate IP must NOT be blocked!
      const userBCheck = await DistributedRateLimiter.consumeDualTier(userB, corporateSharedIp, 5, 120, 60000);
      expect(userBCheck.allowed).toBe(true);

      const userCCheck = await DistributedRateLimiter.consumeDualTier(userC, corporateSharedIp, 5, 120, 60000);
      expect(userCCheck.allowed).toBe(true);
    });

    it('seamlessly falls back to local memory store when Redis client is disconnected or absent in dev/test', async () => {
      const redisStore = new RedisRateLimiterStore(null); // No active Redis client
      DistributedRateLimiter.setStore(redisStore);

      const res1 = await DistributedRateLimiter.consume('test:fallback:key', 2, 60000);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(1);

      const res2 = await DistributedRateLimiter.consume('test:fallback:key', 2, 60000);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(0);

      const res3 = await DistributedRateLimiter.consume('test:fallback:key', 2, 60000);
      expect(res3.allowed).toBe(false);
    });

    it('strictly throws and fails safe in production mode when Redis is disconnected or absent, prohibiting memory fallback', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const redisStore = new RedisRateLimiterStore(null); // No active Redis client in production
        DistributedRateLimiter.setStore(redisStore);

        await expect(DistributedRateLimiter.consume('prod:test:key', 5, 60000)).rejects.toThrow(
          /FATAL RATE LIMITER EXCEPTION: Redis client is required in production environment/,
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
