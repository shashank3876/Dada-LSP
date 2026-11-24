# Dada Advisory REST API Documentation

Swagger OpenAPI interactive UI is hosted at `http://localhost:3001/api/docs`.

### Authentication & Profiles
- `POST /auth/login` — Login with email and password
- `POST /auth/verify-otp` — Verify simulated OTP (`123456`)
- `GET /auth/me` — Get current logged-in profile and organization permissions

### Eligibility & Financial Calculators
- `GET /eligibility/ewa` — Live EWA eligibility check based on verified attendance
- `GET /eligibility/payroll-loan` — Live payroll loan FOIR & salary multiplier eligibility
- `POST /payroll-loans/calculate-emi` — Reducing-balance EMI calculator

### Applications & Lifecycle
- `POST /ewa/apply` — Submit on-demand EWA withdrawal request
- `POST /payroll-loans/apply` — Submit multi-month corporate personal loan application
- `GET /loan-applications` — List applications (role and tenant filtered)
- `GET /loan-applications/:id` — Get application details, status history stepper, and KFS
- `POST /loan-applications/:id/transition` — Admin state transition override

### NBFC Integration & Webhook Simulator
- `GET /nbfc/partners` — List partner NBFCs
- `POST /nbfc/webhook` — HMAC signed webhook receiver with idempotency check
- `POST /nbfc/simulate-action` — 1-click test simulator (`APPROVE`, `REJECT`, `DISBURSE`)

### Corporate HR Operations
- `GET /employees` — Employee roster with masked PAN and Aadhaar
- `GET /attendance` — Monthly attendance ledger
- `POST /attendance/:employeeId/correction` — Attendance correction with EWA recalculation
- `GET /policies` & `PUT /policies` — Corporate lending policy management
- `GET /payroll/batches` — List payroll batches
- `POST /payroll/batches/generate` — Generate cutoff salary deduction batch
- `GET /payroll/batches/:id/export` — Export batch CSV ledger for payroll run

### Reconciliation
- `GET /reconciliation/remittances` — List employer remittances & UTRs
- `POST /reconciliation/upload-remittance` — Upload remittance UTR and match against batch
- `GET /reconciliation/exceptions` — List reconciliation exceptions
- `POST /reconciliation/exceptions/:id/resolve` — Mark exception resolved with audit trail

### Audit & Reports
- `GET /reports/admin` — Executive LSP dashboard analytics
- `GET /reports/hr` — Corporate HR metrics
- `GET /audit` — Tamper-evident immutable audit logs
