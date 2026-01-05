import { HomepageServer } from '@/components/homepage-server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VestLedger - The Triad OS for Private Markets',
  description: 'Institutional operating system for venture capital, private equity, and crypto funds. Tokenized ownership, automated operations, and AI-powered intelligence—unified on one platform.',
  openGraph: {
    title: 'VestLedger - The Triad OS for Private Markets',
    description: 'Institutional operating system for venture capital, private equity, and crypto funds.',
    type: 'website',
  },
};

export default function Page() {
  return <HomepageServer />;
}
