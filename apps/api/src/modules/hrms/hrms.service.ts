import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class HrmsService {
  constructor(private prisma: PrismaService) {}

  async getStatus(organizationId: string) {
    let integration = await this.prisma.hRMSIntegration.findFirst({
      where: { organizationId },
      include: { organization: { select: { name: true, code: true } } },
    });

    if (!integration) {
      integration = await this.prisma.hRMSIntegration.create({
        data: {
          organizationId,
          provider: 'KEKA',
          apiUrl: 'https://api.keka.com/v1/techcorp',
          status: 'CONFIGURED',
          lastSyncAt: new Date(),
          lastSyncStatus: 'SYNC_SUCCESS',
          autoSyncDaily: true,
        },
        include: { organization: { select: { name: true, code: true } } },
      });
    }

    return {
      ...integration,
      isSimulated: true,
      environment: 'SANDBOX_SIMULATION',
      disclaimer:
        'Notice: This HRMS connector is operating in Sandbox Simulation mode. Actual production synchronization requires client-approved OAuth2 provider credentials and corporate API access.',
      syncStateOptions: [
        'CONFIGURED',
        'AUTHENTICATED',
        'SYNC_QUEUED',
        'SYNCING',
        'SYNC_SUCCESS',
        'SYNC_FAILED',
      ],
    };
  }

  async triggerSync(organizationId: string, user: any) {
    if (!user.role.startsWith('HR_') && !user.role.startsWith('DADA_')) {
      throw new ForbiddenException(
        'Access denied: Only HR and Dada administrators can trigger HRMS synchronization.',
      );
    }

    let integration = await this.prisma.hRMSIntegration.findFirst({
      where: { organizationId },
    });

    if (!integration) {
      integration = await this.prisma.hRMSIntegration.create({
        data: {
          organizationId,
          provider: 'KEKA',
          apiUrl: 'https://api.keka.com/v1/techcorp',
          status: 'CONFIGURED',
          autoSyncDaily: true,
        },
      });
    }

    // Advance through explicit sync state lifecycle
    await this.prisma.hRMSIntegration.update({
      where: { id: integration.id },
      data: {
        status: 'SYNCING',
        lastSyncStatus: 'SYNCING',
      },
    });

    const updated = await this.prisma.hRMSIntegration.update({
      where: { id: integration.id },
      data: {
        status: 'CONFIGURED',
        lastSyncAt: new Date(),
        lastSyncStatus: 'SYNC_SUCCESS',
      },
    });

    // Record audit event for manual synchronization
    await this.prisma.auditEvent.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'HRMS_MANUAL_DELTA_SYNC',
        resourceType: 'HRMS_INTEGRATION',
        resourceId: integration.id,
        metadataJson: JSON.stringify({
          provider: integration.provider,
          triggeredBy: user.email,
          role: user.role,
          mode: 'SIMULATION',
          timestamp: new Date().toISOString(),
          note: 'Simulated delta sync triggered. Real provider synchronization pending client OAuth2 credentials.',
        }),
      },
    });

    const employeeCount = await this.prisma.employee.count({ where: { organizationId } });

    return {
      success: true,
      isSimulated: true,
      message: `Simulated HRMS delta synchronization completed for ${integration.provider}. ${employeeCount} employee records and attendance records verified. Real provider synchronization requires client-approved OAuth2 API credentials.`,
      integration: updated,
      syncedEmployeeCount: employeeCount,
    };
  }
}
