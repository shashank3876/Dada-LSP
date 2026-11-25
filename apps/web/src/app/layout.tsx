import './globals.css';
import type { Metadata, Viewport } from 'next';
import AppChrome from '@/components/layout/AppChrome';

export const metadata: Metadata = {
  title: 'Dada Advisory | Lending Service Provider (LSP) - EWA & Payroll Loans',
  description:
    'Dada Advisory connects corporate employers, employees, and partner NBFCs for ethical Earned Wage Access and Corporate Salary Advance loans.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a1435',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between overflow-x-hidden">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
