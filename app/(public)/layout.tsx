import { PublicHeaderStatic } from '@/components/public/public-header-static';
import { PublicFooter } from '@/components/public/public-footer';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://vestledger.com'),
  title: {
    default: 'VestLedger - The Triad OS for Private Markets',
    template: '%s | VestLedger',
  },
  description: 'Institutional operating system for venture capital, private equity, and crypto funds. Tokenized ownership, automated operations, and AI-powered intelligence.',
  keywords: ['venture capital', 'private equity', 'crypto funds', 'fund administration', 'VC software', 'LP portal', 'tokenized assets'],
  authors: [{ name: 'VestLedger' }],
  creator: 'VestLedger',
  publisher: 'VestLedger',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VestLedger',
    title: 'VestLedger - The Triad OS for Private Markets',
    description: 'Institutional operating system for venture capital, private equity, and crypto funds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VestLedger - The Triad OS for Private Markets',
    description: 'Institutional operating system for venture capital, private equity, and crypto funds.',
    creator: '@vestledger',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex flex-col">
      <PublicHeaderStatic />
      <main className="flex-grow">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
