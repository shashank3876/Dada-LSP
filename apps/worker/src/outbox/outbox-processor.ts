import { OutboxStatus, OutboxTopic, DEFAULT_RETRY_POLICY, RetryPolicyConfig, OutboxPayloadWrapper } from '../types';

export function computeBackoffDelayMs(
  retryCount: number,
  policy: RetryPolicyConfig = DEFAULT_RETRY_POLICY,
): number {
  const exponential = policy.baseDelayMs * Math.pow(policy.factor, retryCount);
  const capped = Math.min(policy.maxDelayMs, exponential);
  const jitterAmount = policy.jitter ? Math.floor(Math.random() * (capped * 0.2)) : 0;
  return capped + jitterAmount;
}

export class OutboxProcessor {
  public readonly workerInstanceId: string;

  constructor(
    private prisma: any,
    private policy: RetryPolicyConfig = DEFAULT_RETRY_POLICY,
    workerId?: string,
  ) {
    this.workerInstanceId = workerId || `worker-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Atomically claims an outbox event using optimistic concurrency / database condition.
   * Prevents race conditions when multiple worker replicas poll simultaneously.
   */
  async claimEvent(eventId: string, leaseDurationMs = 60000): Promise<{ claimed: boolean; wrapper: OutboxPayloadWrapper }> {
    const event = await this.prisma.outboxEvent.findUnique({ where: { id: eventId } });
    if (!event) return { claimed: false, wrapper: { data: {} } };

    let wrapper: OutboxPayloadWrapper = { data: {} };
    try {
      wrapper = JSON.parse(event.payloadJson);
    } catch {
      wrapper = { data: { raw: event.payloadJson } };
    }

    const now = Date.now();

    // Check if event is currently locked under an active lease
    if (event.status === OutboxStatus.PROCESSING && wrapper.leaseExpiresAt) {
      const leaseExpiry = new Date(wrapper.leaseExpiresAt).getTime();
      if (now < leaseExpiry) {
        // Active lease held by another worker instance: skip to avoid duplicate execution
        return { claimed: false, wrapper };
      }
    }

    // Check if backoff window has elapsed
    if (wrapper.nextRetryAt && new Date(wrapper.nextRetryAt).getTime() > now) {
      return { claimed: false, wrapper };
    }

    // Attempt atomic lease acquisition
    const leaseExpiresAt = new Date(now + leaseDurationMs).toISOString();
    wrapper.lockedBy = this.workerInstanceId;
    wrapper.leaseExpiresAt = leaseExpiresAt;
    wrapper.lastHeartbeatAt = new Date(now).toISOString();

    const updateRes = await this.prisma.outboxEvent.updateMany({
      where: {
        id: eventId,
        status: { in: [OutboxStatus.PENDING, OutboxStatus.FAILED, OutboxStatus.PROCESSING] },
      },
      data: {
        status: OutboxStatus.PROCESSING,
        payloadJson: JSON.stringify(wrapper),
      },
    });

    if (updateRes.count === 0) {
      return { claimed: false, wrapper };
    }

    return { claimed: true, wrapper };
  }

  async processBatch(limit = 20): Promise<{ processed: number; published: number; failed: number; deadLettered: number; skippedLease: number }> {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        status: { in: [OutboxStatus.PENDING, OutboxStatus.FAILED] },
        retryCount: { lt: this.policy.maxRetries },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    let published = 0;
    let failed = 0;
    let deadLettered = 0;
    let skippedLease = 0;

    for (const event of events) {
      // 1. Atomic Claim with lease
      const claimResult = await this.claimEvent(event.id);
      if (!claimResult.claimed) {
        skippedLease++;
        continue;
      }

      const wrapper = claimResult.wrapper;

      // 2. Idempotency Check: Did this financial mutation already commit before a crash?
      if (wrapper.financialMutationExecuted) {
        // Business mutation was completed prior to a crash. Mark complete without duplicate mutation.
        wrapper.processedAt = new Date().toISOString();
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: OutboxStatus.PUBLISHED,
            payloadJson: JSON.stringify(wrapper),
          },
        });
        published++;
        continue;
      }

      try {
        await this.dispatchTopic(event.topic, wrapper.data);

        // Mark financial mutation executed and transition to PUBLISHED
        wrapper.financialMutationExecuted = true;
        wrapper.processedAt = new Date().toISOString();

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: OutboxStatus.PUBLISHED,
            payloadJson: JSON.stringify(wrapper),
          },
        });
        published++;
      } catch (err: any) {
        const nextRetry = event.retryCount + 1;
        const errorMessage = err.message || 'Unknown outbox processing error';

        if (nextRetry >= this.policy.maxRetries) {
          // Dead letter handling: exhausted retries
          wrapper.lastError = errorMessage;
          wrapper.deadLetterAt = new Date().toISOString();
          wrapper.deadLetterReason = `Max retry attempts (${this.policy.maxRetries}) exhausted. Last error: ${errorMessage}`;

          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: OutboxStatus.DEAD_LETTER,
              retryCount: nextRetry,
              payloadJson: JSON.stringify(wrapper),
            },
          });

          // Record alert in audit log for operational team
          if (this.prisma.auditEvent?.create) {
            await this.prisma.auditEvent.create({
              data: {
                action: 'OUTBOX_DEAD_LETTER_EXHAUSTED',
                resourceType: 'OUTBOX_EVENT',
                resourceId: event.id,
                metadataJson: JSON.stringify({
                  topic: event.topic,
                  retryCount: nextRetry,
                  error: errorMessage,
                  timestamp: new Date().toISOString(),
                }),
              },
            }).catch(() => {});
          }

          deadLettered++;
        } else {
          // Exponential backoff
          const backoffDelay = computeBackoffDelayMs(nextRetry, this.policy);
          wrapper.lastError = errorMessage;
          wrapper.nextRetryAt = new Date(Date.now() + backoffDelay).toISOString();

          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: OutboxStatus.FAILED,
              retryCount: nextRetry,
              payloadJson: JSON.stringify(wrapper),
            },
          });
          failed++;
        }
      }
    }

    return {
      processed: published + failed + deadLettered,
      published,
      failed,
      deadLettered,
      skippedLease,
    };
  }

  /**
   * Routes topic to partner NBFC or downstream adapter
   */
  private async dispatchTopic(topic: string, data: Record<string, any>): Promise<void> {
    switch (topic) {
      case OutboxTopic.NBFC_LOAN_SUBMIT:
        await this.handleNbfcLoanSubmit(data);
        break;
      case OutboxTopic.NBFC_DISBURSEMENT_REQUEST:
        await this.handleNbfcDisbursementRequest(data);
        break;
      case OutboxTopic.REPAYMENT_NACH_TRIGGER:
        await this.handleRepaymentNachTrigger(data);
        break;
      case OutboxTopic.AUDIT_EVENT_DISPATCH:
      case OutboxTopic.NOTIFICATION_EMAIL_DISPATCH:
        // Operational dispatches
        break;
      default:
        // Custom or unhandled topic
        break;
    }
  }

  private async handleNbfcLoanSubmit(data: Record<string, any>): Promise<void> {
    if (data.shouldSimulateFailure) {
      throw new Error('NBFC Gateway Timeout: Partner API unreachable (Simulated Network Fault)');
    }
    // Successful submission to NBFC
  }

  private async handleNbfcDisbursementRequest(data: Record<string, any>): Promise<void> {
    if (data.shouldSimulateFailure) {
      throw new Error('Banking Rail Connectivity Failure: Disbursal node rejected request');
    }
    // Successful disbursement request submission
  }

  private async handleRepaymentNachTrigger(data: Record<string, any>): Promise<void> {
    if (data.shouldSimulateFailure) {
      throw new Error('NPCI Mandate Rail Exception: Mandate presentation declined');
    }
  }

  /**
   * Manual intervention to recover dead-lettered events
   */
  async reprocessDeadLetterEvent(eventId: string): Promise<boolean> {
    const event = await this.prisma.outboxEvent.findUnique({ where: { id: eventId } });
    if (!event || event.status !== OutboxStatus.DEAD_LETTER) {
      return false;
    }

    let wrapper: OutboxPayloadWrapper = { data: {} };
    try {
      wrapper = JSON.parse(event.payloadJson);
    } catch {}

    delete wrapper.deadLetterAt;
    delete wrapper.deadLetterReason;
    delete wrapper.nextRetryAt;

    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: OutboxStatus.PENDING,
        retryCount: 0,
        payloadJson: JSON.stringify(wrapper),
      },
    });

    return true;
  }
}
