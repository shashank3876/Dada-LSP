/**
 * Automated Payroll Batch Generation and Cycle Locking Engine
 * 
 * Rules:
 * 1. Automatically compiles active EWA and Payroll Loan obligations for the cycle.
 * 2. Idempotent: enforces @@unique([organizationId, year, month]) to prevent duplicate batches.
 * 3. Enforces payroll cutoff freezing for new EWA applications.
 * 4. Locks the batch for export to employer HR/payroll systems.
 */
export class PayrollCutoffJob {
  constructor(private prisma: any) {}

  async processCutoffBatches(currentDay?: number, targetMonth?: number, targetYear?: number): Promise<{
    batchesCreated: number;
    batchesLocked: number;
    totalDeductionsCompiledPaise: number;
  }> {
    const now = new Date();
    const day = currentDay || now.getDate();
    const month = targetMonth || now.getMonth() + 1;
    const year = targetYear || now.getFullYear();

    const organizations = await this.prisma.organization.findMany({
      where: { isActive: true },
      include: {
        policies: { where: { isActive: true }, take: 1 },
      },
    });

    let batchesCreated = 0;
    let batchesLocked = 0;
    let totalDeductionsCompiledPaise = 0;

    for (const org of organizations) {
      const policy = org.policies?.[0] || { payrollCutoffDay: 25 };

      // Check if cutoff has been reached
      if (day < policy.payrollCutoffDay) {
        continue;
      }

      // Check if batch already exists for this cycle (idempotency check)
      let batch = await this.prisma.payrollBatch.findUnique({
        where: {
          organizationId_year_month: {
            organizationId: org.id,
            year,
            month,
          },
        },
        include: { items: true },
      });

      if (!batch) {
        // Find all active loans that have scheduled dues for this cycle
        const activeLoans = await this.prisma.loan.findMany({
          where: {
            status: 'ACTIVE',
            employee: { organizationId: org.id },
          },
          include: {
            employee: true,
            repaymentSchedules: {
              where: {
                status: 'PENDING',
              },
              take: 1,
            },
          },
        });

        if (activeLoans.length === 0) {
          continue;
        }

        const cutoffDate = new Date(year, month - 1, policy.payrollCutoffDay);
        const batchNumber = `PB-${org.code || 'ORG'}-${year}${String(month).padStart(2, '0')}-001`;

        // Calculate total due
        let totalDuePaise = 0;
        const itemsToCreate: any[] = [];

        for (const loan of activeLoans) {
          let dueAmountPaise = 0;
          if (loan.productType === 'EWA') {
            // EWA is bullet repaid at end of cycle: full outstanding
            dueAmountPaise = loan.outstandingPaise;
          } else {
            // Payroll Loan: next monthly EMI
            const schedule = loan.repaymentSchedules?.[0];
            dueAmountPaise = schedule ? schedule.totalDuePaise : loan.monthlyEmiPaise;
          }

          if (dueAmountPaise > 0) {
            totalDuePaise += dueAmountPaise;
            itemsToCreate.push({
              employeeId: loan.employeeId,
              loanId: loan.id,
              productType: loan.productType,
              dueAmountPaise,
              deductedAmountPaise: 0,
              status: 'PENDING',
            });
          }
        }

        if (itemsToCreate.length === 0) {
          continue;
        }

        try {
          batch = await this.prisma.$transaction(async (tx: any) => {
            const createdBatch = await tx.payrollBatch.create({
              data: {
                batchNumber,
                organizationId: org.id,
                month,
                year,
                cutoffDate,
                totalEmployees: itemsToCreate.length,
                totalDuePaise,
                status: 'GENERATED',
                generatedAt: new Date(),
                items: {
                  create: itemsToCreate,
                },
              },
              include: { items: true },
            });

            // Transactional Outbox: Event committed atomically with financial batch!
            await tx.outboxEvent.create({
              data: {
                topic: 'payroll.batch.generated',
                payloadJson: JSON.stringify({
                  data: {
                    batchId: createdBatch.id,
                    batchNumber: createdBatch.batchNumber,
                    organizationId: org.id,
                    year,
                    month,
                    totalDuePaise: createdBatch.totalDuePaise,
                    totalEmployees: createdBatch.totalEmployees,
                  },
                }),
                status: 'PENDING',
              },
            });

            return createdBatch;
          });
          batchesCreated++;
          totalDeductionsCompiledPaise += totalDuePaise;
        } catch (err: any) {
          // If concurrent worker execution created it, fetch the existing one safely
          if (err.code === 'P2002') {
            batch = await this.prisma.payrollBatch.findUnique({
              where: {
                organizationId_year_month: {
                  organizationId: org.id,
                  year,
                  month,
                },
              },
              include: { items: true },
            });
          } else {
            throw err;
          }
        }
      }

      // If batch is in GENERATED status, transition to EXPORTED (locked for payroll) with outbox event
      if (batch && batch.status === 'GENERATED') {
        await this.prisma.$transaction(async (tx: any) => {
          await tx.payrollBatch.update({
            where: { id: batch.id },
            data: {
              status: 'EXPORTED',
              exportedAt: new Date(),
            },
          });

          await tx.outboxEvent.create({
            data: {
              topic: 'payroll.batch.exported',
              payloadJson: JSON.stringify({
                data: {
                  batchId: batch.id,
                  batchNumber: batch.batchNumber,
                  organizationId: org.id,
                  year,
                  month,
                  status: 'EXPORTED',
                },
              }),
              status: 'PENDING',
            },
          });
        });
        batchesLocked++;
      }
    }

    return {
      batchesCreated,
      batchesLocked,
      totalDeductionsCompiledPaise,
    };
  }
}
