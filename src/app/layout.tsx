import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';

export const metadata: Metadata = {
  title: 'আমার অনুষ্ঠান - University Student Event Management System',
  description: 'Enterprise University Event SaaS Platform for discovering events, student enrollment, QR ticketing, live attendance check-in, digital certificates, and club management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased transition-colors duration-300">
        <ThemeProvider>
          <SiteSettingsProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
