import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join the Pilot Program - VestLedger',
  description: 'Get early access to VestLedger and help shape the future of VC operations. Limited spots available for the upcoming cohort.',
  openGraph: {
    title: 'Join the Pilot Program - VestLedger',
    description: 'Get early access to VestLedger and help shape the future of VC operations.',
    type: 'website',
  },
};

export default function EOILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
