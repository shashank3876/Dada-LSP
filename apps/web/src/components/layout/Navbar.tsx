'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Users, Building2, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Personal Loan', href: '/products/payroll-loan' },
    { name: 'Earned Wage Access', href: '/products/earned-wage-access' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Eligibility', href: '/eligibility' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Regulatory & Support Announcement Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold">RBI Regulated Digital Lending (DLG) Compliant LSP</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400">Partner NBFCs: Apex Capital Finance Ltd | DMI Finance</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a
              href="mailto:support@dadaadvisoryservices.com"
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              <Mail className="w-3 h-3 text-emerald-400" />
              <span>support@dadaadvisoryservices.com</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a
              href="mailto:connect@dadaadvisoryservices.com"
              className="hidden sm:flex items-center gap-1 hover:text-amber-400 transition-colors"
            >
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>connect@dadaadvisoryservices.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Official Medallion Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/logo-square.png"
              alt="Dada Advisory Services LLP Logo"
              width={48}
              height={48}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-xl tracking-tight text-dada-950">DADA</span>
              <span className="font-extrabold text-xl tracking-tight text-amber-600">ADVISORY</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-600 mt-1">
              Services LLP • Digital Loan Service Provider
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-dada-950 font-bold bg-amber-50 text-amber-900 border border-amber-200'
                    : 'text-slate-600 hover:text-dada-900 hover:bg-slate-100'
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm border border-slate-700"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portal Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
