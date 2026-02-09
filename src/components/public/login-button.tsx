'use client';

import { buildAppLoginUrl } from '@/config/env';

interface LoginButtonProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Client-side login button that dynamically determines the app subdomain
 * Works in both development and production without environment variables
 */
export function LoginButton({ children = 'Login', className }: LoginButtonProps) {
  const handleLogin = () => {
    window.location.href = buildAppLoginUrl(window.location.hostname);
  };

  // Uses btn-secondary from the design system (globals.css)
  const defaultClassName = "btn-secondary btn-sm";

  return (
    <button
      onClick={handleLogin}
      className={className || defaultClassName}
    >
      {children}
    </button>
  );
}
