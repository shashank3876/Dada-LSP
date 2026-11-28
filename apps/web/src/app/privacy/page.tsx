import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileText,
  Eye,
  Database,
  UserCheck,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata = {
  title: 'Privacy Policy | Dada Bridge',
  description:
    'Privacy Policy for Dada Bridge (operated by Dada Advisory Services LLP). Learn how we collect, process, and safeguard your personal and financial data in compliance with RBI Digital Lending Guidelines.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-800">
      {/* Header */}
      <div className="text-center space-y-3 pb-8 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Dada Bridge • RBI Digital Lending Guidelines (DLG) Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dada-950 tracking-tight">
          Privacy Policy & Data Protection Charter
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last Updated: November 28, 2026 • Effective Date: November 28, 2026 • Version 2.2
        </p>
      </div>

      {/* Quick Summary Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-xs text-amber-950 space-y-2">
        <div className="font-extrabold text-sm flex items-center gap-2 text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Summary of Borrower Data Rights</span>
        </div>
        <p className="leading-relaxed">
          <strong>Dada Bridge</strong> is a digital lending platform operated by <strong>Dada Advisory Services LLP</strong>, functioning strictly as a <strong>Lending Service Provider (LSP)</strong>. We only collect data essential for identity verification (KYC), underwriting, and loan servicing through authorized partner NBFCs (Apex Capital Finance Ltd & DMI Finance Private Ltd). <strong>We never access your mobile phone contacts, photo gallery, call logs, or GPS locations.</strong> All data is stored within certified data centers in India.
        </p>
      </div>

      {/* Policy Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed text-slate-700">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-dada-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>Introduction & Legal Framework</span>
          </h2>
          <p>
            Dada Bridge (&ldquo;Dada Bridge&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is the digital lending application (DLA) developed and operated by Dada Advisory Services LLP, registered under the Limited Liability Partnership Act (LLPIN: {SITE_CONFIG.address.llpin}), having its principal office at {SITE_CONFIG.address.line1}, {SITE_CONFIG.address.line2}.
          </p>
          <p>
            This Privacy Policy describes how we collect, store, process, and disclose your personal and financial information when you access the Dada Bridge portal at <code>dadaadvisoryservices.com</code>. We are fully committed to adhering to the <strong>Reserve Bank of India Guidelines on Digital Lending (RBI/2022-23/111 DOR.CRE.REC.66/21.04.048/2022-23)</strong> and the Digital Personal Data Protection Act (DPDP Act 2023).
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-dada-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>Information We Collect</span>
          </h2>
          <p>
            To facilitate credit evaluation and loan sanctioning by our partner NBFCs, we collect the following categories of data with your explicit prior consent:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li>
              <strong>Identity & KYC Data:</strong> Name, mobile number, corporate email address, Permanent Account Number (PAN), date of birth, and Aadhaar verification via masked Digilocker XML / OTP.
            </li>
            <li>
              <strong>Corporate Employment Data:</strong> Employer corporate name, employee ID, corporate tenure, official work email, and attendance/roster metrics received via bidirectional integration with corporate HRMS suites (e.g. Keka, Darwinbox, GreytHR).
            </li>
            <li>
              <strong>Financial & Banking Data:</strong> Salary bank account number, bank IFSC code, and statement data received through the RBI-licensed Account Aggregator (AA) network or password-protected PDF bank statements.
            </li>
            <li>
              <strong>Device & Audit Metadata:</strong> IP address, operating system, browser type, and timestamp logs strictly required for fraud prevention, audit trails, and RBI compliance logging.
            </li>
          </ul>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 text-xs">
            <strong>Explicit Negative Covenant:</strong> We do NOT collect, access, store, or monitor your telephone contact lists, WhatsApp messages, media gallery, SMS records (except one-time transactional OTPs), or continuous background GPS location.
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-dada-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">3</span>
            <span>Purpose of Data Processing</span>
          </h2>
          <p>We process your information exclusively for the following authorized financial purposes:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Verifying your employment and accrued salary balance for Earned Wage Access (EWA).</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Credit appraisal and underwriting executed directly by partner NBFCs.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Generating your personalized Key Fact Statement (KFS) and e-Sign contract execution.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Facilitating automated e-NACH / UPI AutoPay mandates and employer payroll deductions.</span>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-dada-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">4</span>
            <span>Data Sharing & Regulated Disclosures</span>
          </h2>
          <p>
            Dada Bridge and Dada Advisory Services LLP do NOT sell, rent, or trade your personal data to any third-party marketing companies. Data is shared strictly on a need-to-know basis with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>
              <strong>Partner NBFCs:</strong> Apex Capital Finance Ltd and DMI Finance Private Ltd for sanctioning, loan contract generation, and escrow disbursals.
            </li>
            <li>
              <strong>Statutory & Regulatory Bodies:</strong> Reserve Bank of India (RBI), Credit Information Companies (CIBIL, Experian, CRIF High Mark), and UIDAI for statutory verification.
            </li>
            <li>
              <strong>Technology Enablers:</strong> NPCI / DIGIO for e-NACH mandate registration, DigiLocker for paperless KYC, and SMS gateways (MSG91 / Resend) for OTP delivery.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-dada-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">5</span>
            <span>Data Storage, Security & Indian Data Localization</span>
          </h2>
          <p>
            In strict compliance with RBI directives on data localization, all borrower information, transaction records, and communication logs are stored on secure cloud servers located within <strong>the Republic of India (AWS / GCP Mumbai region)</strong>.
          </p>
          <p className="text-xs text-slate-600">
            We utilize 256-bit AES encryption at rest, TLS 1.3 encryption in transit, strict role-based access control (RBAC), and automated penetration testing to protect your data against unauthorized access.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-dada-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">6</span>
            <span>Your Rights & Consent Revocation</span>
          </h2>
          <p>
            You have the right to request access to your personal information, request corrections, or revoke your consent for data processing by writing to our Grievance Officer. Please note that data retention requirements mandated by the RBI (such as KYC records and loan transaction history) must be maintained for the statutory duration required by Indian banking regulations.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-dada-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">7</span>
            <span>Grievance Redressal & Nodal Officer</span>
          </h2>
          <p className="text-xs text-slate-600">
            If you have any questions, concerns, or grievances regarding the processing of your personal data or wish to exercise your data rights, please contact our designated Grievance Officer:
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-extrabold text-sm text-slate-900">Mr. Rajeshwar Rao</div>
            <div className="text-slate-600">Nodal Grievance Redressal Officer • Dada Advisory Services LLP</div>
            <div className="text-slate-700">
              Address: {SITE_CONFIG.address.company}, {SITE_CONFIG.address.line1}, {SITE_CONFIG.address.line2}
            </div>
            <div className="text-slate-700">
              Helpline Phone: <a href={`tel:${SITE_CONFIG.phone.tel}`} className="text-amber-700 font-bold hover:underline">{SITE_CONFIG.phone.display}</a>
            </div>
            <div className="text-slate-700">
              Email Address: <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-emerald-700 font-bold hover:underline">{SITE_CONFIG.supportEmail}</a>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              If your grievance is not resolved within 30 days, you may escalate your complaint to the Reserve Bank of India CMS Portal at <a href="https://sachet.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">sachet.rbi.org.in</a> or the RBI Ombudsman.
            </div>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <Link href="/" className="hover:text-amber-600 font-semibold">
          ← Return to Home
        </Link>
        <Link href="/contact" className="hover:text-amber-600 font-semibold">
          Contact Grievance Desk →
        </Link>
      </div>
    </div>
  );
}
