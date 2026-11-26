'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function KycPage() {
  const [pan, setPan] = useState('ABCDE1234F');
  const [aadhaar, setAadhaar] = useState('890123456789');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadKycStatus() {
      try {
        const profile = await apiRequest('/auth/me');
        if (profile?.employee) {
          const emp = profile.employee;
          if (emp.panNumberMasked) setPan(emp.panNumberMasked);
          if (emp.aadhaarMasked) setAadhaar(emp.aadhaarMasked);

          const panRec = emp.kycRecords?.find((k: any) => k.documentType === 'PAN' && k.status === 'VERIFIED');
          const uidRec = emp.kycRecords?.find((k: any) => k.documentType === 'AADHAAR' && k.status === 'VERIFIED');

          if (panRec) setPanVerified(true);
          if (uidRec) setAadhaarVerified(true);
        }
      } catch (e) {
        console.error('Failed to load profile for KYC:', e);
      } finally {
        setLoading(false);
      }
    }
    loadKycStatus();
  }, []);

  const handleVerifyPan = async () => {
    try {
      const res = await apiRequest('/kyc/verify-pan', {
        method: 'POST',
        body: JSON.stringify({ panNumber: pan }),
      });
      setPanVerified(true);
      setMessage(res.message);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handleSendAadhaarOtp = async () => {
    try {
      const res = await apiRequest('/kyc/send-aadhaar-otp', {
        method: 'POST',
        body: JSON.stringify({ aadhaarNumber: aadhaar }),
      });
      setOtpSent(true);
      setMessage(res.message);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    try {
      const res = await apiRequest('/kyc/verify-aadhaar-otp', {
        method: 'POST',
        body: JSON.stringify({ aadhaarNumber: aadhaar, otp }),
      });
      setAadhaarVerified(true);
      setMessage(res.message);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Checking statutory KYC status...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Digital KYC & Verification</h1>
        <p className="text-xs text-slate-500">
          Paperless digital verification in compliance with statutory RBI guidelines.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-bold">Staging / Development Sandbox Notice:</strong>
          <p className="text-amber-800 text-[11px]">
            Verification records are processed against simulated NSDL and UIDAI sandbox endpoints. In demo and staging environments, verified badges indicate successful sandbox validation and cannot be mistaken for production identity attestation. Production operation requires institutional Digilocker / NSDL credentials.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PAN Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-dada-950">PAN Verification</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                panVerified ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {panVerified ? 'MOCK VERIFIED (STAGING)' : 'PENDING'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Instant verification against simulated NSDL database.</p>
          <input
            type="text"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            disabled={panVerified}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono uppercase disabled:bg-slate-50 disabled:text-slate-500"
          />
          {!panVerified && (
            <button
              onClick={handleVerifyPan}
              className="w-full py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-lg text-xs transition-all shadow"
            >
              Verify PAN
            </button>
          )}
        </div>

        {/* Aadhaar Verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-dada-950">Aadhaar e-KYC</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                aadhaarVerified ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {aadhaarVerified ? 'MOCK VERIFIED (STAGING)' : 'PENDING'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Paperless UIDAI OTP verification.</p>
          <input
            type="text"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            placeholder="12-digit Aadhaar"
            disabled={aadhaarVerified}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono disabled:bg-slate-50 disabled:text-slate-500"
          />
          {!aadhaarVerified && (
            <>
              {!otpSent ? (
                <button
                  onClick={handleSendAadhaarOtp}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                >
                  Send Simulated OTP
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP (123456)"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                  <button
                    onClick={handleVerifyAadhaarOtp}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    Confirm OTP & Complete KYC
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
