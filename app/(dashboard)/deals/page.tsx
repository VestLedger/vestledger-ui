"use client";

/**
 * Deals landing — Phase 2.
 *
 * `/deals` resolves to the Pipeline view by default. The unified workbench
 * sub-nav lives in `app/(dashboard)/deals/layout.tsx`. Phase 3+ may replace
 * this default with a deals-overview surface; today we render the same
 * Pipeline component the dedicated `/deals/pipeline` route uses so behaviour
 * is preserved for direct `/deals` visits.
 */

import { Pipeline } from "@/components/pipeline";

export default function DealsLandingPage() {
  return <Pipeline />;
}
