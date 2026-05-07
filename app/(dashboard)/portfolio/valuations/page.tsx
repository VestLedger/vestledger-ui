"use client";

/**
 * Portfolio → Valuations (Phase 2 nested route).
 *
 * Canonical home for 409A valuations under the Portfolio module. Reuses the
 * existing back-office Valuation409A component without reshaping its
 * interior. The legacy `/409a-valuations` route is preserved by
 * `next.config.js` redirects.
 */

import { Valuation409A } from "@/components/back-office/valuation-409a";

export default function PortfolioValuationsPage() {
  return <Valuation409A />;
}
