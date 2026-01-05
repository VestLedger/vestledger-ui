'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Select, SelectItem } from '@nextui-org/react';
import { Button, Input } from '@/ui';
import { ThemeToggle } from '@/components/public/theme-toggle';
import { useAuth, PERSONA_CONFIG, UserRole } from '@/contexts/auth-context';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('gp');
  const { login } = useAuth();
  const router = useRouter();
  const homepageUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_APP_URL ?? '/';
    }

    const { hostname, origin } = window.location;
    return hostname.startsWith('app.') ? origin.replace('//app.', '//') : origin;
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    login(email, password, role);
    setPassword('');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--app-bg)] px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <a href={homepageUrl} className="flex items-center gap-3" aria-label="VestLedger homepage">
            <Image
              src="/logo/Print_Transparent.svg"
              alt="VestLedger logo"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="text-2xl tracking-tight text-[var(--app-primary)] dark:text-[var(--app-text)] font-bold">
              VestLedger
            </span>
          </a>
        </div>

        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg p-8 shadow-lg">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-[var(--app-text-muted)]">
              Sign in to your vestledger account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              isRequired
            />

            <Select
              label="Select Role (Demo)"
              placeholder="Select a persona"
              selectedKeys={[role]}
              onChange={(event) => setRole(event.target.value as UserRole)}
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
                    <span className="text-tiny text-[var(--app-text-muted)]">
                      {persona.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </Select>

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              isRequired
            />

            <Button type="submit" color="primary" className="w-full">
              Sign In
            </Button>

            <div className="text-center text-sm text-[var(--app-text-muted)] pt-2">
              Don&apos;t have an account?{' '}
              <Link href="/eoi" className="text-[var(--app-primary)] hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <a
            href={homepageUrl}
            className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
