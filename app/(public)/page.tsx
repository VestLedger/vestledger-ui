import { HomepageStatic } from '@/components/homepage-static';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VestLedger - AI powered Capital',
  description: 'Institutional operating system for venture capital and private equity. AI-powered intelligence, Tokenized ownership and automated operations unified on one platform.',
  openGraph: {
    title: 'VestLedger - AI powered Capital',
    description: 'Institutional operating system for venture capital and private equity. AI-powered intelligence, Tokenized ownership and automated operations unified on one platform.',
    type: 'website',
  },
};

export default function Page() {
  return (
    <>
      <link rel="preload" href="/logo/Print_Transparent.svg" as="image" type="image/svg+xml" />
      <HomepageStatic />
    </>
  );
}
