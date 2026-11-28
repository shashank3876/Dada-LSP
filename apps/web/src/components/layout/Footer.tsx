import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Building2,
  AlertCircle,
  Mail,
  Phone,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import {
  LinkedInBadge,
  YouTubeBadge,
  InstagramBadge,
  FacebookBadge,
  WhatsAppBadge,
} from '@/components/common/SocialIcons';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Company info & Social Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/80 bg-amber-50 flex items-center justify-center shrink-0">
                <Image
                  src="/logo-square.png"
                  alt="Dada Bridge Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">DADA BRIDGE</span>
                <span className="block text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                  A Unit of Dada Advisory Services LLP
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dada Bridge is the enterprise digital workplace lending platform of Dada Advisory Services LLP (registered LSP). In partnership with RBI-regulated NBFCs, Dada Bridge provides corporate employees with on-demand Earned Wage Access and low-interest personal credit.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Shield className="w-4 h-4 shrink-0" />
              <span>RBI DLG Compliant • Direct NBFC Escrow</span>
            </div>

            {/* Social Media Channels (Permanent Full-Color Official Badges) */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Official Social Channels
              </span>
              <div className="flex items-center gap-2.5">
                {/* LinkedIn */}
                <a
                  href={SITE_CONFIG.social.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Dada Bridge on LinkedIn"
                  title="LinkedIn"
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                >
                  <LinkedInBadge className="w-8 h-8" />
                </a>

                {/* YouTube */}
                <a
                  href={SITE_CONFIG.social.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to Dada Bridge on YouTube"
                  title="YouTube"
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                >
                  <YouTubeBadge className="w-8 h-8" />
                </a>

                {/* Instagram */}
                <a
                  href={SITE_CONFIG.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Dada Bridge on Instagram"
                  title="Instagram"
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                >
                  <InstagramBadge className="w-8 h-8" />
                </a>

                {/* Facebook */}
                <a
                  href={SITE_CONFIG.social.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with Dada Bridge on Facebook"
                  title="Facebook"
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                >
                  <FacebookBadge className="w-8 h-8" />
                </a>

                {/* WhatsApp */}
                <a
                  href={SITE_CONFIG.whatsapp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Dada Bridge on WhatsApp"
                  title="WhatsApp Support Desk"
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                >
                  <WhatsAppBadge className="w-8 h-8" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Lending Products
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  Loan Products Matrix & Calculators
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Dada Bridge (Dada Advisory)
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="hover:text-amber-400 transition-colors">
                  Eligibility & Document Criteria
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-amber-400 transition-colors">
                  Digital Underwriting Journey
                </Link>
              </li>
            </ul>
          </div>

          {/* Corporate & Regulatory */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Corporate & Regulatory
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="text-[11px] font-semibold text-slate-300 block">Brand & Platform:</span>
                <span className="text-amber-300">Dada Bridge</span>
                <span className="block text-[10px] text-slate-400">A unit of Dada Advisory Services LLP</span>
              </li>
              <li>
                <span className="text-[11px] font-semibold text-slate-300 block">Operating Entity:</span>
                <span className="text-slate-200">Dada Advisory Services LLP</span>
                <span className="block text-[10px] text-slate-500">LLPIN: {SITE_CONFIG.address.llpin}</span>
              </li>
              <li>
                <span className="text-[11px] font-semibold text-slate-300 block">Institutional NBFCs:</span>
                <span className="text-slate-200">Apex Capital Finance Ltd</span>
                <span className="block text-slate-200">DMI Finance Private Ltd</span>
              </li>
              <li className="pt-1">
                <Link href="/faq" className="hover:text-amber-400 transition-colors block">
                  Fair Practices Code & KFS
                </Link>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors block mt-1">
                  Privacy Policy & Data Security
                </Link>
                <Link href="/contact" className="hover:text-amber-400 transition-colors block mt-1">
                  Grievance Redressal Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Helpline & Grievance */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Contact & Helpline
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              {/* Phone Line */}
              <li className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 block">Customer Helpline:</span>
                <a
                  href={`tel:${SITE_CONFIG.phone.tel}`}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{SITE_CONFIG.phone.display}</span>
                </a>
                <span className="text-[10px] text-slate-500 block">Toll-Free: {SITE_CONFIG.phone.tollFree}</span>
              </li>

              {/* WhatsApp Support */}
              <li className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 block">WhatsApp Desk:</span>
                <a
                  href={SITE_CONFIG.whatsapp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium"
                >
                  <WhatsAppBadge className="w-3.5 h-3.5 shrink-0" />
                  <span>{SITE_CONFIG.whatsapp.display} (Chat Online)</span>
                </a>
              </li>

              {/* Email Support */}
              <li className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 block">Email Support:</span>
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="text-slate-300 hover:text-emerald-300 flex items-center gap-1.5 font-medium break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{SITE_CONFIG.supportEmail}</span>
                </a>
              </li>

              {/* Corporate Partnerships */}
              <li className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 block">Corporate Partnerships:</span>
                <a
                  href={`mailto:${SITE_CONFIG.partnershipsEmail}`}
                  className="text-slate-300 hover:text-amber-300 flex items-center gap-1.5 font-medium break-all"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>{SITE_CONFIG.partnershipsEmail}</span>
                </a>
              </li>

              <li className="pt-1 text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Hours: {SITE_CONFIG.phone.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory LSP Disclosure */}
        <div className="mt-8 bg-slate-900/80 p-6 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Statutory Lending Service Provider (LSP) Disclosure</span>
          </div>
          <p>
            <strong>Dada Bridge</strong> is the digital lending application and platform operated exclusively by <strong>Dada Advisory Services LLP</strong> as a registered Lending Service Provider (LSP) under the regulatory framework established by the Reserve Bank of India (RBI Circular: DOR.CRE.REC.66/21.04.048/2022-23). Dada Bridge / Dada Advisory Services LLP does not operate as a bank or NBFC, does not engage in balance-sheet lending, and never holds, pools, receives, or disburses borrower funds in its own accounts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-300 border-t border-slate-800/80">
            <div>
              <strong>Partner NBFCs:</strong> Apex Capital Finance Ltd (RBI Reg: B-14.02981), DMI Finance Private Ltd (CoR: 14.00482).
            </div>
            <div>
              <strong>Loan Disbursal & Escrow:</strong> 100% of sanctioned loan proceeds are credited directly from the partner NBFC escrow account into the borrower’s verified salary bank account.
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} Dada Bridge (A Unit of Dada Advisory Services LLP). All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-slate-400">Fair Practices Code</Link>
            <Link href="/faq" className="hover:text-slate-400">Key Fact Statement (KFS)</Link>
            <Link href="/contact" className="hover:text-slate-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
