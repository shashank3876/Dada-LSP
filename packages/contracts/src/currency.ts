/**
 * Monetary utilities: All monetary amounts are stored in integer paise (1 INR = 100 paise).
 * No floating point math is used for storing currency.
 */

export function paiseToRupees(paise: number | bigint): number {
  return Number(paise) / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatINR(paise: number | bigint, options: { showPaise?: boolean } = {}): string {
  const { showPaise = false } = options;
  const rupees = paiseToRupees(paise);
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showPaise ? 2 : 0,
    maximumFractionDigits: showPaise ? 2 : 0,
  });

  return formatter.format(rupees);
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 4) return 'XXXX-XXXX-XXXX';
  const clean = aadhaar.replace(/\s+/g, '');
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function maskPAN(pan: string): string {
  if (!pan || pan.length < 4) return 'XXXXX0000X';
  return `${pan.slice(0, 2)}XXXXX${pan.slice(-2)}`;
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 4) return 'XXXX0000';
  return `XXXX-XXXX-${acc.slice(-4)}`;
}
