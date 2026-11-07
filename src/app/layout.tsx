import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import TelemetryHud from '@/components/TelemetryHud';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'CineVault Studio — Archival Ingest & Rights Clearance',
  description: 'Search 15 institutional historical vaults, verify 17 U.S.C. § 105 public domain clearance, and export native cutlists directly to Premiere Pro and DaVinci Resolve.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y29tcGFjdC1kZWVyLTg5LmNsZXJrLmFjY291bnRzLmRldiQ';

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const t = localStorage.getItem('cinevault_theme');
                  if (t === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className="bg-[#0b0c0e] text-slate-100 antialiased min-h-screen flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-200">
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
