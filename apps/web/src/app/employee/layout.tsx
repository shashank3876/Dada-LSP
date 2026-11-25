'use client';

import React from 'react';
import PortalShell from '@/components/layout/PortalShell';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      portalType="EMPLOYEE"
      title="TechCorp Solutions India Pvt Ltd • Employee Self-Service"
      statusLabel="Digital KYC Verified"
      statusDotClass="bg-emerald-500"
    >
      {children}
    </PortalShell>
  );
}
