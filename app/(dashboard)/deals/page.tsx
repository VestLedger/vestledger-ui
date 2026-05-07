"use client";

/**
 * Deals — Phase 1 navigation anchor.
 *
 * Per the UX transformation plan, the canonical top-level path for deal work
 * is `/deals`. Phase 1 keeps the existing Pipeline interior so no functionality
 * is lost; Phase 2 replaces this with a unified Pipeline + Deal Intelligence +
 * Dealflow Review workflow and adds redirects from the legacy `/pipeline`,
 * `/deal-intelligence`, and `/dealflow-review` routes.
 */
import { Pipeline } from "@/components/pipeline";

export default function DealsPage() {
  return <Pipeline />;
}
