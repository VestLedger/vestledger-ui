'use client';

import { Button } from '@/ui';
import Link from 'next/link';

export function HomepageHeroActions() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      <Button as={Link} href="/eoi" color="primary" size="lg">
        Request Demo
      </Button>
      <Button as={Link} href="/how-it-works" variant="bordered" size="lg">
        Watch Demo
      </Button>
    </div>
  );
}

export function HomepageCTAButton() {
  return (
    <Button as={Link} href="/eoi" color="primary" size="lg">
      Request Demo
    </Button>
  );
}
