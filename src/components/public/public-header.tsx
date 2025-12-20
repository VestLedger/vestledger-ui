'use client';

import { useEffect } from 'react';
import { Button, Modal, Input } from '@/ui';
import { Select, SelectItem } from "@nextui-org/react";
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useAuth, PERSONA_CONFIG, UserRole } from '@/contexts/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUIKey } from '@/store/ui';

export function PublicHeader() {
  const { theme, setTheme } = useTheme();
  const { login } = useAuth();
  const { value: headerUI, patch: patchHeaderUI } = useUIKey('public-header', {
    mounted: false,
    showLoginModal: false,
    email: '',
    password: '',
    role: 'gp' as UserRole,
  });
  const mounted = headerUI.mounted;
  const showLoginModal = headerUI.showLoginModal;
  const email = headerUI.email;
  const password = headerUI.password;
  const role = headerUI.role;
  const router = useRouter();

  useEffect(() => {
    patchHeaderUI({ mounted: true });
  }, [patchHeaderUI]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);
    patchHeaderUI({ showLoginModal: false, password: '' });
    router.push('/dashboard');
  };

  return (
    <>
      <nav
        className="sticky top-0 left-0 right-0 z-50 w-full border-b border-[var(--app-border)] bg-[var(--app-surface)]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--app-surface)]/75"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="text-xl sm:text-2xl tracking-tight text-[var(--app-primary)] font-bold">
              VestLedger
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">Features</Link>
              <Link href="/how-it-works" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">How It Works</Link>
              <Link href="/security" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">Security</Link>
              <Link href="/eoi" className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors">Get Early Access</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-[var(--app-text-muted)]"
            >
              {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            </Button>
            <Button color="primary" onPress={() => patchHeaderUI({ showLoginModal: true })}>
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onOpenChange={(open) => patchHeaderUI({ showLoginModal: open })}
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
            value={email}
            onChange={(e) => patchHeaderUI({ email: e.target.value })}
            placeholder="you@company.com"
            isRequired
          />
          <Select
            label="Select Role (Demo)"
            placeholder="Select a persona"
            selectedKeys={[role]}
            onChange={(e) => patchHeaderUI({ role: e.target.value as UserRole })}
            disallowEmptySelection
            variant="bordered"
            classNames={{
               trigger: "bg-[var(--app-surface-hover)] border border-[var(--app-border-subtle)]",
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
            value={password}
            onChange={(e) => patchHeaderUI({ password: e.target.value })}
            placeholder="••••••••"
            isRequired
          />
          <Button type="submit" color="primary" className="w-full">
            Sign In
          </Button>
          <div className="text-center text-xs sm:text-sm text-[var(--app-text-muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/eoi" className="text-[var(--app-primary)] hover:underline">Sign up</Link>
          </div>
        </form>
      </Modal>
    </>
  );
}
