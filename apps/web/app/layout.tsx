import type { Metadata, Viewport } from 'next';
import { BottomNav } from './components/bottom-nav';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ecomerece - OS UI',
  description: 'OS-grade interfaces for every kind of website.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E9EAEE' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0B0D' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas pb-16 font-sans text-ink antialiased">
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <BottomNav />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
