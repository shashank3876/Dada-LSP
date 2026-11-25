'use client';

import React from 'react';
import PortalShell from '@/components/layout/PortalShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      portalType="ADMIN"
      title="Dada Advisory • Master Operations & Admin Console"
      statusLabel="Dada Operations Active"
      statusDotClass="bg-purple-600 animate-pulse"
    >
      {children}
    </PortalShell>
  );
}
