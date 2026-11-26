export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HR_ADMIN = 'HR_ADMIN',
  HR_OPERATOR = 'HR_OPERATOR',
  DADA_ADMIN = 'DADA_ADMIN',
  DADA_OPERATIONS = 'DADA_OPERATIONS',
  DADA_SUPER_ADMIN = 'DADA_SUPER_ADMIN',
}

export enum ProductType {
  EWA = 'EWA',
  PAYROLL_LOAN = 'PAYROLL_LOAN',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  ELIGIBILITY_CHECK_PENDING = 'ELIGIBILITY_CHECK_PENDING',
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  KYC_PENDING = 'KYC_PENDING',
  KYC_VERIFIED = 'KYC_VERIFIED',
  SENT_TO_NBFC = 'SENT_TO_NBFC',
  NBFC_REVIEW_PENDING = 'NBFC_REVIEW_PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  ESIGN_PENDING = 'ESIGN_PENDING',
  MANDATE_PENDING = 'MANDATE_PENDING',
  READY_FOR_DISBURSEMENT = 'READY_FOR_DISBURSEMENT',
  DISBURSEMENT_PENDING = 'DISBURSEMENT_PENDING',
  DISBURSED = 'DISBURSED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum EmploymentStatus {
  PROBATION = 'PROBATION',
  CONFIRMED = 'CONFIRMED',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum RepaymentStatus {
  PENDING = 'PENDING',
  DEDUCTED_BY_EMPLOYER = 'DEDUCTED_BY_EMPLOYER',
  REMITTED_TO_NBFC = 'REMITTED_TO_NBFC',
  CONFIRMED_BY_NBFC = 'CONFIRMED_BY_NBFC',
  FAILED = 'FAILED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export enum BatchStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  GENERATED = 'GENERATED',
  EXPORTED = 'EXPORTED',
  REMITTANCE_UPLOADED = 'REMITTANCE_UPLOADED',
  RECONCILED = 'RECONCILED',
  RECONCILED_WITH_EXCEPTIONS = 'RECONCILED_WITH_EXCEPTIONS',
}

export enum ReconciliationExceptionType {
  PARTIAL_DEDUCTION = 'PARTIAL_DEDUCTION',
  FAILED_DEDUCTION = 'FAILED_DEDUCTION',
  INSUFFICIENT_SALARY = 'INSUFFICIENT_SALARY',
  EMPLOYEE_RESIGNED = 'EMPLOYEE_RESIGNED',
  UNMATCHED_UTR = 'UNMATCHED_UTR',
  DUPLICATE_REMITTANCE = 'DUPLICATE_REMITTANCE',
  ATTENDANCE_CORRECTION_OVERDRAW = 'ATTENDANCE_CORRECTION_OVERDRAW',
}

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

export enum ConsentPurpose {
  KFS_ACCEPTANCE = 'KFS_ACCEPTANCE',
  BUREAU_FETCH = 'BUREAU_FETCH',
  NACH_MANDATE = 'NACH_MANDATE',
  DATA_PROCESSING = 'DATA_PROCESSING',
}

export interface EwaPolicyConfig {
  maxEwaPercentage: number; // e.g. 50 (%)
  minWithdrawalPaise: number; // e.g. 100000 (Rs 1,000)
  maxWithdrawalPaise: number; // e.g. 5000000 (Rs 50,000)
  maxWithdrawalsPerCycle: number; // e.g. 2
  payrollCutoffDay: number; // e.g. 25
  payrollFreezeDaysBeforeCutoff: number; // e.g. 3 days before cutoff
  flatConvenienceFeePaise: number; // e.g. 9900 (Rs 99)
}

export interface PayrollLoanPolicyConfig {
  salaryMultiplier: number; // e.g. 3 (3x monthly net salary)
  maxTenureMonths: number; // e.g. 24
  minTenureMonths: number; // e.g. 6
  provisionalTenuresMonths: number[]; // Configurable provisional tenures pending client/NBFC confirmation: e.g. [6, 12, 18, 24, 36]
  annualInterestRatePercent: number; // e.g. 14.5
  processingFeePercent: number; // e.g. 1.5
  maxFoirPercent: number; // e.g. 50 (%)
  considerEwaInFoir?: boolean; // When true, active EWA obligations reduce FOIR capacity
  maxCombinedDebtPaise?: number; // Optional cap on combined EWA + Payroll loan total exposure
}
