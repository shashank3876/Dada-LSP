'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Users, Building2, PhoneCall, Phone, Menu, X } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: 'About Us', href: '/about' },
    { name: 'Home', href: '/' },
    { name: 'Loan Products', href: '/products' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Eligibility', href: '/eligibility' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Regulatory & Support Announcement Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold">Dada Bridge • RBI Regulated Digital Lending (DLG) Platform</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400">Partner NBFCs: Apex Capital Finance Ltd | DMI Finance</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
            <a
              href={`tel:${SITE_CONFIG.phone.tel}`}
              className="flex items-center gap-1 hover:text-amber-400 transition-colors"
              title={`Call Support: ${SITE_CONFIG.phone.display}`}
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>{SITE_CONFIG.phone.display}</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a
              href={SITE_CONFIG.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
            <span className="text-slate-600 hidden md:inline">|</span>
            <a
              href={`mailto:${SITE_CONFIG.supportEmail}`}
              className="hidden md:flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              <Mail className="w-3 h-3 text-emerald-400" />
              <span>{SITE_CONFIG.supportEmail}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Official Medallion Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/logo-square.png"
              alt="Dada Bridge Logo"
              width={44}
              height={44}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-dada-950">DADA</span>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-amber-600">BRIDGE</span>
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1 whitespace-nowrap">
              A Unit of Dada Advisory Services LLP
            </div>
          </div>
        </Link>

        {/* Desktop Navigation (Strictly Single Line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink min-w-0">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'text-amber-950 font-bold bg-amber-100/80 border border-amber-300 shadow-2xs'
                    : 'text-slate-700 hover:text-dada-950 hover:bg-slate-100/90'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs & Mobile Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm border border-slate-700 whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portal Login</span>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur px-4 pt-3 pb-6 shadow-xl space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
