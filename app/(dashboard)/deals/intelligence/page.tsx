"use client";

/**
 * Deals → Deal Intelligence (Phase 2 nested route).
 *
 * Canonical home for AI-assisted deal sourcing and analysis. The legacy
 * `/deal-intelligence` route is preserved by `next.config.js` redirects.
 */

import { DealIntelligence } from "@/components/deal-intelligence";

export default function DealsIntelligencePage() {
  return <DealIntelligence />;
}
