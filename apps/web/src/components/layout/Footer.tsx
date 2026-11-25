import React from 'react';
import Link from 'next/link';
import { Shield, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dada-950 text-slate-300 pt-10 sm:pt-16 pb-10 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-emerald-500 text-dada-950 flex items-center justify-center font-extrabold text-lg">
                D
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">DADA ADVISORY</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dada Advisory operates as a premier Lending Service Provider (LSP) partnering with RBI-regulated NBFCs and banks to deliver ethical Earned Wage Access and Corporate Salary Advance solutions.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Digital Lending Compliance First</span>
            </div>
          </div>

          {/* Lending Products */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Lending Products</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/products/earned-wage-access" className="hover:text-emerald-400 transition-colors">
                  Earned Wage Access (EWA)
                </Link>
              </li>
              <li>
                <Link href="/products/payroll-loan" className="hover:text-emerald-400 transition-colors">
                  Corporate Payroll Loans (EMI)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors">
                  Product Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="hover:text-emerald-400 transition-colors">
                  Corporate Policy Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Employee Self-Service Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Corporate HR & Payroll Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Dada Operations & Admin Console
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  Workflow Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Contact */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Compliance</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>LSP Registration Ref: LSP/IN/2026/0488</li>
              <li>Partner NBFC: Apex Capital Finance Ltd</li>
              <li>Direct Disbursement to Salary Account</li>
              <li>Zero Collateral & Transparent Pricing</li>
              <li>Support: support@dadaadvisory.com</li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory LSP Disclosure */}
        <div className="mt-8 pt-6 bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Important Statutory LSP Disclosure & Business Rule</span>
          </div>
          <p>
            Dada Advisory operates strictly as a Lending Service Provider (LSP). Dada Advisory does not hold, pool, receive, or transfer borrower loan funds. All loan underwriting, credit assessment, Key Fact Statement (KFS) issuance, agreement sanctioning, and disbursement are executed directly by RBI-registered partner Non-Banking Financial Companies (NBFCs) or Banks into the employee’s salary bank account. Repayments are deducted via corporate payroll and remitted directly to the NBFC designated account.
          </p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center md:text-left">
          <div>© {new Date().getFullYear()} Dada Advisory Services Pvt Ltd. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/faq" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-slate-400">Fair Practices Code</Link>
            <Link href="/faq" className="hover:text-slate-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
