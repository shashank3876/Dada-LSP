import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Building2, AlertCircle, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/80 bg-amber-50 flex items-center justify-center shrink-0">
                <Image
                  src="/logo-square.png"
                  alt="Dada Advisory Services LLP Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">DADA ADVISORY</span>
                <span className="block text-[10px] text-amber-400 font-semibold tracking-wider uppercase">SERVICES LLP</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dada Advisory Services LLP is an enterprise Digital Loan Service Provider (LSP) operating in strict compliance with the Reserve Bank of India (RBI) Digital Lending Guidelines. We partner with regulated NBFCs to facilitate direct, ethical salary advances and personal loans to corporate employees.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Shield className="w-4 h-4 shrink-0" />
              <span>RBI DLG Compliant • Zero Fund Custody</span>
            </div>
          </div>

          {/* Lending Products */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Lending Products
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/products/payroll-loan" className="hover:text-amber-400 transition-colors">
                  Corporate Personal Loans (EMI)
                </Link>
              </li>
              <li>
                <Link href="/products/earned-wage-access" className="hover:text-amber-400 transition-colors">
                  Earned Wage Access (EWA)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  Product Comparison Matrix
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

          {/* Portals & Architecture */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Enterprise Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Employee Self-Service Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Corporate Employer & HR Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Partner NBFC Reconciliation Desk
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition-colors">
                  Fair Practices Code & KFS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Grievance Redressal Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Support & Partnerships Contacts */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Contact & Grievance
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 block">Email Support & Inquiries:</span>
                <a
                  href="mailto:support@dadaadvisoryservices.com"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>support@dadaadvisoryservices.com</span>
                </a>
              </li>
              <li className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 block">Corporate Partnerships:</span>
                <a
                  href="mailto:connect@dadaadvisoryservices.com"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium break-all"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>connect@dadaadvisoryservices.com</span>
                </a>
              </li>
              <li className="pt-1 text-[11px] text-slate-500">
                Grievance Officer: Mr. Rajeshwar Rao<br />
                Turnaround Time (TAT): 24–48 Business Hours
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
            <strong>Dada Advisory Services LLP</strong> acts exclusively as a Lending Service Provider (LSP) under the regulatory framework established by the Reserve Bank of India (RBI Circular: DOR.CRE.REC.66/21.04.048/2022-23). Dada Advisory Services LLP does not operate as a bank or NBFC, does not engage in balance-sheet lending, and never holds, pools, receives, or disburses borrower funds in its own accounts.
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
          <div>© {new Date().getFullYear()} Dada Advisory Services LLP. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/faq" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-slate-400">Fair Practices Code</Link>
            <Link href="/faq" className="hover:text-slate-400">Key Fact Statement (KFS)</Link>
            <Link href="/contact" className="hover:text-slate-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
