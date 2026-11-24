# Dada Advisory — Full-Stack Fintech Platform (LSP)

> **Lending Service Provider (LSP)** connecting Corporate Employers, Employees, and RBI-Regulated Partner NBFCs/Banks for **Earned Wage Access (EWA)** and **Corporate Salary Advance Loans**.

---

## 1. Statutory LSP Boundary & Core Business Rule

Dada Advisory operates strictly as a **Lending Service Provider (LSP)** in accordance with RBI Digital Lending guidelines.
- **Zero Custody of Funds:** Dada Advisory **never** receives, holds, pools, routes, or transfers borrower loan funds.
- **Direct NBFC Disbursement:** Partner NBFCs (e.g. Apex Capital Finance Ltd) perform credit underwriting, sanction Key Fact Statements (KFS), and disburse loan funds **directly** to the employee’s salary bank account.
- **Direct Employer Remittance:** Employers deduct advance installments on monthly salary day and remit funds **directly** to the partner NBFC escrow account.

---

## 2. Product Summary

1. **Earned Wage Access (EWA):**
   - On-demand access to up to 50% of wages already earned against approved attendance.
   - 0% interest, flat nominal technology fee (₹99 per withdrawal).
   - Auto-deducted on the upcoming regular salary day.
2. **Corporate Advance Salary / Payroll Loan:**
   - Multi-month personal credit up to 3x net monthly salary.
   - Reducing-balance EMI schedule with tenures ranging from 6 to 36 months.
   - Paperless digital KYC (PAN, Aadhaar OTP, Penny-drop account validation).

---

## 3. Technology Stack

- **Monorepo:** pnpm workspaces
- **Frontend (`apps/web`):** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend API (`apps/api`):** NestJS, TypeScript, Swagger/OpenAPI (`/api/docs`), Passport JWT, RBAC guards
- **Asynchronous Worker (`apps/worker`):** Event poller, retry queues, reconciliation monitor
- **Database (`packages/database`):** Prisma ORM with integer paise financial models, PostgreSQL & SQLite compatibility
- **Shared Contracts (`packages/contracts`):** Reducing-balance EMI math, EWA calculation engine, currency formatters, PII masking

---

## 4. Repository Structure

```
dada-advisory/
├── apps/
│   ├── web/                     # Next.js App Router (Public site, Employee, HR, Admin portals)
│   ├── api/                     # NestJS REST API with Swagger & RBAC
│   └── worker/                  # Background queue and status polling process
├── packages/
│   ├── contracts/               # Shared TypeScript types, state machine, financial math
│   ├── database/                # Prisma ORM schema, migrations, and seed scripts
│   ├── config/                  # Shared configuration
│   └── ui/                      # Shared UI tokens and components
├── docs/
│   ├── architecture/            # Architecture overview & Mermaid sequence diagrams
│   ├── api/                     # API endpoint summaries
│   └── decisions/               # Architecture Decision Records (ADRs)
├── .env.example
├── pnpm-workspace.yaml
└── README.md
```

---

## 5. Quickstart & Local Development

### Prerequisites
- Node.js >= 20 (Node 22 recommended)
- pnpm >= 10

### Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment variables
cp .env.example .env
cp .env packages/database/.env
cp .env apps/api/.env
cp .env apps/web/.env.local
cp .env apps/worker/.env

# 3. Generate Prisma client & seed demo database
pnpm db:generate
pnpm db:push
pnpm db:seed

# 4. Run tests
pnpm test

# 5. Start development servers
# Terminal 1: Backend API (port 3001)
pnpm --filter "api" start:dev

# Terminal 2: Frontend Web Portals (port 3000)
pnpm --filter "web" dev

# Terminal 3: Async Worker
pnpm --filter "worker" start:dev
```

- **Web Portals:** `http://localhost:3000`
- **Swagger OpenAPI:** `http://localhost:3001/api/docs`

---

## 6. Pre-Seeded Demonstration Accounts

All accounts are pre-configured with password: `DadaDemo@2026`. The login screen at `/login` also features a **1-Click Demo Switcher** for instant testing:

| Role | Name | Email | Password | Scenario / Capability |
| :--- | :--- | :--- | :--- | :--- |
| **DADA_ADMIN** | Aakash Verma | `admin@dadaadvisory.com` | `DadaDemo@2026` | Master LSP operations, portfolio KPIs, **NBFC Webhook Simulator** (1-click Approve, Disburse, Reject) |
| **HR_ADMIN** | Rohini Sen | `hr.admin@techcorp.in` | `DadaDemo@2026` | TechCorp HR Head: Attendance audit, deduction batches, CSV export, remittance UTR matching |
| **HR_OPERATOR**| Vikas Nair | `hr.ops@techcorp.in` | `DadaDemo@2026` | HR Operations: Attendance corrections, leave management |
| **EMPLOYEE** | Rajesh Kumar | `rajesh.k@techcorp.in` | `DadaDemo@2026` | Active EWA borrower (₹20,000 disbursed), eligible for additional withdrawal |
| **EMPLOYEE** | Priya Sharma | `priya.s@techcorp.in` | `DadaDemo@2026` | Senior Product Manager, has approved Payroll Loan offer ready to e-Sign |
| **EMPLOYEE** | Amit Verma | `amit.v@techcorp.in` | `DadaDemo@2026` | **Notice Period Employee** demonstrating zero EWA/Loan eligibility policy enforcement |
| **EMPLOYEE** | Sunita Mehra | `sunita.m@techcorp.in` | `DadaDemo@2026` | Senior Designer with active 12-month Payroll Loan (LN-PL-2026-0042) |

---

## 7. Verification & Test Suites

The test suite validates financial math, state machine invariants, attendance corrections, and webhook idempotency:

```bash
# Run contracts financial math unit tests
pnpm --filter "@dada/contracts" test

# Run NestJS API unit tests
pnpm --filter "api" test
```

### Verified Test Cases:
- **EWA Engine:** Daily net wage computation, 50% cap, prior withdrawal deduction, notice period zero eligibility enforcement.
- **Payroll Loan EMI:** Reducing-balance formula, total interest, total repayment, FOIR cap compliance.
- **Attendance Correction Invariance:** Preserves disbursed loans, recalculates remaining cap, logs overdraw reconciliation exception.
- **NBFC Webhook Processing:** Idempotent event handling, loan creation with external bank UTR, transition to `DISBURSED`.
