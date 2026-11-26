import { prisma } from '@dada/database';
import * as dotenv from 'dotenv';
import { OutboxProcessor } from './outbox/outbox-processor';
import { AttendanceSyncJob } from './jobs/attendance-sync.job';
import { PayrollCutoffJob } from './jobs/payroll-cutoff.job';
import { ReconciliationEngine } from './reconciliation/reconciliation-engine';
import { CrashRecoveryService } from './monitoring/crash-recovery';
import { WorkerJob } from './types';

dotenv.config();

console.log('===============================================================');
console.log('🚀 Dada Advisory — Production Background Worker Process');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database Engine: Prisma Client Connected');
console.log('Active Engines: [Transactional Outbox, Attendance Sync, Payroll Cutoff, Remittance Reconciliation]');
console.log('===============================================================');

const startTime = Date.now();
const outboxProcessor = new OutboxProcessor(prisma);
const attendanceSyncJob = new AttendanceSyncJob(prisma);
const payrollCutoffJob = new PayrollCutoffJob(prisma);
const reconciliationEngine = new ReconciliationEngine(prisma);
const crashRecoveryService = new CrashRecoveryService(prisma);

let isShuttingDown = false;

const registeredJobs: WorkerJob[] = [
  {
    id: 'transactional-outbox-processor',
    name: 'Transactional Outbox Queue Processor (Exponential Backoff)',
    intervalMs: 5000, // Poll every 5s
    run: async () => {
      if (isShuttingDown) return;
      const res = await outboxProcessor.processBatch(25);
      if (res.processed > 0) {
        console.log(`[Outbox] Processed: ${res.processed} | Published: ${res.published} | Failed: ${res.failed} | Dead-letter: ${res.deadLettered}`);
      }
    },
  },
  {
    id: 'attendance-sync-recalculation',
    name: 'Attendance Delta Sync & EWA Limit Recalculation',
    intervalMs: 60000, // Poll every 60s
    run: async () => {
      if (isShuttingDown) return;
      const res = await attendanceSyncJob.runSyncAndRecalculate();
      if (res.employeesRecalculated > 0) {
        console.log(`[Attendance Sync] Orgs: ${res.organizationsProcessed} | Employees recalculated: ${res.employeesRecalculated} | Overdraw exceptions: ${res.overdrawExceptionsFlagged}`);
      }
    },
  },
  {
    id: 'payroll-cutoff-batch-locking',
    name: 'Payroll Cutoff Cycle Monitor & Batch Generation',
    intervalMs: 60000, // Poll every 60s
    run: async () => {
      if (isShuttingDown) return;
      const res = await payrollCutoffJob.processCutoffBatches();
      if (res.batchesCreated > 0 || res.batchesLocked > 0) {
        console.log(`[Payroll Cutoff] Batches created: ${res.batchesCreated} | Batches locked: ${res.batchesLocked} | Dues compiled: ₹${(res.totalDeductionsCompiledPaise / 100).toFixed(2)}`);
      }
    },
  },
  {
    id: 'remittance-reconciliation-checker',
    name: 'Employer Remittance Ingestion & Matching Engine',
    intervalMs: 30000, // Poll every 30s
    run: async () => {
      if (isShuttingDown) return;
      const pendingRemittances = await prisma.employerRemittance.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        take: 5,
      });

      for (const remittance of pendingRemittances) {
        console.log(`[Reconciliation] Reconciling remittance ${remittance.id} (UTR: ${remittance.utrNumber})...`);
        const result = await reconciliationEngine.reconcileRemittance(remittance.id);
        console.log(`[Reconciliation] Remittance ${remittance.id} reconciled: Status = ${result.status} (Matched: ${result.matchedCount}, Exceptions: ${result.exceptionCount})`);
      }
    },
  },
  {
    id: 'heartbeat-health-monitor',
    name: 'Worker Health & Operational Metrics Heartbeat',
    intervalMs: 30000, // Heartbeat every 30s
    run: async () => {
      if (isShuttingDown) return;
      const report = await crashRecoveryService.getHealthReport(
        startTime,
        registeredJobs.map((j) => j.id),
      );
      console.log(`[Heartbeat] Status: ${report.status} | Uptime: ${report.uptimeSeconds}s | Pending Outbox: ${report.pendingOutboxCount} | Dead Letter: ${report.deadLetterCount} | Open Exceptions: ${report.openExceptionsCount}`);
    },
  },
];

async function startWorker() {
  // 1. Crash recovery on boot
  console.log('[Boot] Running crash recovery for stranded in-flight jobs...');
  await crashRecoveryService.recoverCrashedJobs();

  // 2. Start timers
  const timers = registeredJobs.map((job) => {
    console.log(`⚡ Registered Background Job: ${job.name} (Interval: ${job.intervalMs / 1000}s)`);
    return setInterval(async () => {
      try {
        await job.run();
      } catch (err: any) {
        console.error(`[Worker Error in ${job.name}]:`, err.message);
      }
    }, job.intervalMs);
  });

  // 3. Initial execution once on startup
  for (const job of registeredJobs) {
    job.run().catch((err) => console.error(`[Startup Job Error in ${job.name}]:`, err.message));
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Gracefully stopping worker...`);
    isShuttingDown = true;
    timers.forEach((t) => clearInterval(t));

    // Allow in-flight operations 2 seconds to complete
    await new Promise((r) => setTimeout(r, 2000));
    await prisma.$disconnect();
    console.log('✅ Worker shutdown cleanly. Database connection closed.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startWorker().catch((err) => {
  console.error('[Fatal Worker Startup Error]:', err);
  process.exit(1);
});
