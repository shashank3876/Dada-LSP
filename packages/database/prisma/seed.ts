import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dada Advisory database with realistic demonstration data...');

  // Clean existing data
  await prisma.reconciliationException.deleteMany();
  await prisma.reconciliationRecord.deleteMany();
  await prisma.employerRemittance.deleteMany();
  await prisma.payrollBatchItem.deleteMany();
  await prisma.payrollBatch.deleteMany();
  await prisma.repaymentAllocation.deleteMany();
  await prisma.repayment.deleteMany();
  await prisma.repaymentSchedule.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.eWAApplication.deleteMany();
  await prisma.payrollLoanApplication.deleteMany();
  await prisma.loanApplication.deleteMany();
  await prisma.mandate.deleteMany();
  await prisma.kYCRecord.deleteMany();
  await prisma.document.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.salaryRecord.deleteMany();
  await prisma.employmentRecord.deleteMany();
  await prisma.eligibilitySnapshot.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.hRMSIntegration.deleteMany();
  await prisma.corporatePolicy.deleteMany();
  await prisma.nBFCPartner.deleteMany();
  await prisma.organization.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('DadaDemo@2026', 10);

  // 1. Create Organization
  const techCorp = await prisma.organization.create({
    data: {
      code: 'TECHCORP',
      name: 'TechCorp Solutions India Pvt Ltd',
      cinNumber: 'U72200MH2018PTC312456',
      registeredAddress: 'Level 8, Tower B, Godrej IT Park, Vikhroli West, Mumbai - 400079',
      domain: 'techcorp.in',
      isActive: true,
    },
  });

  // 2. Create Corporate Policy
  await prisma.corporatePolicy.create({
    data: {
      organizationId: techCorp.id,
      maxEwaPercentage: 50,
      minEwaWithdrawalPaise: 100000, // Rs 1,000
      maxEwaWithdrawalPaise: 5000000, // Rs 50,000
      maxEwaWithdrawalsPerCycle: 2,
      payrollCutoffDay: 25,
      ewaFeePaise: 9900, // Rs 99
      allowPayrollLoans: true,
      salaryMultiplier: 3,
      minTenureMonths: 6,
      maxTenureMonths: 24,
      annualInterestRatePercent: 14.5,
      processingFeePercent: 1.5,
      maxFoirPercent: 50,
    },
  });

  // 3. Create HRMS Integration
  await prisma.hRMSIntegration.create({
    data: {
      organizationId: techCorp.id,
      provider: 'KEKA',
      apiUrl: 'https://api.keka.com/v1/techcorp',
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      lastSyncStatus: 'SUCCESS',
      autoSyncDaily: true,
    },
  });

  // 4. Create NBFC Partner
  const apexNbfc = await prisma.nBFCPartner.create({
    data: {
      code: 'APEX_CAPITAL',
      name: 'Apex Capital Finance Limited (NBFC-ICC)',
      apiUrl: 'https://api.apexcapitalnbfc.in/v2',
      webhookSecret: 'apex_webhook_mock_secret_key_2026',
      supportedProducts: 'EWA,PAYROLL_LOAN',
      isActive: true,
    },
  });

  // 5. Create Dada Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dadaadvisory.com',
      fullName: 'Aakash Verma (Dada Admin)',
      phoneNumber: '+919876543200',
      passwordHash: defaultPasswordHash,
      role: 'DADA_ADMIN',
      isActive: true,
    },
  });

  // 6. Create HR Admin User
  const hrAdminUser = await prisma.user.create({
    data: {
      email: 'hr.admin@techcorp.in',
      fullName: 'Rohini Sen (Head of HR)',
      phoneNumber: '+919876543201',
      passwordHash: defaultPasswordHash,
      role: 'HR_ADMIN',
      organizationId: techCorp.id,
      isActive: true,
    },
  });

  // 7. Create HR Operator User
  await prisma.user.create({
    data: {
      email: 'hr.ops@techcorp.in',
      fullName: 'Vikas Nair (HR Operations)',
      phoneNumber: '+919876543202',
      passwordHash: defaultPasswordHash,
      role: 'HR_OPERATOR',
      organizationId: techCorp.id,
      isActive: true,
    },
  });

  // 8. Create Employees
  const employeeData = [
    {
      code: 'TC-1001',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.k@techcorp.in',
      phone: '+919820011001',
      pan: 'ABCDE1234F',
      aadhaar: 'XXXX-XXXX-8901',
      dob: '1992-05-14',
      gender: 'MALE',
      dept: 'Engineering',
      desig: 'Lead Software Engineer',
      salaryNet: 7500000, // Rs 75,000
      salaryGross: 8800000, // Rs 88,000
      basic: 4400000,
      hra: 2200000,
      allowance: 2200000,
      pf: 528000,
      tax: 772000,
      status: 'CONFIRMED',
      workedDays: 20,
      totalDays: 30,
    },
    {
      code: 'TC-1002',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.s@techcorp.in',
      phone: '+919820011002',
      pan: 'BKZPS5678K',
      aadhaar: 'XXXX-XXXX-4512',
      dob: '1995-11-20',
      gender: 'FEMALE',
      dept: 'Product Management',
      desig: 'Senior Product Manager',
      salaryNet: 9200000, // Rs 92,000
      salaryGross: 11000000,
      basic: 5500000,
      hra: 2750000,
      allowance: 2750000,
      pf: 660000,
      tax: 1140000,
      status: 'CONFIRMED',
      workedDays: 22,
      totalDays: 30,
    },
    {
      code: 'TC-1003',
      firstName: 'Amit',
      lastName: 'Verma',
      email: 'amit.v@techcorp.in',
      phone: '+919820011003',
      pan: 'CRDPV9012M',
      aadhaar: 'XXXX-XXXX-3344',
      dob: '1989-02-18',
      gender: 'MALE',
      dept: 'Operations',
      desig: 'Operations Specialist',
      salaryNet: 4500000, // Rs 45,000
      salaryGross: 5200000,
      basic: 2600000,
      hra: 1300000,
      allowance: 1300000,
      pf: 312000,
      tax: 388000,
      status: 'NOTICE_PERIOD', // Zero eligibility demo
      workedDays: 18,
      totalDays: 30,
    },
    {
      code: 'TC-1004',
      firstName: 'Sunita',
      lastName: 'Mehra',
      email: 'sunita.m@techcorp.in',
      phone: '+919820011004',
      pan: 'DXPMS3456N',
      aadhaar: 'XXXX-XXXX-7788',
      dob: '1994-08-05',
      gender: 'FEMALE',
      dept: 'Design',
      desig: 'Senior UX Designer',
      salaryNet: 6500000, // Rs 65,000
      salaryGross: 7600000,
      basic: 3800000,
      hra: 1900000,
      allowance: 1900000,
      pf: 456000,
      tax: 644000,
      status: 'CONFIRMED',
      workedDays: 19,
      totalDays: 30,
    },
  ];

  const createdEmployees: any[] = [];

  for (const emp of employeeData) {
    const employee = await prisma.employee.create({
      data: {
        organizationId: techCorp.id,
        employeeCode: emp.code,
        firstName: emp.firstName,
        lastName: emp.lastName,
        officialEmail: emp.email,
        mobileNumber: emp.phone,
        panNumberMasked: `${emp.pan.slice(0, 2)}XXXXX${emp.pan.slice(-2)}`,
        aadhaarMasked: emp.aadhaar,
        dateOfBirth: emp.dob,
        gender: emp.gender,
        department: emp.dept,
        designation: emp.desig,
        dateOfJoining: new Date('2022-04-01'),
        employmentStatus: emp.status,
      },
    });

    createdEmployees.push({ ...emp, dbId: employee.id });

    // Create User account for employee
    await prisma.user.create({
      data: {
        email: emp.email,
        fullName: `${emp.firstName} ${emp.lastName}`,
        phoneNumber: emp.phone,
        passwordHash: defaultPasswordHash,
        role: 'EMPLOYEE',
        organizationId: techCorp.id,
        employeeId: employee.id,
        isActive: true,
      },
    });

    // Create Bank Account
    await prisma.bankAccount.create({
      data: {
        employeeId: employee.id,
        accountNumber: 'XXXX-XXXX-4589',
        ifscCode: 'HDFC0000123',
        bankName: 'HDFC Bank Ltd',
        branchName: 'Kanjurmarg Mumbai',
        accountType: 'SALARY',
        isSalaryAccount: true,
        isPennyDropVerified: true,
        beneficiaryName: `${emp.firstName} ${emp.lastName}`,
      },
    });

    // Create KYC Record
    await prisma.kYCRecord.create({
      data: {
        employeeId: employee.id,
        documentType: 'PAN',
        status: 'VERIFIED',
        verificationRef: `PAN_VRF_${emp.code}_OK`,
        verifiedAt: new Date(),
        documentNumber: `${emp.pan.slice(0, 2)}XXXXX${emp.pan.slice(-2)}`,
      },
    });

    await prisma.kYCRecord.create({
      data: {
        employeeId: employee.id,
        documentType: 'AADHAAR',
        status: 'VERIFIED',
        verificationRef: `UID_OTP_${emp.code}_OK`,
        verifiedAt: new Date(),
        documentNumber: emp.aadhaar,
      },
    });

    // Create Mandate
    await prisma.mandate.create({
      data: {
        employeeId: employee.id,
        mandateType: 'E_NACH',
        maxAmountPaise: 10000000,
        status: 'ACTIVE',
        umrn: `NACH_MND_${emp.code}_2026`,
        bankName: 'HDFC Bank Ltd',
        validUntil: new Date('2030-12-31'),
      },
    });

    // Create Salary Record for current cycle (Nov 2026)
    await prisma.salaryRecord.create({
      data: {
        employeeId: employee.id,
        month: 11,
        year: 2026,
        monthlyGrossPaise: emp.salaryGross,
        monthlyNetPaise: emp.salaryNet,
        basicPayPaise: emp.basic,
        hraPaise: emp.hra,
        allowancesPaise: emp.allowance,
        pfDeductionPaise: emp.pf,
        taxDeductionPaise: emp.tax,
      },
    });

    // Create Attendance Record for current cycle
    await prisma.attendanceRecord.create({
      data: {
        employeeId: employee.id,
        month: 11,
        year: 2026,
        totalPayableDays: emp.totalDays,
        daysPresent: emp.workedDays,
        paidLeaveDays: 2,
        lossOfPayDays: emp.totalDays - emp.workedDays - 2,
        totalApprovedWorkedDays: emp.workedDays + 2,
        isFinalized: false,
      },
    });
  }

  // 9. Seed Active EWA Application & Loan for Rajesh Kumar
  const rajesh = createdEmployees[0];
  const ewaApp = await prisma.loanApplication.create({
    data: {
      applicationNumber: 'DADA-EWA-2026-11-001',
      organizationId: techCorp.id,
      employeeId: rajesh.dbId,
      nbfcPartnerId: apexNbfc.id,
      productType: 'EWA',
      status: 'DISBURSED',
      requestedAmountPaise: 2000000, // Rs 20,000
      approvedAmountPaise: 2000000,
      tenureMonths: 1,
      interestRatePercent: 0,
      processingFeePaise: 9900, // Rs 99
      monthlyEmiPaise: 2000000,
      disbursementAccountNo: 'XXXX-XXXX-4589',
      disbursementIfsc: 'HDFC0000123',
      nbfcApplicationRef: 'APEX-EWA-TC1001-9988',
      eSignedAt: new Date('2026-11-10T10:30:00Z'),
      disbursedAt: new Date('2026-11-10T11:00:00Z'),
    },
  });

  await prisma.eWAApplication.create({
    data: {
      applicationId: ewaApp.id,
      salaryCycleMonth: 11,
      salaryCycleYear: 2026,
      approvedDaysWorked: 10,
      grossEarnedPaise: 2500000,
      convenienceFeePaise: 9900,
      netDisbursementPaise: 1990100,
      repaymentDueDate: new Date('2026-11-30'),
    },
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: ewaApp.id, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', changedByRole: 'EMPLOYEE', remarks: 'Employee submitted EWA request' },
      { applicationId: ewaApp.id, fromStatus: 'SUBMITTED', toStatus: 'SENT_TO_NBFC', changedByRole: 'SYSTEM', remarks: 'Verified eligibility and dispatched to Apex Capital' },
      { applicationId: ewaApp.id, fromStatus: 'SENT_TO_NBFC', toStatus: 'APPROVED', changedByRole: 'NBFC_WEBHOOK', remarks: 'Apex Capital automated underwrite approved' },
      { applicationId: ewaApp.id, fromStatus: 'APPROVED', toStatus: 'DISBURSED', changedByRole: 'NBFC_WEBHOOK', remarks: 'Apex Capital UTR: CMS9876543210' },
    ],
  });

  const ewaLoan = await prisma.loan.create({
    data: {
      loanAccountNumber: 'LN-EWA-2026-0001',
      applicationId: ewaApp.id,
      employeeId: rajesh.dbId,
      nbfcPartnerId: apexNbfc.id,
      productType: 'EWA',
      principalPaise: 2000000,
      interestRatePercent: 0,
      tenureMonths: 1,
      monthlyEmiPaise: 2000000,
      totalRepayablePaise: 2000000,
      totalPaidPaise: 0,
      outstandingPaise: 2000000,
      disbursementUtr: 'CMS9876543210',
      disbursedAt: new Date('2026-11-10T11:00:00Z'),
      status: 'ACTIVE',
    },
  });

  await prisma.repaymentSchedule.create({
    data: {
      loanId: ewaLoan.id,
      installmentNumber: 1,
      dueDate: new Date('2026-11-30'),
      principalPaise: 2000000,
      interestPaise: 0,
      totalDuePaise: 2000000,
      paidPaise: 0,
      status: 'PENDING',
    },
  });

  // 10. Seed Disbursed Payroll Loan for Sunita Mehra
  const sunita = createdEmployees[3];
  const loanApp = await prisma.loanApplication.create({
    data: {
      applicationNumber: 'DADA-PL-2026-09-042',
      organizationId: techCorp.id,
      employeeId: sunita.dbId,
      nbfcPartnerId: apexNbfc.id,
      productType: 'PAYROLL_LOAN',
      status: 'DISBURSED',
      requestedAmountPaise: 12000000, // Rs 1,20,000
      approvedAmountPaise: 12000000,
      tenureMonths: 12,
      interestRatePercent: 14.5,
      processingFeePaise: 180000, // Rs 1,800
      monthlyEmiPaise: 1080400, // Rs 10,804
      disbursementAccountNo: 'XXXX-XXXX-4589',
      disbursementIfsc: 'HDFC0000123',
      nbfcApplicationRef: 'APEX-PL-TC1004-7711',
      eSignedAt: new Date('2026-09-02T14:20:00Z'),
      disbursedAt: new Date('2026-09-03T09:15:00Z'),
    },
  });

  await prisma.payrollLoanApplication.create({
    data: {
      applicationId: loanApp.id,
      purpose: 'Home Renovation & Appliances',
      creditBureauScore: 785,
      foirPercentCalculated: 16.6,
      totalInterestPaise: 964800, // approx Rs 9,648
      totalRepaymentPaise: 12964800,
      firstEmiDate: new Date('2026-09-30'),
    },
  });

  const payrollLoan = await prisma.loan.create({
    data: {
      loanAccountNumber: 'LN-PL-2026-0042',
      applicationId: loanApp.id,
      employeeId: sunita.dbId,
      nbfcPartnerId: apexNbfc.id,
      productType: 'PAYROLL_LOAN',
      principalPaise: 12000000,
      interestRatePercent: 14.5,
      tenureMonths: 12,
      monthlyEmiPaise: 1080400,
      totalRepayablePaise: 12964800,
      totalPaidPaise: 2160800, // 2 EMIs paid in Sept and Oct
      outstandingPaise: 10804000,
      disbursementUtr: 'CMS4455667788',
      disbursedAt: new Date('2026-09-03T09:15:00Z'),
      status: 'ACTIVE',
    },
  });

  // Repayment schedule for 12 months
  for (let i = 1; i <= 12; i++) {
    const isPaid = i <= 2;
    await prisma.repaymentSchedule.create({
      data: {
        loanId: payrollLoan.id,
        installmentNumber: i,
        dueDate: new Date(2026, 7 + i, 30),
        principalPaise: 950000,
        interestPaise: 130400,
        totalDuePaise: 1080400,
        paidPaise: isPaid ? 1080400 : 0,
        status: isPaid ? 'PAID' : 'PENDING',
        paidAt: isPaid ? new Date(2026, 7 + i, 30) : null,
      },
    });
  }

  // 11. Seed Pending Payroll Loan Application for Priya Sharma (for Admin/HR testing)
  const priya = createdEmployees[1];
  const pendingLoanApp = await prisma.loanApplication.create({
    data: {
      applicationNumber: 'DADA-PL-2026-11-098',
      organizationId: techCorp.id,
      employeeId: priya.dbId,
      nbfcPartnerId: apexNbfc.id,
      productType: 'PAYROLL_LOAN',
      status: 'APPROVED',
      requestedAmountPaise: 20000000, // Rs 2,00,000
      approvedAmountPaise: 20000000,
      tenureMonths: 18,
      interestRatePercent: 14.0,
      processingFeePaise: 300000,
      monthlyEmiPaise: 1238000,
      disbursementAccountNo: 'XXXX-XXXX-4589',
      disbursementIfsc: 'HDFC0000123',
      nbfcApplicationRef: 'APEX-PL-TC1002-3321',
    },
  });

  await prisma.payrollLoanApplication.create({
    data: {
      applicationId: pendingLoanApp.id,
      purpose: 'Medical Emergency and Personal Expense',
      creditBureauScore: 790,
      foirPercentCalculated: 13.4,
      totalInterestPaise: 2284000,
      totalRepaymentPaise: 22284000,
      firstEmiDate: new Date('2026-12-31'),
    },
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: pendingLoanApp.id, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', changedByRole: 'EMPLOYEE', remarks: 'Submitted by Priya Sharma' },
      { applicationId: pendingLoanApp.id, fromStatus: 'SUBMITTED', toStatus: 'SENT_TO_NBFC', changedByRole: 'SYSTEM', remarks: 'Dispatched to Apex Capital' },
      { applicationId: pendingLoanApp.id, fromStatus: 'SENT_TO_NBFC', toStatus: 'APPROVED', changedByRole: 'NBFC_WEBHOOK', remarks: 'Apex approved loan offer' },
    ],
  });

  // 12. Seed Payroll Batch for October 2026 (Reconciled with an exception)
  const octBatch = await prisma.payrollBatch.create({
    data: {
      batchNumber: 'PB-TECHCORP-2026-10',
      organizationId: techCorp.id,
      month: 10,
      year: 2026,
      cutoffDate: new Date('2026-10-25'),
      totalEmployees: 2,
      totalDuePaise: 3080400,
      totalDeductedPaise: 3080400,
      status: 'RECONCILED_WITH_EXCEPTIONS',
      generatedAt: new Date('2026-10-26T10:00:00Z'),
      exportedAt: new Date('2026-10-26T11:00:00Z'),
      reconciledAt: new Date('2026-10-31T18:00:00Z'),
    },
  });

  const batchItem1 = await prisma.payrollBatchItem.create({
    data: {
      payrollBatchId: octBatch.id,
      employeeId: sunita.dbId,
      loanId: payrollLoan.id,
      productType: 'PAYROLL_LOAN',
      dueAmountPaise: 1080400,
      deductedAmountPaise: 1080400,
      status: 'DEDUCTED',
    },
  });

  const remittance = await prisma.employerRemittance.create({
    data: {
      organizationId: techCorp.id,
      payrollBatchId: octBatch.id,
      nbfcPartnerId: apexNbfc.id,
      utrNumber: 'UTRIBKL2610998811',
      remittedAmountPaise: 3080400,
      remittanceDate: new Date('2026-10-31'),
      status: 'MATCHED',
      notes: 'October 2026 payroll deduction remittance transferred directly to Apex Capital Escrow',
    },
  });

  const recon = await prisma.reconciliationRecord.create({
    data: {
      employerRemittanceId: remittance.id,
      expectedAmountPaise: 3080400,
      actualAmountPaise: 3080400,
      matchedCount: 1,
      exceptionCount: 1,
      status: 'RECONCILED_WITH_EXCEPTIONS',
      reconciledByRole: 'SYSTEM',
      notes: 'Automated 1-to-1 matching complete. 1 warning exception noted.',
    },
  });

  await prisma.reconciliationException.create({
    data: {
      reconciliationRecordId: recon.id,
      payrollBatchItemId: batchItem1.id,
      exceptionType: 'PARTIAL_DEDUCTION',
      expectedPaise: 1080400,
      actualPaise: 1080400,
      status: 'RESOLVED',
      resolutionNotes: 'Verified with bank receipt. Resolved by HR Admin.',
      resolvedAt: new Date('2026-11-01'),
    },
  });

  // 13. Seed In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: hrAdminUser.id,
        title: 'Payroll Cutoff Alert',
        message: 'November 2026 payroll cutoff is approaching on 25th Nov. 1 EWA withdrawal and 1 Payroll loan are active.',
        type: 'ALERT',
        linkUrl: '/hr/payroll/batches',
      },
      {
        userId: adminUser.id,
        title: 'Apex Capital Webhook Event',
        message: 'Disbursement webhook received and processed for loan LN-EWA-2026-0001 (₹20,000).',
        type: 'SUCCESS',
        linkUrl: '/admin/audit-logs',
      },
    ],
  });

  // 14. Audit Events
  await prisma.auditEvent.createMany({
    data: [
      {
        organizationId: techCorp.id,
        userId: adminUser.id,
        action: 'NBFC_INTEGRATION_CONFIGURED',
        resourceType: 'NBFC_PARTNER',
        resourceId: apexNbfc.id,
        metadataJson: JSON.stringify({ partner: 'Apex Capital', products: ['EWA', 'PAYROLL_LOAN'] }),
      },
      {
        organizationId: techCorp.id,
        userId: hrAdminUser.id,
        action: 'PAYROLL_POLICY_UPDATED',
        resourceType: 'CORPORATE_POLICY',
        resourceId: techCorp.id,
        metadataJson: JSON.stringify({ maxEwaPct: 50, salaryMultiplier: 3 }),
      },
    ],
  });

  console.log('✅ Dada Advisory seed completed successfully!');
  console.log('---------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('Dada Admin:   admin@dadaadvisory.com / DadaDemo@2026');
  console.log('HR Admin:     hr.admin@techcorp.in   / DadaDemo@2026');
  console.log('HR Operator:  hr.ops@techcorp.in     / DadaDemo@2026');
  console.log('Employee 1:   rajesh.k@techcorp.in   / DadaDemo@2026 (Confirmed)');
  console.log('Employee 2:   priya.s@techcorp.in    / DadaDemo@2026 (Confirmed)');
  console.log('Employee 3:   amit.v@techcorp.in     / DadaDemo@2026 (Notice Period - Ineligible)');
  console.log('Employee 4:   sunita.m@techcorp.in   / DadaDemo@2026 (Active Loan)');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
