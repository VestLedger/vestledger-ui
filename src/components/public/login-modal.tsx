'use client';

import { useState } from 'react';
import { Modal, Input, Button } from '@/ui';
import { Select, SelectItem } from '@nextui-org/react';
import { useAuth, PERSONA_CONFIG, UserRole } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('gp');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);
    setPassword('');
    onClose();
    router.push('/dashboard');
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          isRequired
        />
        <Select
          label="Select Role (Demo)"
          placeholder="Select a persona"
          selectedKeys={[role]}
          onChange={(e) => setRole(e.target.value as UserRole)}
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
          onChange={(e) => setPassword(e.target.value)}
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
  );
}
