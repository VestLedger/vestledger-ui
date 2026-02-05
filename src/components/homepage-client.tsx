'use client';

import { Button } from '@/ui';
import Link from 'next/link';
import { useUIKey } from '@/store/ui';
import { LoginModal } from '@/components/login-modal';

type HomepageUIState = {
  showLoginModal: boolean;
};

const homepageFallback: HomepageUIState = {
  showLoginModal: false,
};

function useHomepageUI() {
  return useUIKey<HomepageUIState>('homepage', homepageFallback);
}

export function HomepageHeroActions() {
  const { patch } = useHomepageUI();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      <Button color="primary" size="lg" onPress={() => patch({ showLoginModal: true })}>
        Get Started
      </Button>
      <Button as={Link} href="/how-it-works" variant="bordered" size="lg">
        Watch Demo
      </Button>
    </div>
  );
}

export function HomepageCTAButton() {
  const { patch } = useHomepageUI();

  return (
    <Button color="primary" size="lg" onPress={() => patch({ showLoginModal: true })}>
      Start Your Free Trial
    </Button>
  );
}

export function HomepageLoginModal() {
  const { value: homepageUI, patch: patchHomepageUI } = useHomepageUI();

  return (
    <LoginModal
      isOpen={homepageUI.showLoginModal}
      onOpenChange={(open) => patchHomepageUI({ showLoginModal: open })}
    />
  );
}
