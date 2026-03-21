import Link from "next/link";
import { BrandLogo } from "../brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { LoginButton } from "./login-button";
import { PublicNavLinks } from "./public-nav-links";
import { PublicMobileMenu } from "./public-mobile-menu";

/**
 * Pure server-side header for public pages
 * Client components: ThemeToggle, LoginButton (minimal JS, ~3 KB total)
 */
export function PublicHeaderStatic() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full px-3 pt-3 sm:px-4 sm:pt-4">
      <nav className="mx-auto max-w-7xl rounded-[20px] border border-[color:var(--marketing-shell-border)] bg-[color:var(--marketing-shell-bg)] shadow-[0_24px_60px_rgba(7,16,32,0.18)] backdrop-blur-2xl">
        <div className="mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="hidden md:flex items-center gap-3 text-[var(--app-text)]"
            >
              <span className="public-marketing-shell-control flex h-11 w-11 items-center justify-center rounded-2xl text-lg text-[var(--app-primary)] shadow-[0_10px_28px_rgba(7,16,32,0.16)]">
                <BrandLogo className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span
                  data-public-display="true"
                  className="text-lg font-semibold leading-none"
                >
                  VestLedger
                </span>
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--app-text-subtle)]">
                  Vesta OS
                </span>
              </span>
            </Link>
            <PublicMobileMenu />
            <PublicNavLinks className="hidden md:flex" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LoginButton className="public-marketing-shell-control hidden sm:inline-flex btn-secondary btn-sm rounded-full text-[var(--app-text)] hover:border-[var(--app-border-strong)]" />
            <Link
              href="/eoi"
              className="hidden sm:flex btn-primary btn-sm rounded-full px-5"
            >
              Meet Vesta
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
