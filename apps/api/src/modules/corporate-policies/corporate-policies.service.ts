import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CorporatePoliciesService {
  constructor(private prisma: PrismaService) {}

  async findByOrganization(organizationId: string) {
    const policy = await this.prisma.corporatePolicy.findFirst({
      where: { organizationId, isActive: true },
      include: { organization: true },
    });
    if (!policy) throw new NotFoundException('Corporate policy not configured');
    return policy;
  }

  async findAll() {
    return this.prisma.corporatePolicy.findMany({
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePolicy(organizationId: string, data: any) {
    const existing = await this.prisma.corporatePolicy.findFirst({
      where: { organizationId },
    });
    if (existing) {
      return this.prisma.corporatePolicy.update({
        where: { id: existing.id },
        data,
      });
    }
    return this.prisma.corporatePolicy.create({
      data: { ...data, organizationId },
    });
  }
}
