import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Landmark,
  Scale,
  Award,
  Lock,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export const metadata = {
  title: 'About Us | Dada Bridge',
  description:
    'Dada Bridge is an enterprise Digital Loan Service Provider (LSP) platform powered by Dada Advisory Services LLP, partnering with RBI-regulated NBFCs to deliver ethical workplace credit and Earned Wage Access to India’s salaried workforce.',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Dada Bridge • RBI Regulated Digital Lending (DLG) Compliant Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-dada-950 tracking-tight leading-tight">
          Empowering India’s Salaried Workforce With Dada Bridge
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          <strong>Dada Bridge</strong> is the premier enterprise digital lending platform developed and operated by <strong>Dada Advisory Services LLP</strong> (registered LSP). In institutional partnership with RBI-regulated Non-Banking Financial Companies (NBFCs), Dada Bridge delivers transparent, low-cost liquidity, Earned Wage Access (EWA), and corporate personal credit directly into employee salary bank accounts.
        </p>
      </div>

      {/* Corporate Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Corporate Identity & Standing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dada-950 leading-snug">
            Bridging Corporate Employers, Salaried Employees, and Institutional NBFC Capital
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Dada Bridge functions as the digital front-office and technology orchestration layer of <strong>Dada Advisory Services LLP</strong> (incorporated under the Limited Liability Partnership Act, LLPIN: <span className="font-semibold text-slate-900">{SITE_CONFIG.address.llpin}</span>). The platform operates strictly in adherence to the <strong>Reserve Bank of India Digital Lending Guidelines (RBI Circular: DOR.CRE.REC.66/21.04.048/2022-23)</strong>.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            By connecting directly with corporate HRMS suites (such as Keka, Darwinbox, and GreytHR), Dada Bridge verifies real-time employee attendance and accrued wages, enabling partner NBFCs to sanction instantaneous loans without predatory interest rates or paperwork hurdles.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-extrabold text-emerald-700">100%</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Escrow Direct Disbursals</div>
              <div className="text-[11px] text-slate-500 mt-1">Zero balance sheet lending; funds move direct from NBFC to borrower.</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-extrabold text-amber-600">&lt; 10 Mins</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Instant IMPS Liquidity</div>
              <div className="text-[11px] text-slate-500 mt-1">Automated underwriting via Account Aggregator and HRMS.</div>
            </div>
          </div>
        </div>

        {/* Right Medallion Emblem */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-gradient-to-b from-amber-50/50 via-white to-slate-50 border border-amber-200/80">
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl bg-amber-50 mb-5">
            <Image
              src="/logo.png"
              alt="Dada Bridge Medallion"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="font-extrabold text-xl text-dada-950">Dada Bridge</div>
          <div className="text-xs font-semibold text-amber-700 mt-0.5">Powered by Dada Advisory Services LLP</div>
          <div className="text-[11px] text-slate-500 mt-2 max-w-xs">
            Regulatory Ref: {SITE_CONFIG.address.regRef} • Mumbai, India
          </div>
          <div className="mt-5 pt-4 border-t border-slate-200 w-full flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
            <BadgeCheck className="w-4 h-4" />
            <span>Verified Regulated LSP Protocol</span>
          </div>
        </div>
      </div>

      {/* Regulated Partners Section */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dada-950">
            Our Regulated Entity (RE) Lending Partners
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            All credit facilities, loan sanction letters, and Key Fact Statements (KFS) are issued directly by our partner RBI-registered NBFCs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SITE_CONFIG.nbfcPartners.map((nbfc, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200 uppercase tracking-wider">
                    Authorized NBFC Partner
                  </span>
                  <Landmark className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-extrabold text-dada-950">{nbfc.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Reserve Bank of India Registration No: <span className="font-bold text-slate-900">{nbfc.rbiReg}</span>. Authorized institutional lending balance sheet providing corporate personal loans and earned wage credit facilities.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Disbursal Mode: 100% Escrow IMPS/NEFT</span>
                <span className="text-emerald-700 font-bold">Active Co-Lending Desk</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Principles & Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dada-950">
            Our Core Operating Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            How we maintain transparency, borrower safety, and regulatory compliance at every touchpoint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-dada-950">RBI DLG 2022 Compliance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never hold borrower funds. Loan disbursements flow directly from NBFC escrow to the employee’s salary account, and repayments return straight to the lender.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-dada-950">Zero Intrusive Data Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never request or scrape contacts, phone galleries, or call logs. Underwriting uses only Account Aggregator bank data and verified HRMS attendance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-dada-950">Transparent KFS Disclosures</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every loan presents a standardized Key Fact Statement disclosing Annual Percentage Rate (APR), processing fees, and full installment repayment tables upfront.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-dada-950">Fair Recovery & Penal Rules</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict adherence to RBI guidelines barring compounding penal interest. Only flat, reasonable penal charges are levied, alongside a 3-day cooling-off exit window.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership & Grievance Redressal Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Corporate Governance & Borrower Protection
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              Statutory Grievance Redressal Mechanism
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Resolution TAT: <span className="font-bold text-emerald-400">24 to 48 business hours</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2 p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Nodal Grievance Officer</span>
            </div>
            <div className="text-slate-200 font-semibold text-sm">Mr. Rajeshwar Rao</div>
            <div className="text-slate-400">Head of Regulatory Compliance & Grievance</div>
            <div className="pt-2 text-slate-300">
              Direct Phone: <a href={`tel:${SITE_CONFIG.phone.tel}`} className="text-amber-400 hover:underline">{SITE_CONFIG.phone.display}</a>
            </div>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Dedicated Redressal Desk</span>
            </div>
            <div className="text-slate-400">
              Email your dispute, statement queries, or cancellation requests:
            </div>
            <a
              href={`mailto:${SITE_CONFIG.supportEmail}`}
              className="text-emerald-400 font-bold hover:underline block pt-1"
            >
              {SITE_CONFIG.supportEmail}
            </a>
            <div className="text-[11px] text-slate-500 pt-1">
              Escalation available via RBI CMS Portal (sachet.rbi.org.in).
            </div>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Registered Corporate Office</span>
            </div>
            <div className="text-slate-300 leading-relaxed">
              {SITE_CONFIG.address.line1}<br />
              {SITE_CONFIG.address.line2}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Working Hours: {SITE_CONFIG.phone.hours}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Strip */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 rounded-3xl border border-amber-200/80 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl font-extrabold text-dada-950">
            Ready to explore our workplace loan products?
          </h3>
          <p className="text-xs text-slate-600">
            Inspect our 3-product specification matrix, calculate your EMI or EWA disbursal, and verify your corporate eligibility.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/products"
            className="px-6 py-3 bg-dada-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow flex items-center gap-2"
          >
            <span>View Loan Products & Calculators</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
          <a
            href={SITE_CONFIG.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow flex items-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat Online</span>
          </a>
        </div>
      </div>
    </div>
  );
}
