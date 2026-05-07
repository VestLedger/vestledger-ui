"use client";

/**
 * Workflows — Phase 1 navigation anchor.
 *
 * Phase 1 keeps the existing Fund Admin queues as the interior because Fund
 * Admin already represents the broadest set of operational workflows in the
 * current UI. Phase 4 replaces this with a queue-based UX (status, owner,
 * deadline, evidence, approval path, escalation) consolidating Capital Calls,
 * Distributions, Expenses, Secondary Transfers, Compliance, Audit Trail, and
 * Tax operations under nested routes, with redirects from the legacy paths.
 */
import { FundAdmin } from "@/components/back-office/fund-admin";

export default function WorkflowsPage() {
  return <FundAdmin />;
}
