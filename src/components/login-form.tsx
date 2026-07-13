"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button, Input } from "@/ui";
import { LoadingState } from "@/ui/async-states";
import { useAuth } from "@/contexts/auth-context";
import { getAuthErrorMessage } from "@/utils/auth-error-message";
import { ROUTE_PATHS } from "@/config/routes";
import { buildAdminSuperadminUrl, buildAppWebUrl } from "@/config/env";
import { resolveUserDomainTarget } from "@/utils/auth/internal-access";
import { useToast } from "@/ui";
import { extractFieldErrors } from "@/utils/errors/fieldErrors";
import { findFirstMissingRequiredField } from "@/utils/forms/required";

const LEGACY_DASHBOARD_PATH = "/dashboard";
const LOGO_SRC = "/logo/Print_Transparent.svg";

const normalizeRedirectPath = (redirectPath: string | null) => {
  if (!redirectPath) {
    return ROUTE_PATHS.dashboard;
  }

  if (redirectPath === LEGACY_DASHBOARD_PATH) {
    return ROUTE_PATHS.dashboard;
  }

  if (
    redirectPath.startsWith(`${LEGACY_DASHBOARD_PATH}/`) ||
    redirectPath.startsWith(`${LEGACY_DASHBOARD_PATH}?`)
  ) {
    return `${ROUTE_PATHS.dashboard}${redirectPath.slice(LEGACY_DASHBOARD_PATH.length)}`;
  }

  return redirectPath;
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, hydrated, status, error, clearError, user } =
    useAuth();
  const toast = useToast();
  const searchParams = useSearchParams();
  const hasAttemptedLogin = useRef(false);
  const fieldErrors = extractFieldErrors(error);
  const emailError = fieldErrors.email?.[0];
  const passwordError = fieldErrors.password?.[0];

  // Normalize legacy dashboard redirects to the new app home path
  const redirectTo = normalizeRedirectPath(searchParams.get("redirect"));

  // Handle successful authentication - redirect to intended page
  useEffect(() => {
    if (
      !hydrated ||
      !isAuthenticated ||
      !user ||
      typeof window === "undefined"
    ) {
      return;
    }

    const domainTarget = resolveUserDomainTarget(user);
    const nextUrl =
      domainTarget === "admin"
        ? buildAdminSuperadminUrl(window.location.host)
        : `${buildAppWebUrl(window.location.host)}${redirectTo}`;

    if (window.location.href !== nextUrl) {
      window.location.href = nextUrl;
    }
  }, [hydrated, isAuthenticated, user, redirectTo]);

  // Handle login failure - stop spinner and show error
  useEffect(() => {
    if (status === "failed" && hasAttemptedLogin.current) {
      setIsSubmitting(false);
    }
  }, [status]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
    // Only clear on input changes, not when error changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missingField = findFirstMissingRequiredField([
      { key: "email", label: "Email", value: email },
      { key: "password", label: "Password", value: password },
    ]);

    if (missingField) {
      toast.warning(
        `${missingField.label} is required.`,
        "Missing information",
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    hasAttemptedLogin.current = true;
    login(email.trim(), password);
  };

  const isLoading = isSubmitting && status === "loading";

  // Show loading state while auth is hydrating
  if (!hydrated) {
    return (
      <div className="login-glass-card flex min-h-64 items-center justify-center">
        <LoadingState fullHeight={false} message="Loading..." />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="login-heading"
      className="login-glass-card"
      data-testid="login-card"
    >
      <div className="mb-1 text-center">
        <Image
          alt="VestLedger logo"
          className="mx-auto mb-5 h-24 w-24 object-contain"
          data-testid="login-card-logo"
          height={96}
          priority
          src={LOGO_SRC}
          width={96}
        />
        <h1
          className="mb-2 text-2xl font-semibold tracking-tight text-[var(--app-text)]"
          id="login-heading"
        >
          Welcome back to Vesta
        </h1>
        <p className="text-sm text-[var(--app-text-muted)]">
          Enter your credentials to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="login-field-group">
          <Input
            autoComplete="email"
            classNames={{
              errorMessage: "text-xs text-[var(--app-danger)]",
              input:
                "text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-subtle)]",
              inputWrapper: "login-input-wrapper",
              label: "text-sm font-medium text-[var(--app-text)]",
            }}
            errorMessage={emailError}
            isInvalid={Boolean(emailError)}
            isRequired
            label="Work email"
            labelPlacement="outside"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@acme.vc"
            type="email"
            value={email}
          />
        </div>

        <div className="login-field-group">
          <Input
            autoComplete="current-password"
            classNames={{
              errorMessage: "text-xs text-[var(--app-danger)]",
              input:
                "text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-subtle)]",
              inputWrapper: "login-input-wrapper",
              label: "text-sm font-medium text-[var(--app-text)]",
            }}
            errorMessage={passwordError}
            isInvalid={Boolean(passwordError)}
            isRequired
            label="Password"
            labelPlacement="outside"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            type="password"
            value={password}
          />
        </div>

        {error && (
          <div className="p-3 rounded-md border border-app-danger dark:border-app-dark-danger bg-app-danger-light dark:bg-app-dark-danger-light text-app-text dark:text-app-dark-text text-sm">
            {getAuthErrorMessage(error)}
          </div>
        )}

        <Button
          type="submit"
          color="primary"
          className="login-submit-button mt-4 w-full"
          endContent={
            isLoading ? null : (
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            )
          }
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign in
        </Button>

        <div className="mt-5 text-center text-sm text-app-text-muted dark:text-app-dark-text-muted">
          Don&apos;t have an account?{" "}
          <a
            href="/eoi"
            className="text-app-primary dark:text-app-dark-primary hover:underline"
          >
            Request Access
          </a>
        </div>
      </form>
    </section>
  );
}
