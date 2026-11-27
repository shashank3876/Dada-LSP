'use client';

import React from 'react';
import { SITE_CONFIG } from '@/lib/constants';
import { WhatsAppIcon } from './WhatsAppIcon';

export default function FloatingWhatsApp() {
  return (
    <aside
      aria-label="Direct WhatsApp Support"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2"
    >
      {/* Tooltip / Label */}
      <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg border border-slate-700 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Chat with Support on WhatsApp
      </span>

      {/* Floating Button */}
      <a
        href={SITE_CONFIG.whatsapp.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Dada Advisory on WhatsApp"
        className="w-13 h-13 p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center relative focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-white" />
        <WhatsAppIcon className="w-6 h-6" />
      </a>
    </aside>
  );
}
