import { OutboxStatus, WorkerHealthReport } from '../types';

export class CrashRecoveryService {
  constructor(private prisma: any) {}

  /**
   * Recovers jobs that were left in PROCESSING state when worker was crashed/killed.
   * Prevents duplicate financial effects by checking if the mutation was already executed.
   */
  async recoverCrashedJobs(staleThresholdMinutes = 5): Promise<{
    recoveredOutboxEvents: number;
    alreadyCompletedEvents: number;
  }> {
    const staleCutoff = new Date(Date.now() - staleThresholdMinutes * 60 * 1000);

    // Find all outbox events in PROCESSING state
    const stuckEvents = await this.prisma.outboxEvent.findMany({
      where: {
        status: OutboxStatus.PROCESSING,
      },
    });

    let recovered = 0;
    let completedWithoutDuplicate = 0;

    for (const evt of stuckEvents) {
      let wrapper: any = {};
      try {
        wrapper = JSON.parse(evt.payloadJson);
      } catch {
        wrapper = {};
      }

      const now = Date.now();
      const isLeaseExpired = wrapper.leaseExpiresAt
        ? new Date(wrapper.leaseExpiresAt).getTime() < now
        : evt.createdAt < staleCutoff;

      if (!isLeaseExpired) {
        continue; // Active lease held by a healthy running worker
      }

      // Check if financial mutation was already committed before crash
      if (wrapper.financialMutationExecuted) {
        // Safe Recovery: Do NOT re-execute mutation. Directly transition to PUBLISHED!
        wrapper.processedAt = new Date().toISOString();
        delete wrapper.lockedBy;
        delete wrapper.leaseExpiresAt;

        await this.prisma.outboxEvent.update({
          where: { id: evt.id },
          data: {
            status: OutboxStatus.PUBLISHED,
            payloadJson: JSON.stringify(wrapper),
          },
        });
        completedWithoutDuplicate++;
        continue;
      }

      // Financial mutation was not committed: safely reset to PENDING for retry
      delete wrapper.lockedBy;
      delete wrapper.leaseExpiresAt;

      await this.prisma.outboxEvent.update({
        where: { id: evt.id },
        data: {
          status: OutboxStatus.PENDING,
          retryCount: evt.retryCount + 1,
          payloadJson: JSON.stringify(wrapper),
        },
      });
      recovered++;
    }

    if (recovered > 0 || completedWithoutDuplicate > 0) {
      console.warn(
        `[Crash Recovery] Recovered ${recovered} stuck PROCESSING event(s) to PENDING. Marked ${completedWithoutDuplicate} partially completed event(s) as PUBLISHED without duplicate financial effects.`,
      );
    }

    return {
      recoveredOutboxEvents: recovered,
      alreadyCompletedEvents: completedWithoutDuplicate,
    };
  }

  /**
   * Compiles healthcheck and operational metrics
   */
  async getHealthReport(startTime: number, activeJobs: string[]): Promise<WorkerHealthReport> {
    const pendingCount = await this.prisma.outboxEvent.count({
      where: { status: OutboxStatus.PENDING },
    }).catch(() => 0);

    const deadLetterCount = await this.prisma.outboxEvent.count({
      where: { status: OutboxStatus.DEAD_LETTER },
    }).catch(() => 0);

    const openExceptionsCount = await this.prisma.reconciliationException.count({
      where: { status: 'OPEN' },
    }).catch(() => 0);

    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    let status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
    if (deadLetterCount > 0 || openExceptionsCount > 10) {
      status = 'DEGRADED';
    }
    if (deadLetterCount > 50) {
      status = 'UNHEALTHY';
    }

    return {
      status,
      uptimeSeconds,
      pendingOutboxCount: pendingCount,
      deadLetterCount,
      openExceptionsCount,
      activeJobs,
      timestamp: new Date().toISOString(),
    };
  }
}
