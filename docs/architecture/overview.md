# Dada Advisory — Architecture & System Overview

## 1. System Context & Business Model

Dada Advisory operates strictly as a **Lending Service Provider (LSP)** in compliance with the Reserve Bank of India (RBI) Digital Lending Guidelines. 

### Mandatory Statutory Boundary
- **Zero Custody of Funds:** Dada Advisory does **not** receive, hold, pool, route, or transfer borrower funds.
- **Direct NBFC Disbursement:** Partner NBFCs (e.g. Apex Capital Finance Ltd) perform final underwriting, generate Key Fact Statements (KFS), sanction loan agreements, and disburse money **directly** into the employee's salary bank account.
- **Direct Employer Remittance:** Employers deduct advance repayments on salary day and remit funds **directly** to the partner NBFC designated escrow account.

```mermaid
sequenceDiagram
    autonumber
    actor Employee
    participant Dada as Dada Advisory (LSP Platform)
    participant HR as Corporate Employer HRMS
    participant NBFC as Regulated NBFC Partner

    Employee->>Dada: 1. Apply for EWA / Payroll Loan
    Dada->>HR: 2. Verify approved attendance & salary ledger
    Dada->>Dada: 3. Compute initial eligibility & cap
    Dada->>NBFC: 4. Submit application via signed API
    NBFC->>Employee: 5. Display KFS & execute e-Sign agreement
    NBFC->>Employee: 6. Direct disbursement to salary bank account (UTR)
    NBFC->>Dada: 7. Webhook: DISBURSEMENT_CONFIRMED
    Dada->>Dada: 8. Record active loan & repayment schedule
    Note over HR,NBFC: Monthly Salary Cutoff Cycle
    Dada->>HR: 9. Generate payroll deduction batch
    HR->>Employee: 10. Deduct installment from net monthly salary
    HR->>NBFC: 11. Remit collected batch directly to NBFC account
    HR->>Dada: 12. Upload remittance UTR
    Dada->>Dada: 13. Reconcile ledger & flag variance exceptions
```

---

## 2. Loan Application State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Initiate Application
    DRAFT --> SUBMITTED: Employee Submit
    SUBMITTED --> ELIGIBILITY_CHECK_PENDING: Validate Attendance & Salary
    ELIGIBILITY_CHECK_PENDING --> INELIGIBLE: Over-cap / Notice Period / FOIR limit
    ELIGIBILITY_CHECK_PENDING --> ELIGIBLE: Criteria Met
    ELIGIBLE --> SENT_TO_NBFC: Forward to Underwriter
    SENT_TO_NBFC --> REJECTED: NBFC Risk Policy Rejection
    SENT_TO_NBFC --> APPROVED: Sanctioned by NBFC
    APPROVED --> OFFER_ACCEPTED: Borrower Accepts KFS Terms
    OFFER_ACCEPTED --> DISBURSEMENT_PENDING: eSign & eNACH Complete
    DISBURSEMENT_PENDING --> DISBURSED: External Bank UTR Confirmed
    DISBURSED --> [*]: Repayment via Payroll Completed
```

---

## 3. Financial Calculation Rules

### Earned Wage Access (EWA)
- **Daily Net Wage:** $\text{Daily Net Wage} = \lfloor \frac{\text{Monthly Net Salary}}{\text{Total Payable Days}} \rfloor$
- **Gross Earned Wage:** $\text{Daily Net Wage} \times \text{Approved Days Worked}$
- **Available EWA Cap:** $\min(50\% \times \text{Gross Earned Wage} - \text{Already Withdrawn} - \text{Active EMIs}, \text{Policy Max})$
- **Notice Period / Terminated Employees:** Explicit **ZERO** eligibility.
- **Attendance Correction Overdraw Rule:**
  1. Attendance reduction recalculates remaining eligibility.
  2. If prior disbursed withdrawals exceed new cap, an `ATTENDANCE_CORRECTION_OVERDRAW` reconciliation exception is generated.
  3. Disbursed loan and borrower repayment obligations remain strictly preserved.

### Corporate Payroll Personal Loans (EMI)
- **Reducing-Balance Formula:**
  $$\text{EMI} = \frac{P \cdot r \cdot (1 + r)^n}{(1 + r)^n - 1}$$
  where $P$ is principal in integer paise, $r$ is monthly interest rate ($\frac{\text{APR}}{1200}$), and $n$ is tenure in months.
- **FOIR Check:** Total monthly EMI obligations must not exceed corporate policy cap (default 50%).
