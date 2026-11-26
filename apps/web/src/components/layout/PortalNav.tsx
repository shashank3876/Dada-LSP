'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  TrendingUp,
  FileText,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Landmark,
  Building2,
  FileCheck2,
  LogOut,
  Bell,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { clearAuthToken } from '@/lib/api';

interface PortalNavProps {
  portalType: 'EMPLOYEE' | 'HR' | 'ADMIN';
}

export default function PortalNav({ portalType }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('dada_user_profile');
    if (raw) {
      try {
        setUserProfile(JSON.parse(raw));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  const employeeLinks = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Earned Wage (EWA)', href: '/employee/ewa', icon: Zap },
    { name: 'Payroll Loan', href: '/employee/payroll-loan', icon: TrendingUp },
    { name: 'Applications Tracker', href: '/employee/applications', icon: FileText },
    { name: 'Active Loans', href: '/employee/loans', icon: CreditCard },
    { name: 'Repayment Schedule', href: '/employee/repayments', icon: RotateCcw },
    { name: 'Digital KYC', href: '/employee/kyc', icon: ShieldCheck },
  ];

  const hrLinks = [
    { name: 'HR Dashboard', href: '/hr/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/hr/employees', icon: Users },
    { name: 'Attendance & Leave', href: '/hr/attendance', icon: Calendar },
    { name: 'Salary Ledger', href: '/hr/salary', icon: DollarSign },
    { name: 'Lending Policies', href: '/hr/policies', icon: Sliders },
    { name: 'Loan Requests', href: '/hr/loan-requests', icon: FileCheck2 },
    { name: 'Payroll Batches', href: '/hr/payroll/batches', icon: RefreshCw },
    { name: 'Reconciliation', href: '/hr/payroll/reconciliation', icon: RotateCcw },
    { name: 'HRMS Integrations', href: '/hr/integrations', icon: Building2 },
  ];

  const adminLinks = [
    { name: 'Executive Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { name: 'Corporate Policies', href: '/admin/policies', icon: Sliders },
    { name: 'Loan Applications', href: '/admin/loan-applications', icon: FileCheck2 },
    { name: 'NBFC Partners & Simulator', href: '/admin/nbfc-partners', icon: Landmark },
    { name: 'Global Reconciliation', href: '/admin/reconciliation', icon: RotateCcw },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const links =
    portalType === 'EMPLOYEE' ? employeeLinks : portalType === 'HR' ? hrLinks : adminLinks;

  const portalTitle =
    portalType === 'EMPLOYEE'
      ? 'Employee Portal'
      : portalType === 'HR'
      ? 'Corporate HR Portal'
      : 'Dada Admin Console';

  const badgeColor =
    portalType === 'EMPLOYEE'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : portalType === 'HR'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : 'bg-purple-500/20 text-purple-400 border-purple-500/30';

  return (
    <aside className="w-64 bg-dada-950 text-slate-300 flex flex-col justify-between border-r border-dada-800 shrink-0 min-h-screen">
      <div>
        {/* Portal Header */}
        <div className="p-5 border-b border-dada-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-dada-950 flex items-center justify-center font-extrabold text-base shadow">
              D
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight leading-none">
                DADA ADVISORY
              </div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 mt-1">
                Lending Platform
              </div>
            </div>
          </Link>
          <div className="mt-4">
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}
            >
              {portalTitle}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-dada-900'
                }`}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-dada-800 space-y-3">
        <div className="bg-dada-900/80 p-3 rounded-xl border border-dada-800 text-xs space-y-1">
          <div className="font-bold text-white truncate">
            {userProfile?.fullName || 'Logged In User'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">{userProfile?.email}</div>
          {userProfile?.organizationName && (
            <div className="text-[10px] text-emerald-400 font-semibold truncate">
              {userProfile.organizationName}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all border border-slate-800"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
