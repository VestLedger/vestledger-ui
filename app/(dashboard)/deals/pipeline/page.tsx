"use client";

/**
 * Deals → Pipeline (Phase 2 nested route).
 *
 * Canonical home for the pipeline interior. The legacy `/pipeline` route is
 * preserved by `next.config.js` redirects and the page file under
 * `app/(dashboard)/pipeline/`.
 */

import { Pipeline } from "@/components/pipeline";

export default function DealsPipelinePage() {
  return <Pipeline />;
}
