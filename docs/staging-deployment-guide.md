# Dada Advisory — Staging Deployment Guide & Production Readiness Assessment

## 1. System Architecture Overview

The platform is structured as an enterprise Digital Lending Service Provider (LSP) full-stack architecture:

```
[ Next.js 15 Web Portal ]  <--->  [ NestJS API Gateway ]  <--->  [ Redis 7 Distributed Cache / Rate Limiter ]
   (Port 3000)                        (Port 3001)
                                           |
                                  [ PostgreSQL 16 DB ]
                                           ^
                                           |
                         [ Asynchronous Worker Process ]
                         - Transactional Outbox Engine
                         - Attendance Delta Sync & Recalculation
                         - Payroll Cutoff & Batch Locking
                         - Remittance Ingestion & Reconciliation
                         - Worker Crash Recovery
```

---

## 2. Environment Configuration Matrix

| Variable | Staging Default | Production Requirement | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `staging` | `production` | Enforces production security checks |
| `PORT` | `3001` | `3001` | API HTTP listen port |
| `CORS_ORIGIN` | `https://staging.dadaadvisory.in` | `https://app.dadaadvisory.in` | Strict browser origin whitelist |
| `DATABASE_URL` | Neon/Postgres pooler connection string | AWS RDS / Cloud SQL with SSL & pooler | Multi-tenant persistent store |
| `REDIS_URL` | `redis://localhost:6379` | Managed Redis cluster with TLS | Distributed rate limiting & cache |
| `JWT_SECRET` | 256-bit base64 secret | AWS Secrets Manager / Vault secret | Session token HMAC signing |
| `JWT_EXPIRES_IN` | `7d` | `8h` | Token expiration duration |
| `APEX_NBFC_WEBHOOK_SECRET` | Mocked staging secret | Regulated partner HMAC secret | NBFC webhook verification |
| `DMI_NBFC_WEBHOOK_SECRET` | Mocked staging secret | Regulated partner HMAC secret | NBFC webhook verification |
| `STORAGE_DRIVER` | `local` | `s3` | Document storage abstraction |

---

## 3. Staging Deployment Options

### Option A: Local & Self-Hosted Multi-Container Docker Compose

Deploy the entire five-service stack locally or on a staging VPS:

```bash
# 1. Clone repository and navigate to root
cd dada-advisory

# 2. Build and launch all services in detached mode
docker-compose up -d --build

# 3. Verify health status of all running containers
docker-compose ps

# 4. View real-time logs from API and background worker
docker-compose logs -f api worker
```

Services exposed:
- Web Application: `http://localhost:3000`
- API Gateway & Swagger Docs: `http://localhost:3001/api/docs`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Option B: Cloud Staging (Railway / AWS ECS)

1. **Database & Cache**: Provision managed PostgreSQL and Redis services on Railway or AWS.
2. **Database Migration**: Run `pnpm --filter "@dada/database" db:generate && npx prisma migrate deploy`.
3. **API Deployment**: Deploy `Dockerfile.api` as a web service. Set `PORT=3001` and connect `DATABASE_URL` and `REDIS_URL`.
4. **Worker Deployment**: Deploy `Dockerfile.worker` as a background worker service with matching `DATABASE_URL` and `REDIS_URL`.
5. **Web Deployment**: Deploy Next.js frontend with `NEXT_PUBLIC_API_URL` pointing to the public API domain.

---

## 4. Production Readiness Assessment & Outstanding External Dependencies

The codebase and architecture are functionally complete and verified for staging. However, progressing from staging to production lending requires the following regulatory, banking, and partner credentials:

### 1. NBFC Partner Production APIs
- **Status in Staging**: Simulated via `NbfcPartner` records with mock HMAC verification.
- **Production Requirement**: Regulated partner agreements, live underwriting API keys, and mutual TLS / IP whitelisting with partner NBFCs (Apex Capital, DMI Finance).

### 2. Statutory KYC & Verification Rails
- **Status in Staging**: Seeded mock KYC records labeled with `MOCK VERIFIED (STAGING)` badges.
- **Production Requirement**: Official integration with DigiLocker API (UIDAI) and NSDL/Protean PAN Verification API through the lending NBFC's authorized service accounts.

### 3. Banking & NPCI Disbursement / NACH Mandate Rails
- **Status in Staging**: Simulated UTR numbers and transaction records labeled as `(Simulated UTR - Demo)`.
- **Production Requirement**: Direct corporate banking node integration (ICICI/HDFC Corporate CMS / RazorpayX API) for direct IMPS/NEFT disbursements from NBFC escrow, and NPCI e-NACH/UPI Autopay mandate sponsorship.

### 4. HRMS Production OAuth2 Integrations
- **Status in Staging**: Simulated Keka connector operating in sandbox mode.
- **Production Requirement**: Client-approved OAuth2 provider credentials and corporate API access keys from Keka, Darwinbox, or GreytHR.

> [!IMPORTANT]
> **Zero Custody of Funds Compliance**: Dada Advisory operates strictly as a digital Lending Service Provider (LSP). In production, all fund movements occur directly between NBFC lending accounts and borrower bank accounts. Dada Advisory never touches, holds, or pools customer funds.
