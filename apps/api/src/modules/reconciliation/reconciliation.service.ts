import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ReconciliationExceptionType } from '@dada/contracts';

@Injectable()
export class ReconciliationService {
  constructor(private prisma: PrismaService) {}

  async getRemittances(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};
    return this.prisma.employerRemittance.findMany({
      where,
      include: {
        organization: { select: { name: true, code: true } },
        nbfcPartner: true,
        payrollBatch: true,
        reconciliations: { include: { exceptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExceptions() {
    return this.prisma.reconciliationException.findMany({
      include: {
        reconciliationRecord: {
          include: {
            employerRemittance: { include: { organization: true, nbfcPartner: true } },
          },
        },
        payrollBatchItem: {
          include: {
            employee: true,
            loan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveException(id: string, notes: string) {
    const exc = await this.prisma.reconciliationException.findUnique({ where: { id } });
    if (!exc) throw new NotFoundException('Exception record not found');

    return this.prisma.reconciliationException.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: notes,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Upload Remittance from HR and perform automated reconciliation
   */
  async uploadRemittance(data: {
    payrollBatchId: string;
    utrNumber: string;
    remittedAmountPaise: number;
    notes?: string;
  }) {
    const batch = await this.prisma.payrollBatch.findUnique({
      where: { id: data.payrollBatchId },
      include: { items: { include: { loan: true, employee: true } }, organization: true },
    });

    if (!batch) throw new NotFoundException('Payroll batch not found');

    const nbfc = await this.prisma.nBFCPartner.findFirst({ where: { isActive: true } });

    const remittance = await this.prisma.employerRemittance.create({
      data: {
        organizationId: batch.organizationId,
        payrollBatchId: batch.id,
        nbfcPartnerId: nbfc?.id || 'APEX_CAPITAL',
        utrNumber: data.utrNumber,
        remittedAmountPaise: data.remittedAmountPaise,
        remittanceDate: new Date(),
        status: data.remittedAmountPaise === batch.totalDuePaise ? 'MATCHED' : 'MISMATCH',
        notes: data.notes,
      },
    });

    // Perform reconciliation matching
    const isExactMatch = data.remittedAmountPaise === batch.totalDuePaise;
    const diffPaise = Math.abs(data.remittedAmountPaise - batch.totalDuePaise);

    const recon = await this.prisma.reconciliationRecord.create({
      data: {
        employerRemittanceId: remittance.id,
        expectedAmountPaise: batch.totalDuePaise,
        actualAmountPaise: data.remittedAmountPaise,
        matchedCount: isExactMatch ? batch.items.length : batch.items.length - 1,
        exceptionCount: isExactMatch ? 0 : 1,
        status: isExactMatch ? 'RECONCILED' : 'RECONCILED_WITH_EXCEPTIONS',
        notes: isExactMatch
          ? 'Remitted amount perfectly matches total batch obligation.'
          : `Variance of ₹${diffPaise / 100} detected. Created reconciliation exception for HR review.`,
      },
    });

    if (!isExactMatch && batch.items.length > 0) {
      await this.prisma.reconciliationException.create({
        data: {
          reconciliationRecordId: recon.id,
          payrollBatchItemId: batch.items[0].id,
          exceptionType: ReconciliationExceptionType.PARTIAL_DEDUCTION,
          expectedPaise: batch.items[0].dueAmountPaise,
          actualPaise: Math.max(0, batch.items[0].dueAmountPaise - diffPaise),
          status: 'OPEN',
          resolutionNotes: `Remittance amount variance: Expected ₹${batch.totalDuePaise / 100}, but received ₹${data.remittedAmountPaise / 100}.`,
        },
      });
    }

    await this.prisma.payrollBatch.update({
      where: { id: batch.id },
      data: {
        status: isExactMatch ? 'RECONCILED' : 'RECONCILED_WITH_EXCEPTIONS',
        reconciledAt: new Date(),
      },
    });

    return {
      success: true,
      remittance,
      reconciliation: recon,
      message: isExactMatch
        ? 'Remittance UTR verified and matched. Batch reconciled.'
        : 'Remittance uploaded. Mismatch detected; flagged for review.',
    };
  }
}
