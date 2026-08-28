import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import TelemetryHud from '@/components/TelemetryHud';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'CineVault Studio � Archival & Stock Footage AI Sourcing Agent',
  description: 'Deconstruct screenplays, source verified historical masters across 15 institutional vaults, and export directly to Premiere Pro and DaVinci Resolve.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y29tcGFjdC1kZWVyLTg5LmNsZXJrLmFjY291bnRzLmRldiQ';

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <html lang="en" className="dark">
        <body className="bg-[#090b10] text-slate-100 antialiased min-h-screen flex flex-col font-sans">
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <TelemetryHud />
        </body>
      </html>
    </ClerkProvider>
  );
}
