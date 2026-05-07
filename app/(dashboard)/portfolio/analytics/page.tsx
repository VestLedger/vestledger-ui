"use client";

/**
 * Portfolio → Analytics (Phase 2 nested route).
 *
 * Per the UX transformation plan, company-level analytics tabs (Valuation
 * Trends, Cohort Analysis, Risk Analysis, Portfolio Performance) belong
 * inside Portfolio. The fund-level cuts (J-Curve, Deployment) live under
 * `/funds/analytics` (Phase 3). For Phase 2 the existing `<Analytics />`
 * hub renders here unchanged; tab-by-tab splitting between Portfolio and
 * Funds is interior follow-up work in the tracker.
 */

import { Analytics } from "@/components/analytics";

export default function PortfolioAnalyticsPage() {
  return <Analytics />;
}
