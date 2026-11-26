# Dada Advisory — Production Database Migration & Rollback Runbook

## 1. Statutory Policy & Governance

> [!CAUTION]
> `prisma db push` is strictly prohibited in staging, UAT, and production environments. All schema evolutions must be version-controlled, reviewed, tested on staging, and deployed strictly through `prisma migrate deploy`.

### Key Principles
1. **Zero Data Loss**: Schema evolutions must never drop columns containing financial, KYC, or audit records without an explicit multi-phase deprecation cycle.
2. **Pre-Deployment Snapshot**: An encrypted, point-in-time database snapshot (`pg_dump`) must be verified prior to executing any production migration.
3. **Idempotent Migrations**: Migrations must be transactionally safe and reversible.

---

## 2. Pre-Migration Checklist

Before triggering a deployment pipeline:
- [ ] Staging verification: Migration has succeeded on a replica staging database with mock production load.
- [ ] Database backup completed and verified.
- [ ] Active background workers paused or drained to prevent lock contention.
- [ ] Rollback script verified and staged.

---

## 3. Automated Backup Procedure

Execute a full pre-deployment snapshot prior to applying migrations:

```bash
# 1. Set environment variables
export TIMESTAMP=$(date +%Y%m%d_%H%M%S)
export BACKUP_DIR="/secure/backups/dada-advisory"
export BACKUP_FILE="${BACKUP_DIR}/dada_prod_backup_${TIMESTAMP}.sql.gz"

# 2. Execute pg_dump with compression
pg_dump "$DATABASE_URL" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-acl \
  --verbose \
  | gzip > "$BACKUP_FILE"

# 3. Verify backup file integrity
ls -lh "$BACKUP_FILE"
gunzip -t "$BACKUP_FILE" && echo "Backup verified successfully."
```

---

## 4. Migration Execution

Apply migrations using the official Prisma CLI:

```bash
# In the database package directory:
cd packages/database

# Run production migration deploy
pnpm prisma migrate deploy
```

`prisma migrate deploy` will:
- Read `_prisma_migrations` table in PostgreSQL.
- Detect any unapplied migrations in `prisma/migrations/`.
- Apply pending SQL scripts in strict lexical/timestamp order.
- Terminate with exit code `0` on success, or exit code `1` on failure (aborting the release pipeline).

---

## 5. Rollback & Disaster Recovery Procedures

### Scenario A: Migration Failed During Execution
If a migration fails mid-execution:
1. Identify the failed migration:
   ```bash
   npx prisma migrate status
   ```
2. Revert the database to the pre-deployment snapshot:
   ```bash
   gunzip -c "$BACKUP_FILE" | pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL"
   ```
3. Mark the migration as rolled back in Prisma metadata:
   ```bash
   npx prisma migrate resolve --rolled-back "20261126000000_failed_migration_name"
   ```

### Scenario B: Application Failure Post-Migration (Zero-Downtime Rollback)
When schema changes follow the **Expand/Contract** design pattern:
1. **Expand Phase**: Add new optional columns or tables without altering existing contracts.
2. **Deploy Code**: Deploy application version utilizing new columns.
3. **Rollback**: If application fails, rollback the application container; the database schema remains fully compatible with the previous application container version.
4. **Contract Phase**: Drop deprecated legacy columns in a subsequent release after verification.

---

## 6. Migration Inventory

| Migration ID | Description | Applied Date | Reversible |
| :--- | :--- | :--- | :--- |
| `20261126000000_init` | Baseline schema: Multi-tenant organizations, employees, loan applications, loans, repayments, attendance, corporate policies, remittances, and outbox ledger. | 2026-11-26 | Yes |
