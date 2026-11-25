'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Eligibility', href: '/eligibility' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-dada-900 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md border border-dada-700 shrink-0">
            D
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-dada-950">DADA</span>
              <span className="font-bold text-base sm:text-xl tracking-tight text-emerald-600">ADVISORY</span>
            </div>
            <div className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-slate-500 truncate">
              Lending Service Provider (LSP)
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-dada-900 font-semibold bg-slate-100'
                    : 'text-slate-600 hover:text-dada-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-dada-900 hover:bg-dada-800 transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="hidden sm:inline">Portal Sign In</span>
            <span className="sm:hidden">Sign In</span>
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'text-dada-900 font-semibold bg-slate-100'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
