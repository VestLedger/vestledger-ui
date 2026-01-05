import { PublicHeaderServer } from '@/components/public/public-header-server';
import { PublicFooter } from '@/components/public/public-footer';
import './public.css';
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
    <>
      {/* Inline critical CSS to eliminate render blocking */}
      <style dangerouslySetInnerHTML={{__html: `
        nav{position:sticky;top:0;left:0;right:0;z-index:50;width:100%;border-bottom:1px solid var(--app-border);background-color:rgba(var(--app-surface-rgb),0.92);backdrop-filter:blur(12px)}
        .public-hero{position:relative;overflow:hidden;padding-top:2.5rem;padding-bottom:2.5rem}
        .logo-mark{display:inline-block;width:2.25rem;height:2.25rem}
        .public-shell{min-height:100vh;display:flex;flex-direction:column}
        .font-display{font-family:var(--font-body),-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;line-height:1.25}
        .max-w-7xl{max-width:80rem;margin-left:auto;margin-right:auto}
        .grid{display:grid}.flex{display:flex}.flex-col{flex-direction:column}.flex-grow{flex-grow:1}
        .items-center{align-items:center}.items-start{align-items:flex-start}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.justify-start{justify-content:flex-start}
        .gap-3{gap:0.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}
        .text-center{text-align:center}.font-bold{font-weight:700}.font-semibold{font-semibold:600}.leading-tight{line-height:1.25}.leading-relaxed{line-height:1.625}
        .px-4{padding-left:1rem;padding-right:1rem}.py-3{padding-top:0.75rem;padding-bottom:0.75rem}.py-10{padding-top:2.5rem;padding-bottom:2.5rem}.py-12{padding-top:3rem;padding-bottom:3rem}
        .p-6{padding:1.5rem}.p-8{padding:2rem}.pt-4{padding-top:1rem}
        .mb-4{margin-bottom:1rem}.mb-5{margin-bottom:1.25rem}.mb-6{margin-bottom:1.5rem}.mt-4{margin-top:1rem}
        .text-4xl{font-size:2.25rem}.text-5xl{font-size:3rem}.text-6xl{font-size:3.75rem}.text-base{font-size:1rem}.text-lg{font-size:1.125rem}.text-xl{font-size:1.25rem}.text-sm{font-size:0.875rem}.text-xs{font-size:0.75rem}
        .rounded-lg{border-radius:0.5rem}.rounded-full{border-radius:9999px}.border{border-width:1px}.border-t{border-top-width:1px}
        .space-y-3>*+*{margin-top:0.75rem}
        @media (min-width:640px){.sm\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.sm\\:py-12{padding-top:3rem;padding-bottom:3rem}.sm\\:text-5xl{font-size:3rem}.sm\\:text-lg{font-size:1.125rem}.sm\\:h-56{height:14rem}.sm\\:p-8{padding:2rem}.sm\\:flex-row{flex-direction:row}.sm\\:gap-4{gap:1rem}}
        @media (min-width:768px){.md\\:text-6xl{font-size:3.75rem}.md\\:text-xl{font-size:1.25rem}.md\\:py-16{padding-top:4rem;padding-bottom:4rem}}
        @media (min-width:1024px){.lg\\:grid-cols-\\[1\\.1fr_0\\.9fr\\]{grid-template-columns:1.1fr 0.9fr}.lg\\:grid-cols-\\[0\\.45fr_0\\.55fr\\]{grid-template-columns:0.45fr 0.55fr}}
        html{background-color:var(--app-bg);color:var(--app-text)}body{margin:0;padding:0}
        .inline-flex{display:inline-flex}.relative{position:relative}.z-10{z-index:10}
      `}} />
      <div className="min-h-screen public-shell flex flex-col">
        <PublicHeaderServer />
        <main className="flex-grow">
          {children}
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
