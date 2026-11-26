export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  DEAD_LETTER = 'DEAD_LETTER',
}

export enum OutboxTopic {
  NBFC_LOAN_SUBMIT = 'nbfc.loan.submit',
  NBFC_DISBURSEMENT_REQUEST = 'nbfc.disbursement.request',
  REPAYMENT_NACH_TRIGGER = 'repayment.nach.trigger',
  AUDIT_EVENT_DISPATCH = 'audit.event.dispatch',
  NOTIFICATION_EMAIL_DISPATCH = 'notification.email.dispatch',
}

export interface RetryPolicyConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitter: boolean;
}

export const DEFAULT_RETRY_POLICY: RetryPolicyConfig = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 300000, // 5 minutes
  factor: 2,
  jitter: true,
};

export interface OutboxPayloadWrapper {
  data: Record<string, any>;
  idempotencyKey?: string;
  lockedBy?: string;
  leaseExpiresAt?: string;
  lastHeartbeatAt?: string;
  financialMutationExecuted?: boolean;
  lastError?: string;
  nextRetryAt?: string;
  processedAt?: string;
  deadLetterAt?: string;
  deadLetterReason?: string;
}

export enum AllocationWaterfallModel {
  SENIORITY_EWA_FIRST = 'SENIORITY_EWA_FIRST',
  PRO_RATA_EQUAL = 'PRO_RATA_EQUAL',
}

export interface AllocationWaterfallPolicy {
  model: AllocationWaterfallModel;
  disclaimer: string;
}

export const PROVISIONAL_WATERFALL_POLICY: AllocationWaterfallPolicy = {
  model: AllocationWaterfallModel.PRO_RATA_EQUAL,
  disclaimer:
    'PROVISIONAL ALLOCATION WATERFALL: Subject to final contractual ratification in the NBFC Underwriting Agreement and Employer Master Service Agreement.',
};

export interface WorkerJob {
  id: string;
  name: string;
  intervalMs: number;
  run: () => Promise<void>;
}

export interface WorkerHealthReport {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptimeSeconds: number;
  pendingOutboxCount: number;
  deadLetterCount: number;
  openExceptionsCount: number;
  activeJobs: string[];
  timestamp: string;
}
