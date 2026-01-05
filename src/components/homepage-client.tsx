'use client';

import type { FormEvent } from 'react';
import { Button, Input, Modal } from '@/ui';
import { Select, SelectItem } from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, PERSONA_CONFIG, UserRole } from '@/contexts/auth-context';
import { useUIKey } from '@/store/ui';

type HomepageUIState = {
  showLoginModal: boolean;
  email: string;
  password: string;
  role: UserRole;
};

const homepageFallback: HomepageUIState = {
  showLoginModal: false,
  email: '',
  password: '',
  role: 'gp',
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
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(homepageUI.email, homepageUI.password, homepageUI.role);
    patchHomepageUI({ showLoginModal: false, password: '' });
    router.push('/dashboard');
  };

  return (
    <Modal
      isOpen={homepageUI.showLoginModal}
      onOpenChange={(open) => patchHomepageUI({ showLoginModal: open })}
      size="md"
      title={
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">Welcome back</h3>
          <p className="text-sm text-[var(--app-text-muted)]">Sign in to your vestledger account</p>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4 pb-6">
        <Input
          label="Email"
          type="email"
          value={homepageUI.email}
          onChange={(e) => patchHomepageUI({ email: e.target.value })}
          placeholder="you@company.com"
          isRequired
        />
        <Select
          label="Select Role (Demo)"
          placeholder="Select a persona"
          selectedKeys={[homepageUI.role]}
          onChange={(e) => patchHomepageUI({ role: e.target.value as UserRole })}
          disallowEmptySelection
          variant="bordered"
          classNames={{
            trigger: 'bg-[var(--app-surface-hover)] border border-[var(--app-border-subtle)]',
          }}
        >
          {Object.values(PERSONA_CONFIG).map((persona) => (
            <SelectItem key={persona.id} value={persona.id} textValue={persona.label}>
              <div className="flex flex-col">
                <span className="text-small">{persona.label}</span>
                <span className="text-tiny text-[var(--app-text-muted)]">{persona.description}</span>
              </div>
            </SelectItem>
          ))}
        </Select>
        <Input
          label="Password"
          type="password"
          value={homepageUI.password}
          onChange={(e) => patchHomepageUI({ password: e.target.value })}
          placeholder="••••••••"
          isRequired
        />
        <Button type="submit" color="primary" className="w-full">
          Sign In
        </Button>
        <div className="text-center text-xs sm:text-sm text-[var(--app-text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/eoi" className="text-[var(--app-primary)] hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </Modal>
  );
}
