import { Module } from '@nestjs/common';
import { EwaService } from './ewa.service';
import { EwaController } from './ewa.controller';
import { EligibilityModule } from '../eligibility/eligibility.module';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [EligibilityModule],
  controllers: [EwaController],
  providers: [EwaService, PrismaService],
  exports: [EwaService],
})
export class EwaModule {}
