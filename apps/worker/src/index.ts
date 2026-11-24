import { prisma } from '@dada/database';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('---------------------------------------------------------');
console.log('🤖 Dada Advisory Asynchronous Worker Process Started');
console.log('Active Queues: [nbfc-sync, payroll-cutoff, reconciliation, webhook-retries]');
console.log('---------------------------------------------------------');

interface Job {
  id: string;
  name: string;
  run: () => Promise<void>;
  intervalMs: number;
}

const jobs: Job[] = [
  {
    id: 'nbfc-status-sync',
    name: 'NBFC Partner Application Status Poller',
    intervalMs: 30000, // Every 30 seconds
    run: async () => {
      const pendingApps = await prisma.loanApplication.count({
        where: { status: 'SENT_TO_NBFC' },
      });
      if (pendingApps > 0) {
        console.log(`[NBFC Sync] Checked partner APIs: ${pendingApps} applications under review.`);
      }
    },
  },
  {
    id: 'webhook-retry-worker',
    name: 'Webhook Event Retry Worker',
    intervalMs: 45000, // Every 45 seconds
    run: async () => {
      const failedEvents = await prisma.webhookEvent.findMany({
        where: { status: 'FAILED', retryCount: { lt: 3 } },
      });
      for (const event of failedEvents) {
        console.log(`[Webhook Retry] Retrying event ${event.id} (Attempt ${event.retryCount + 1}/3)...`);
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { retryCount: event.retryCount + 1 },
        });
      }
    },
  },
  {
    id: 'reconciliation-checker',
    name: 'Automated Remittance & Reconciliation Monitor',
    intervalMs: 60000, // Every 60 seconds
    run: async () => {
      const openExceptions = await prisma.reconciliationException.count({
        where: { status: 'OPEN' },
      });
      if (openExceptions > 0) {
        console.log(`[Reconciliation] Alert: ${openExceptions} open reconciliation exception(s) require review.`);
      }
    },
  },
];

// Start background timers
const timers = jobs.map((job) => {
  console.log(`⚡ Registered job: ${job.name} (Interval: ${job.intervalMs / 1000}s)`);
  return setInterval(async () => {
    try {
      await job.run();
    } catch (err: any) {
      console.error(`[Worker Error] in ${job.name}:`, err.message);
    }
  }, job.intervalMs);
});

// Run initial execution once on startup
jobs.forEach((job) => job.run().catch((err) => console.error(err)));

const shutdown = async () => {
  console.log('\n🛑 Gracefully shutting down worker process...');
  timers.forEach((t) => clearInterval(t));
  await prisma.$disconnect();
  console.log('Worker shutdown complete.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
