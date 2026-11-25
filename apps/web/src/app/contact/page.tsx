import React from 'react';
import { Mail, Phone, MapPin, Building2 } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-dada-950 tracking-tight">Contact Us</h1>
        <p className="text-base text-slate-600">
          Get in touch with Dada Advisory for corporate onboarding, NBFC partnership, or borrower support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <Mail className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-dada-950">Email Support</h3>
          <p className="text-xs text-slate-600">For inquiries and grievance redressal:</p>
          <div className="text-sm font-semibold text-dada-900">support@dadaadvisory.com</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <Building2 className="w-5 h-5 text-dada-700" />
          <h3 className="font-bold text-dada-950">Corporate Partnerships</h3>
          <p className="text-xs text-slate-600">For enterprise HR & NBFC integrations:</p>
          <div className="text-sm font-semibold text-dada-900">partnerships@dadaadvisory.com</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <MapPin className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-dada-950">Registered Office</h3>
          <p className="text-xs text-slate-600">
            Level 8, Tower B, Godrej IT Park, Vikhroli West, Mumbai - 400079
          </p>
        </div>
      </div>
    </div>
  );
}
