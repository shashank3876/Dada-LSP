# ADR 001: Architecture & Compliance Decisions

## Status: APPROVED

## Context
Dada Advisory is building a fintech platform serving as a Lending Service Provider (LSP) in India connecting Corporate Employers, their Employees, and Regulated NBFC Partners.

## Key Architectural Decisions

1. **Monorepo Architecture:**
   - Single unified repository with `apps/web` (Next.js App Router), `apps/api` (NestJS REST API), `apps/worker` (BullMQ async runner), and shared packages (`@dada/contracts`, `@dada/database`, `@dada/ui`).
   - Single frontend with route groups (`/`, `/employee/*`, `/hr/*`, `/admin/*`) rather than separate apps, enabling shared design tokens and unified authentication.

2. **Strict Financial Data Modeling:**
   - All monetary figures are stored in exact **integer paise** (`Int` or `BigInt`, 1 INR = 100 paise).
   - Zero floating point arithmetic is used for financial storage or EMI schedules.

3. **Statutory LSP Boundary:**
   - Dada Advisory does not receive, hold, pool, or route borrower funds.
   - Disbursements are executed directly by partner NBFCs to borrower salary bank accounts.
   - Repayments are deducted on salary day and remitted directly by employers to the NBFC escrow account.

4. **Attendance Correction Invariance:**
   - Attendance corrections recalculate remaining eligibility.
   - Existing disbursed loans and repayment obligations are **never** silently altered.
   - Overdraws are flagged as structured `ReconciliationException` items for human HR audit.
