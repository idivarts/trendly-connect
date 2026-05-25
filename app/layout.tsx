import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trendly Connect',
  description: 'Connect your social media accounts to Trendly',
  metadataBase: new URL('https://connect.trendly.now'),
  robots: { index: false, follow: false },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-ink-900 text-slate-100 min-h-dvh">
        {children}
      </body>
    </html>
  );
}
