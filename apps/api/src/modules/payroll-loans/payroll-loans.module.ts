import { Module } from '@nestjs/common';
import { PayrollLoansService } from './payroll-loans.service';
import { PayrollLoansController } from './payroll-loans.controller';
import { EligibilityModule } from '../eligibility/eligibility.module';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [EligibilityModule],
  controllers: [PayrollLoansController],
  providers: [PayrollLoansService, PrismaService],
  exports: [PayrollLoansService],
})
export class PayrollLoansModule {}
