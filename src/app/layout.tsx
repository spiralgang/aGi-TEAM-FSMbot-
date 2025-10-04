import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
// Temporarily disabled Google Fonts due to network restrictions
// import { Inter, Source_Code_Pro } from 'next/font/google';

// Using fallback fonts for now
const fontBody = { variable: '--font-body' };
const fontCode = { variable: '--font-code' };

export const metadata: Metadata = {
  title: 'FSMAssist',
  description: 'Enhancing AI Coding with Finite State Machines',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          fontBody.variable,
          fontCode.variable,
          'font-body antialiased'
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}