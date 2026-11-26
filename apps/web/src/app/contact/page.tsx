import React from 'react';
import { Mail, Phone, MapPin, Building2, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Official Channels • Dada Advisory Services LLP</span>
        </div>
        <h1 className="text-4xl font-extrabold text-dada-950 tracking-tight">
          Contact & Grievance Redressal
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Reach our dedicated support teams for borrower assistance, corporate employer onboarding, or regulatory liaison with partner NBFCs.
        </p>
      </div>

      {/* Main Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Support Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-dada-950">Email Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For borrower application queries, verification, salary deduction inquiries, and general support:
            </p>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-sm font-bold text-emerald-900 break-all">
              <a href="mailto:support@dadaadvisoryservices.com" className="hover:underline">
                support@dadaadvisoryservices.com
              </a>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Turnaround Time: Within 24 business hours</span>
          </div>
        </div>

        {/* Corporate Partnerships Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-dada-950">Corporate Partnerships</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For Enterprise HR Directors, Payroll heads, and prospective NBFC lending partners:
            </p>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-sm font-bold text-amber-900 break-all">
              <a href="mailto:connect@dadaadvisoryservices.com" className="hover:underline">
                connect@dadaadvisoryservices.com
              </a>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Dedicated Enterprise Account Director assigned</span>
          </div>
        </div>

        {/* Registered Office Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-dada-950">Corporate Office</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dada Advisory Services LLP<br />
              Level 8, Tower B, Godrej IT Park, Godrej Business District, Vikhroli West, Mumbai, Maharashtra - 400079
            </p>
            <div className="text-xs text-slate-500 pt-1">
              LLPIN: ABR-8921 • Digital Lending Ref: LSP/IN/2026/0488
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Mon–Fri: 9:30 AM – 6:30 PM IST</span>
          </div>
        </div>
      </div>

      {/* RBI Mandated Grievance Redressal Mechanism */}
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dada-950">
              Statutory Grievance Redressal Mechanism
            </h2>
            <p className="text-xs text-slate-600">
              In accordance with Reserve Bank of India (Digital Lending) Guidelines, 2022.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-amber-700 uppercase tracking-wider block text-[10px]">Level 1: Helpdesk</span>
            <div className="font-bold text-sm text-slate-900">Customer Support Desk</div>
            <p className="text-slate-600">Email: support@dadaadvisoryservices.com</p>
            <p className="text-slate-500">Response turnaround: 24 to 48 business hours.</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-amber-700 uppercase tracking-wider block text-[10px]">Level 2: Escalation</span>
            <div className="font-bold text-sm text-slate-900">Grievance Redressal Officer (GRO)</div>
            <p className="text-slate-600">Officer: Mr. Rajeshwar Rao, Principal Compliance Officer</p>
            <p className="text-slate-600">Email: support@dadaadvisoryservices.com (Subject: Attn GRO)</p>
            <p className="text-slate-500">Resolution SLA: Maximum 7 business days.</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-amber-700 uppercase tracking-wider block text-[10px]">Level 3: Regulatory</span>
            <div className="font-bold text-sm text-slate-900">RBI Ombudsman Scheme</div>
            <p className="text-slate-600">
              If the complaint is not resolved within 30 days, borrowers may lodge a complaint with the Reserve Bank of India:
            </p>
            <a
              href="https://cms.rbi.org.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-700 hover:underline block pt-1"
            >
              https://cms.rbi.org.in →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
