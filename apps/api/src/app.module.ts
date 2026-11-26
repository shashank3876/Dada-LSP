import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { SalaryModule } from './modules/salary/salary.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CorporatePoliciesModule } from './modules/corporate-policies/corporate-policies.module';
import { EligibilityModule } from './modules/eligibility/eligibility.module';
import { EwaModule } from './modules/ewa/ewa.module';
import { PayrollLoansModule } from './modules/payroll-loans/payroll-loans.module';
import { LoanApplicationsModule } from './modules/loan-applications/loan-applications.module';
import { NbfcModule } from './modules/nbfc/nbfc.module';
import { KycModule } from './modules/kyc/kyc.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { HrmsModule } from './modules/hrms/hrms.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    OrganizationsModule,
    EmployeesModule,
    SalaryModule,
    AttendanceModule,
    CorporatePoliciesModule,
    EligibilityModule,
    EwaModule,
    PayrollLoansModule,
    LoanApplicationsModule,
    NbfcModule,
    KycModule,
    PayrollModule,
    ReconciliationModule,
    ReportsModule,
    AuditModule,
    HrmsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
