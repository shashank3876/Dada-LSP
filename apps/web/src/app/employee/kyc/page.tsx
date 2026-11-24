'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function KycPage() {
  const [pan, setPan] = useState('ABCDE1234F');
  const [aadhaar, setAadhaar] = useState('890123456789');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [panVerified, setPanVerified] = useState(true);
  const [aadhaarVerified, setAadhaarVerified] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-dada-950">Digital KYC & Verification</h1>
        <p className="text-xs text-slate-500">
          Paperless digital verification in compliance with statutory RBI guidelines.
        </p>
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {panVerified ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Instant verification against simulated NSDL database.</p>
          <input
            type="text"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono uppercase"
          />
          <button
            onClick={handleVerifyPan}
            className="w-full py-2 bg-dada-900 hover:bg-dada-800 text-white font-bold rounded-lg text-xs"
          >
            Verify PAN
          </button>
        </div>

        {/* Aadhaar Verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-dada-950">Aadhaar e-KYC</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {aadhaarVerified ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Paperless UIDAI OTP verification.</p>
          <input
            type="text"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            placeholder="12-digit Aadhaar"
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono"
          />
          {!otpSent ? (
            <button
              onClick={handleSendAadhaarOtp}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
            >
              Send Simulated OTP
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 123456"
                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
              <button
                onClick={handleVerifyAadhaarOtp}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Confirm OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
