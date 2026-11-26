'use client';

import React from 'react';
import PortalNav from '@/components/layout/PortalNav';

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalNav portalType="HR" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">
            TechCorp Solutions India Pvt Ltd • Corporate HR Console
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-bold text-slate-700">HR Admin Session</span>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
