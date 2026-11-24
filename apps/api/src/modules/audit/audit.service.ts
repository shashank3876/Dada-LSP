import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};
    return this.prisma.auditEvent.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true, role: true } },
        organization: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
