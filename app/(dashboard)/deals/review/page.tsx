"use client";

/**
 * Deals → Dealflow Review (Phase 2 nested route).
 *
 * Canonical home for team consensus / voting / IC review. The legacy
 * `/dealflow-review` route is preserved by `next.config.js` redirects.
 */

import { DealflowReview } from "@/components/dealflow/dealflow-review";

export default function DealsReviewPage() {
  return <DealflowReview />;
}
