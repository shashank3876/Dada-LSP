import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  Clock,
  AlertCircle,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

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
          Contact, Hotline & Grievance Redressal
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Reach our dedicated support teams for borrower assistance, corporate employer onboarding, helpline support, or regulatory liaison with partner NBFCs.
        </p>
      </div>

      {/* Main Contact Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Phone & Hotline Card */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-amber-400 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-dada-950">Helpline & Phone</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct telephonic assistance for loan status, EWA eligibility, and verification:
            </p>
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 space-y-1">
              <a href={`tel:${SITE_CONFIG.phone.tel}`} className="block hover:underline text-sm font-extrabold">
                {SITE_CONFIG.phone.display}
              </a>
              <div className="text-[11px] text-amber-800 font-medium">Toll-Free: {SITE_CONFIG.phone.tollFree}</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{SITE_CONFIG.phone.hours}</span>
          </div>
        </div>

        {/* WhatsApp Support Card */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-400 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-base text-dada-950">WhatsApp Desk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant chat support for quick employee inquiries, documents, and updates:
            </p>
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-950">
              <a
                href={SITE_CONFIG.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center justify-between text-sm font-extrabold"
              >
                <span>{SITE_CONFIG.whatsapp.display}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">CHAT</span>
              </a>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Active Desk: 9:00 AM – 8:00 PM IST</span>
          </div>
        </div>

        {/* Email Support Card */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-dada-950">Email Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For borrower application queries, verification, salary deduction, and general support:
            </p>
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs font-bold text-blue-950 break-all">
              <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="hover:underline">
                {SITE_CONFIG.supportEmail}
              </a>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Turnaround Time: Within 24 business hours</span>
          </div>
        </div>

        {/* Corporate Partnerships Card */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-purple-400 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-dada-950">Corporate Desk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For Enterprise HR Directors, Payroll heads, and prospective NBFC lending partners:
            </p>
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-xs font-bold text-purple-950 break-all">
              <a href={`mailto:${SITE_CONFIG.partnershipsEmail}`} className="hover:underline">
                {SITE_CONFIG.partnershipsEmail}
              </a>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Dedicated Enterprise Account Director</span>
          </div>
        </div>
      </div>

      {/* Official Social Media Channels Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-dada-950">Follow & Connect on Social Media</h2>
            <p className="text-xs text-slate-600 mt-1">
              Stay updated with financial wellness tips, product launches, corporate webinars, and regulatory announcements.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Verified Handles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LinkedIn */}
          <a
            href={SITE_CONFIG.social.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-xl border border-slate-200 hover:border-[#0A66C2] hover:bg-slate-50/80 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center group-hover:bg-[#0A66C2] group-hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-[#0A66C2] transition-colors">
                  LinkedIn
                </div>
                <div className="text-[11px] text-slate-500">{SITE_CONFIG.social.linkedin.handle}</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0A66C2] transition-colors" />
          </a>

          {/* YouTube */}
          <a
            href={SITE_CONFIG.social.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-xl border border-slate-200 hover:border-[#FF0000] hover:bg-slate-50/80 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center group-hover:bg-[#FF0000] group-hover:text-white transition-all">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-[#FF0000] transition-colors">
                  YouTube
                </div>
                <div className="text-[11px] text-slate-500">{SITE_CONFIG.social.youtube.handle}</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#FF0000] transition-colors" />
          </a>

          {/* Instagram */}
          <a
            href={SITE_CONFIG.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-xl border border-slate-200 hover:border-pink-500 hover:bg-slate-50/80 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:via-rose-500 group-hover:to-purple-600 group-hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
                  Instagram
                </div>
                <div className="text-[11px] text-slate-500">{SITE_CONFIG.social.instagram.handle}</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-600 transition-colors" />
          </a>

          {/* Facebook */}
          <a
            href={SITE_CONFIG.social.facebook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-xl border border-slate-200 hover:border-[#1877F2] hover:bg-slate-50/80 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-[#1877F2] transition-colors">
                  Facebook
                </div>
                <div className="text-[11px] text-slate-500">{SITE_CONFIG.social.facebook.handle}</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#1877F2] transition-colors" />
          </a>
        </div>
      </div>

      {/* Registered Office & Compliance Info */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-dada-950">Corporate Registered Office</h3>
            <p className="text-xs text-slate-500">Official statutory correspondence address</p>
          </div>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
          <strong>{SITE_CONFIG.address.company}</strong><br />
          {SITE_CONFIG.address.line1}, {SITE_CONFIG.address.line2}<br />
          LLPIN: <span className="font-mono font-semibold">{SITE_CONFIG.address.llpin}</span> • Digital Lending Ref: <span className="font-mono font-semibold">{SITE_CONFIG.address.regRef}</span>
        </p>
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
            <p className="text-slate-600">Email: {SITE_CONFIG.supportEmail}</p>
            <p className="text-slate-600">Phone: {SITE_CONFIG.phone.display}</p>
            <p className="text-slate-500">Response turnaround: 24 to 48 business hours.</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-amber-700 uppercase tracking-wider block text-[10px]">Level 2: Escalation</span>
            <div className="font-bold text-sm text-slate-900">Grievance Redressal Officer (GRO)</div>
            <p className="text-slate-600">Officer: Mr. Rajeshwar Rao, Principal Compliance Officer</p>
            <p className="text-slate-600">Email: {SITE_CONFIG.supportEmail} (Subject: Attn GRO)</p>
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
