"use client";

/**
 * Funds — Phase 1 navigation anchor.
 *
 * Phase 1 keeps the existing fund-level Analytics surface as the interior.
 * Phase 3 replaces this with a unified Funds module (Waterfall + NAV + Fund
 * Setup + Carried Interest + fund-level analytics) and adds redirects from
 * `/analytics` and `/waterfall`.
 */
import { Analytics } from "@/components/analytics";

export default function FundsPage() {
  return <Analytics />;
}
