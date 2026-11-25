'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const PORTAL_PREFIXES = ['/employee', '/hr', '/admin'];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full min-w-0">{children}</main>
      <Footer />
    </>
  );
}
