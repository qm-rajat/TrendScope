import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrendScope — X Trends Intelligence Dashboard',
  description: 'Real-time trending topics and hashtags across X/Twitter by location, powered by GetXAPI with velocity analytics and historical movement tracking.',
  openGraph: {
    title: 'TrendScope — X Trends Intelligence Dashboard',
    description: 'Monitor trending topics and hashtags across X by location in real-time.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendScope — X Trends Intelligence Dashboard',
    description: 'Monitor trending topics and hashtags across X by location in real-time.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070B14] text-slate-100 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

