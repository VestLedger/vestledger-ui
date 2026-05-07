"use client";

/**
 * LPs — Phase 1 navigation anchor.
 *
 * Phase 1 keeps the existing LP Management interior. Phase 3 replaces this
 * with the LP relationship cockpit (LP Overview, Capital Activity, LP
 * Performance, LP Reports) and adds redirects from `/lp-management` and
 * `/contacts`.
 */
import { LPManagement } from "@/components/lp-portal/lp-management";

export default function LPsPage() {
  return <LPManagement />;
}
