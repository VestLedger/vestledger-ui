"use client";

/**
 * Deals → AI Tools (Phase 2 nested route).
 *
 * Per the UX transformation plan, AI Decision Writer / AI Pitch Deck Reader /
 * AI Due Diligence Assistant belong inside Deals. Phase 2 lifts the existing
 * `<AITools />` hub here as a single-page entry point. Deeper embedding into
 * individual deal records (DD tab, IC review tab) is interior follow-up work
 * tracked under Phase 2 Module 2A in the master tracker.
 */

import { AITools } from "@/components/ai/ai-tools";

export default function DealsAIToolsPage() {
  return <AITools />;
}
