import { AllocationWaterfallModel, AllocationWaterfallPolicy, PROVISIONAL_WATERFALL_POLICY } from '../types';

/**
 * Employer Remittance Ingestion, Matching and Exception Management Engine
 * 
 * Rules:
 * 1. Exact match remittance verification.
 * 2. NBFC-Approved Allocation Waterfall for partial remittances (Pro-rata or Seniority).
 * 3. Over-remittance detection with variance tracking.
 * 4. Duplicate UTR / remittance deduplication.
 * 5. Settlement Authority: Uploaded remittance registers employer deduction only;
 *    NBFC loan confirmation remains authoritative for loan closure.
 */
export class ReconciliationEngine {
  constructor(
    private prisma: any,
    private waterfallPolicy: AllocationWaterfallPolicy = PROVISIONAL_WATERFALL_POLICY,
  ) {}

  async reconcileRemittance(remittanceId: string): Promise<{
    reconciliationId: string;
    status: 'RECONCILED' | 'RECONCILED_WITH_EXCEPTIONS' | 'FAILED';
    matchedCount: number;
    exceptionCount: number;
    variancePaise: number;
  }> {
    const remittance = await this.prisma.employerRemittance.findUnique({
      where: { id: remittanceId },
      include: {
        payrollBatch: {
          include: {
            items: {
              include: { employee: true, loan: true },
            },
          },
        },
      },
    });

    if (!remittance) {
      throw new Error(`Remittance ${remittanceId} not found`);
    }

    const batch = remittance.payrollBatch;
    if (!batch) {
      throw new Error(`Payroll batch for remittance ${remittanceId} not found`);
    }

    // 1. Duplicate Remittance / UTR Check
    const existingUtrMatch = await this.prisma.employerRemittance.findFirst({
      where: {
        utrNumber: remittance.utrNumber,
        status: 'MATCHED',
        id: { not: remittance.id },
      },
    });

    if (existingUtrMatch) {
      // Flag duplicate remittance exception
      const ex = await this.prisma.reconciliationException.create({
        data: {
          exceptionType: 'DUPLICATE_REMITTANCE',
          expectedPaise: 0,
          actualPaise: remittance.remittedAmountPaise,
          status: 'OPEN',
          resolutionNotes: `Duplicate UTR detected: ${remittance.utrNumber} was already reconciled with remittance ${existingUtrMatch.id}. Funds must not be double-credited.`,
        },
      });

      const rec = await this.prisma.reconciliationRecord.create({
        data: {
          employerRemittanceId: remittance.id,
          expectedAmountPaise: batch.totalDuePaise,
          actualAmountPaise: remittance.remittedAmountPaise,
          matchedCount: 0,
          exceptionCount: 1,
          status: 'RECONCILED_WITH_EXCEPTIONS',
          reconciledByRole: 'SYSTEM',
          notes: 'Duplicate UTR remittance flagged for operator review.',
        },
      });

      await this.prisma.employerRemittance.update({
        where: { id: remittance.id },
        data: { status: 'MISMATCH', notes: 'Duplicate UTR detected.' },
      });

      return {
        reconciliationId: rec.id,
        status: 'RECONCILED_WITH_EXCEPTIONS',
        matchedCount: 0,
        exceptionCount: 1,
        variancePaise: remittance.remittedAmountPaise,
      };
    }

    const items = batch.items;
    const totalExpectedPaise = items.reduce((sum: number, it: any) => sum + it.dueAmountPaise, 0);
    const remittedPaise = remittance.remittedAmountPaise;
    const variancePaise = remittedPaise - totalExpectedPaise;

    let matchedCount = 0;
    let exceptionCount = 0;
    const createdExceptionIds: string[] = [];

    // Exact Match Scenario
    if (remittedPaise === totalExpectedPaise) {
      for (const item of items) {
        await this.prisma.payrollBatchItem.update({
          where: { id: item.id },
          data: {
            deductedAmountPaise: item.dueAmountPaise,
            status: 'DEDUCTED',
          },
        });
        matchedCount++;
      }

      await this.prisma.employerRemittance.update({
        where: { id: remittance.id },
        data: { status: 'MATCHED', notes: 'Full batch remittance verified and matched.' },
      });

      await this.prisma.payrollBatch.update({
        where: { id: batch.id },
        data: {
          status: 'RECONCILED',
          totalDeductedPaise: totalExpectedPaise,
          reconciledAt: new Date(),
        },
      });

      const rec = await this.prisma.reconciliationRecord.create({
        data: {
          employerRemittanceId: remittance.id,
          expectedAmountPaise: totalExpectedPaise,
          actualAmountPaise: remittedPaise,
          matchedCount,
          exceptionCount: 0,
          status: 'RECONCILED',
          reconciledByRole: 'SYSTEM',
          notes: `Batch ${batch.batchNumber} fully reconciled with UTR ${remittance.utrNumber}.`,
        },
      });

      return {
        reconciliationId: rec.id,
        status: 'RECONCILED',
        matchedCount,
        exceptionCount: 0,
        variancePaise: 0,
      };
    }

    // Partial / Under-remittance Scenario
    if (remittedPaise < totalExpectedPaise) {
      if (this.waterfallPolicy.model === AllocationWaterfallModel.PRO_RATA_EQUAL) {
        // Model 1: Pro-Rata Equal Allocation Waterfall (Fairest non-discriminatory distribution)
        let totalAllocated = 0;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // Proportional allocation: Math.floor(itemDue * (remitted / totalDue))
          let allocatedPaise = Math.floor(item.dueAmountPaise * (remittedPaise / totalExpectedPaise));

          // Allocate any rounding difference to last item
          if (i === items.length - 1) {
            allocatedPaise = remittedPaise - totalAllocated;
          }
          totalAllocated += allocatedPaise;

          const shortfallPaise = item.dueAmountPaise - allocatedPaise;

          await this.prisma.payrollBatchItem.update({
            where: { id: item.id },
            data: {
              deductedAmountPaise: allocatedPaise,
              status: allocatedPaise > 0 ? 'PARTIAL' : 'FAILED',
              remarks: `Pro-Rata Partial Deduction: Received ₹${(allocatedPaise / 100).toFixed(2)}, Shortfall ₹${(shortfallPaise / 100).toFixed(2)}. ${this.waterfallPolicy.disclaimer}`,
            },
          });

          const ex = await this.prisma.reconciliationException.create({
            data: {
              payrollBatchItemId: item.id,
              exceptionType: 'PARTIAL_DEDUCTION',
              expectedPaise: item.dueAmountPaise,
              actualPaise: allocatedPaise,
              status: 'OPEN',
              resolutionNotes: `Pro-rata remittance shortfall for ${item.employee?.employeeCode || 'Employee'}: Shortfall ₹${(shortfallPaise / 100).toFixed(2)}. Requires top-up remittance or secondary NACH debit.`,
            },
          });
          createdExceptionIds.push(ex.id);
          exceptionCount++;
          if (allocatedPaise > 0) matchedCount++;
        }
      } else {
        // Model 2: Seniority Waterfall (EWA bullet dues first, then oldest Term Loan EMIs)
        const sortedItems = [...items].sort((a: any, b: any) => {
          if (a.productType === 'EWA' && b.productType !== 'EWA') return -1;
          if (b.productType === 'EWA' && a.productType !== 'EWA') return 1;
          return a.dueAmountPaise - b.dueAmountPaise;
        });

        let remainingToAllocate = remittedPaise;

        for (const item of sortedItems) {
          if (remainingToAllocate >= item.dueAmountPaise) {
            await this.prisma.payrollBatchItem.update({
              where: { id: item.id },
              data: {
                deductedAmountPaise: item.dueAmountPaise,
                status: 'DEDUCTED',
              },
            });
            remainingToAllocate -= item.dueAmountPaise;
            matchedCount++;
          } else if (remainingToAllocate > 0) {
            const partialPaise = remainingToAllocate;
            const shortfallPaise = item.dueAmountPaise - partialPaise;

            await this.prisma.payrollBatchItem.update({
              where: { id: item.id },
              data: {
                deductedAmountPaise: partialPaise,
                status: 'PARTIAL',
                remarks: `Seniority waterfall partial deduction: Shortfall ₹${(shortfallPaise / 100).toFixed(2)}`,
              },
            });

            const ex = await this.prisma.reconciliationException.create({
              data: {
                payrollBatchItemId: item.id,
                exceptionType: 'PARTIAL_DEDUCTION',
                expectedPaise: item.dueAmountPaise,
                actualPaise: partialPaise,
                status: 'OPEN',
                resolutionNotes: `Seniority shortfall for ${item.employee?.employeeCode}: Shortfall ₹${(shortfallPaise / 100).toFixed(2)}.`,
              },
            });
            createdExceptionIds.push(ex.id);
            exceptionCount++;
            remainingToAllocate = 0;
          } else {
            const exType = item.employee?.employmentStatus === 'TERMINATED' ? 'EMPLOYEE_RESIGNED' : 'FAILED_DEDUCTION';

            await this.prisma.payrollBatchItem.update({
              where: { id: item.id },
              data: {
                deductedAmountPaise: 0,
                status: 'FAILED',
                remarks: `Unfunded obligation under seniority waterfall. Shortfall ₹${(item.dueAmountPaise / 100).toFixed(2)}`,
              },
            });

            const ex = await this.prisma.reconciliationException.create({
              data: {
                payrollBatchItemId: item.id,
                exceptionType: exType,
                expectedPaise: item.dueAmountPaise,
                actualPaise: 0,
                status: 'OPEN',
                resolutionNotes: `Zero funds allocated under seniority waterfall for ${item.employee?.employeeCode}.`,
              },
            });
            createdExceptionIds.push(ex.id);
            exceptionCount++;
          }
        }
      }

      await this.prisma.employerRemittance.update({
        where: { id: remittance.id },
        data: {
          status: 'MISMATCH',
          notes: `Under-remittance: Shortfall ₹${Math.abs(variancePaise / 100).toFixed(2)}. ${this.waterfallPolicy.disclaimer}`,
        },
      });

      await this.prisma.payrollBatch.update({
        where: { id: batch.id },
        data: {
          status: 'RECONCILED_WITH_EXCEPTIONS',
          totalDeductedPaise: remittedPaise,
          reconciledAt: new Date(),
        },
      });

      const rec = await this.prisma.reconciliationRecord.create({
        data: {
          employerRemittanceId: remittance.id,
          expectedAmountPaise: totalExpectedPaise,
          actualAmountPaise: remittedPaise,
          matchedCount,
          exceptionCount,
          status: 'RECONCILED_WITH_EXCEPTIONS',
          reconciledByRole: 'SYSTEM',
          notes: `Under-remittance variance ₹${Math.abs(variancePaise / 100).toFixed(2)}. ${this.waterfallPolicy.disclaimer}`,
        },
      });

      return {
        reconciliationId: rec.id,
        status: 'RECONCILED_WITH_EXCEPTIONS',
        matchedCount,
        exceptionCount,
        variancePaise,
      };
    }

    // Over-remittance Scenario (remittedPaise > totalExpectedPaise)
    for (const item of items) {
      await this.prisma.payrollBatchItem.update({
        where: { id: item.id },
        data: {
          deductedAmountPaise: item.dueAmountPaise,
          status: 'DEDUCTED',
        },
      });
      matchedCount++;
    }

    const ex = await this.prisma.reconciliationException.create({
      data: {
        exceptionType: 'UNMATCHED_UTR',
        expectedPaise: totalExpectedPaise,
        actualPaise: remittedPaise,
        status: 'OPEN',
        resolutionNotes: `Over-remittance detected: Employer remitted ₹${(variancePaise / 100).toFixed(2)} excess over total due batch obligations. Excess held in employer suspense account for refund or next-cycle credit.`,
      },
    });

    await this.prisma.employerRemittance.update({
      where: { id: remittance.id },
      data: {
        status: 'MISMATCH',
        notes: `Over-remittance: Excess of ₹${(variancePaise / 100).toFixed(2)}`,
      },
    });

    await this.prisma.payrollBatch.update({
      where: { id: batch.id },
      data: {
        status: 'RECONCILED_WITH_EXCEPTIONS',
        totalDeductedPaise: totalExpectedPaise,
        reconciledAt: new Date(),
      },
    });

    const rec = await this.prisma.reconciliationRecord.create({
      data: {
        employerRemittanceId: remittance.id,
        expectedAmountPaise: totalExpectedPaise,
        actualAmountPaise: remittedPaise,
        matchedCount,
        exceptionCount: 1,
        status: 'RECONCILED_WITH_EXCEPTIONS',
        reconciledByRole: 'SYSTEM',
        notes: `Over-remittance variance ₹${(variancePaise / 100).toFixed(2)}. Excess recorded in exception ledger.`,
      },
    });

    return {
      reconciliationId: rec.id,
      status: 'RECONCILED_WITH_EXCEPTIONS',
      matchedCount,
      exceptionCount: 1,
      variancePaise,
    };
  }
}
