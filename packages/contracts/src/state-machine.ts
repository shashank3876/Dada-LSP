import { ApplicationStatus } from './types';

/**
 * Permitted status transitions for lending applications (EWA and Payroll Loans).
 * Enforces a strict finite state machine rejecting arbitrary frontend-provided status changes.
 */
export const PERMITTED_APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.DRAFT]: [
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.SUBMITTED]: [
    ApplicationStatus.ELIGIBILITY_CHECK_PENDING,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.ELIGIBILITY_CHECK_PENDING]: [
    ApplicationStatus.ELIGIBLE,
    ApplicationStatus.INELIGIBLE,
    ApplicationStatus.FAILED,
  ],
  [ApplicationStatus.ELIGIBLE]: [
    ApplicationStatus.KYC_PENDING,
    ApplicationStatus.SENT_TO_NBFC,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.INELIGIBLE]: [
    ApplicationStatus.DRAFT, // Employee may update data and re-try
  ],
  [ApplicationStatus.KYC_PENDING]: [
    ApplicationStatus.KYC_VERIFIED,
    ApplicationStatus.FAILED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.KYC_VERIFIED]: [
    ApplicationStatus.SENT_TO_NBFC,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.SENT_TO_NBFC]: [
    ApplicationStatus.NBFC_REVIEW_PENDING,
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.FAILED,
  ],
  [ApplicationStatus.NBFC_REVIEW_PENDING]: [
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.FAILED,
  ],
  [ApplicationStatus.APPROVED]: [
    ApplicationStatus.OFFER_ACCEPTED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.OFFER_ACCEPTED]: [
    ApplicationStatus.ESIGN_PENDING,
    ApplicationStatus.MANDATE_PENDING,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.ESIGN_PENDING]: [
    ApplicationStatus.MANDATE_PENDING,
    ApplicationStatus.READY_FOR_DISBURSEMENT,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.MANDATE_PENDING]: [
    ApplicationStatus.READY_FOR_DISBURSEMENT,
    ApplicationStatus.FAILED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.READY_FOR_DISBURSEMENT]: [
    ApplicationStatus.DISBURSEMENT_PENDING,
    ApplicationStatus.DISBURSED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.DISBURSEMENT_PENDING]: [
    ApplicationStatus.DISBURSED,
    ApplicationStatus.FAILED,
  ],
  // Terminal states
  [ApplicationStatus.DISBURSED]: [], // Terminal: prevents duplicate disbursement
  [ApplicationStatus.REJECTED]: [],  // Terminal
  [ApplicationStatus.CANCELLED]: [], // Terminal
  [ApplicationStatus.FAILED]: [
    ApplicationStatus.DRAFT, // Retry permitted after failure
  ],
};

/**
 * Validates whether transition from `from` to `to` is permitted.
 */
export function canTransitionApplication(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  if (from === to) return false; // Redundant transition
  const permitted = PERMITTED_APPLICATION_TRANSITIONS[from];
  return Array.isArray(permitted) && permitted.includes(to);
}

/**
 * Throws an error if transition is illegal.
 */
export function assertValidApplicationTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): void {
  if (!canTransitionApplication(from, to)) {
    throw new Error(
      `Invalid loan application state transition: cannot move from ${from} to ${to}.`,
    );
  }
}
