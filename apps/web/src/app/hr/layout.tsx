'use client';

import React from 'react';
import PortalShell from '@/components/layout/PortalShell';

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      portalType="HR"
      title="TechCorp Solutions India Pvt Ltd • Corporate HR Console"
      statusLabel="HR Admin Session"
      statusDotClass="bg-blue-500"
    >
      {children}
    </PortalShell>
  );
}
