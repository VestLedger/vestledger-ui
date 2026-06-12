"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PublicNavLinks } from "./public-nav-links";
import { LoginButton } from "./login-button";
import { BrandLogo } from "../brand-logo";

export function PublicMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="flex items-center gap-2 md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="public-mobile-navigation"
        className="public-marketing-shell-control inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--app-primary)] shadow-[0_14px_32px_rgba(7,16,32,0.14)] transition-colors sm:rounded-2xl"
      >
        <BrandLogo className="h-5 w-5" />
      </button>
      <span
        data-public-brand-wordmark="true"
        data-public-display="true"
        className="text-base font-semibold tracking-tight text-[var(--app-text)]"
      >
        VestLedger
      </span>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-transparent"
          />
          <div className="absolute left-0 right-0 top-full z-[60] mt-2">
            <div
              id="public-mobile-navigation"
              className="mx-2 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-bg)] shadow-xl sm:mx-0"
            >
              <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
                <div className="mx-auto w-full max-w-sm">
                  <PublicNavLinks
                    orientation="vertical"
                    includeHome
                    onNavigate={() => setIsOpen(false)}
                  />
                  <LoginButton className="public-marketing-shell-control mt-3 w-full justify-center btn-secondary btn-sm rounded-full text-[var(--app-text)] hover:border-[var(--app-border-strong)]" />
                  <Link
                    href="/eoi"
                    onClick={() => setIsOpen(false)}
                    className="mt-3 flex w-full justify-center rounded-full bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(29,78,216,0.24)] transition-opacity hover:opacity-90"
                  >
                    Meet Vesta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
