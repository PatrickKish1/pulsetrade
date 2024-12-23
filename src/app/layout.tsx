// app/layout.tsx
// 'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CombinedProvider } from '@/lib/hooks/usePersistence';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PULSE TRADE AI',
  description: 'Your OP trading platform that super charges your trading experience.',
  applicationName: 'Pulse Trade AI Platform',
  icons: "/logo.png"  
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CombinedProvider>
          {children}
        </CombinedProvider>
      </body>
    </html>
  );
}