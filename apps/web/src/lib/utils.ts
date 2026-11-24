import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(paise: number | bigint = 0): string {
  const rupees = Number(paise) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function maskAadhaar(aadhaar: string = ''): string {
  if (!aadhaar || aadhaar.length < 4) return 'XXXX-XXXX-XXXX';
  const clean = aadhaar.replace(/\s+/g, '');
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function maskPAN(pan: string = ''): string {
  if (!pan || pan.length < 4) return 'XXXXX0000X';
  return `${pan.slice(0, 2)}XXXXX${pan.slice(-2)}`;
}
