"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoadingState } from "@/ui/async-states";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { buildPublicWebUrl } from "@/config/env";

const LOGO_SRC = "/logo/Print_Transparent.svg";

// Dynamic import with ssr: false to prevent hydration mismatch
const LoginForm = dynamic(
  () =>
    import("@/components/login-form").then((mod) => ({
      default: mod.LoginForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="login-glass-card flex min-h-64 items-center justify-center">
        <LoadingState fullHeight={false} message="Loading..." />
      </div>
    ),
  },
);

// Login page is fully client-side to avoid hydration issues with auth state
export default function LoginPage() {
  const [brandHref, setBrandHref] = useState("/");

  useEffect(() => {
    setBrandHref(buildPublicWebUrl(window.location.host) || "/");
  }, []);

  return (
    <div className="login-page" data-testid="login-page-shell">
      <div
        aria-hidden="true"
        className="login-logo-field"
        data-testid="login-logo-field"
      />
      <div aria-hidden="true" className="login-page-scrim" />

      <header className="login-page-header">
        <ThemeToggle />
        <a className="login-brand-link" href={brandHref}>
          <Image
            aria-hidden="true"
            alt=""
            className="h-8 w-8 object-contain"
            height={32}
            priority
            src={LOGO_SRC}
            width={32}
          />
          <span>VestLedger</span>
        </a>
      </header>

      <main className="login-page-main">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
