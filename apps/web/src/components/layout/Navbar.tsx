'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ChevronRight, Lock, UserCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Eligibility', href: '/eligibility' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-dada-900 flex items-center justify-center text-white font-bold text-xl shadow-md border border-dada-700">
            D
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-dada-950">DADA</span>
              <span className="font-bold text-xl tracking-tight text-emerald-600">ADVISORY</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Lending Service Provider (LSP)
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-dada-900 hover:bg-dada-800 transition-all shadow-sm"
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            Portal Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
