"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { UserRole } from "@/types/auth";
import { GpDashboard } from "@/components/dashboards/gp-dashboard";

const DashboardLoading = () => (
  <div className="p-4 space-y-4 animate-pulse">
    <div className="h-6 w-48 rounded bg-[var(--app-surface-hover)]" />
    <div className="h-4 w-72 rounded bg-[var(--app-surface-hover)]" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
    </div>
  </div>
);

const AnalystDashboard = dynamic(
  () =>
    import("@/components/dashboards/analyst-dashboard").then(
      (mod) => mod.AnalystDashboard,
    ),
  { loading: () => <DashboardLoading /> },
);
const OpsDashboard = dynamic(
  () =>
    import("@/components/dashboards/ops-dashboard").then(
      (mod) => mod.OpsDashboard,
    ),
  { loading: () => <DashboardLoading /> },
);
const IRDashboard = dynamic(
  () =>
    import("@/components/dashboards/ir-dashboard").then(
      (mod) => mod.IRDashboard,
    ),
  { loading: () => <DashboardLoading /> },
);
const ResearcherDashboard = dynamic(
  () =>
    import("@/components/dashboards/researcher-dashboard").then(
      (mod) => mod.ResearcherDashboard,
    ),
  { loading: () => <DashboardLoading /> },
);
const LPDashboard = dynamic(
  () =>
    import("@/components/dashboards/lp-dashboard").then(
      (mod) => mod.LPDashboard,
    ),
  { loading: () => <DashboardLoading /> },
);
const AuditorDashboard = dynamic(
  () =>
    import("@/components/dashboards/auditor-dashboard").then(
      (mod) => mod.AuditorDashboard,
    ),
  { loading: () => <DashboardLoading /> },
);

/**
 * Maps each role to the dashboard it sees at `/home`.
 *
 * `Record<UserRole, ...>` is exhaustive on purpose: adding a `UserRole` won't
 * compile until it is given a dashboard here. `service_provider`,
 * `strategic_partner` and `superadmin` intentionally reuse the GP view for now.
 */
export const ROLE_DASHBOARDS: Record<UserRole, ComponentType> = {
  gp: GpDashboard,
  analyst: AnalystDashboard,
  ops: OpsDashboard,
  ir: IRDashboard,
  researcher: ResearcherDashboard,
  lp: LPDashboard,
  auditor: AuditorDashboard,
  service_provider: GpDashboard,
  strategic_partner: GpDashboard,
  superadmin: GpDashboard,
};

export function resolveRoleDashboard(
  role: UserRole | null | undefined,
): ComponentType {
  if (!role) return GpDashboard;
  return ROLE_DASHBOARDS[role] ?? GpDashboard;
}
