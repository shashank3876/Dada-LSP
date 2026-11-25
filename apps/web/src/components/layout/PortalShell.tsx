'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import PortalNav from '@/components/layout/PortalNav';

interface PortalShellProps {
  portalType: 'EMPLOYEE' | 'HR' | 'ADMIN';
  title: string;
  statusLabel: string;
  statusDotClass: string;
  children: React.ReactNode;
}

export default function PortalShell({
  portalType,
  title,
  statusLabel,
  statusDotClass,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full relative">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 right-3 z-10 lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dada-900 text-slate-300 border border-dada-800"
          >
            <X className="w-4 h-4" />
          </button>
          <PortalNav portalType={portalType} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{title}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`w-2 h-2 rounded-full ${statusDotClass}`} />
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 hidden sm:inline">
              {statusLabel}
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
