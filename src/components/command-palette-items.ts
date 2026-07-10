import {
  NAV_STAGE_LABEL_BY_ID,
  type NavStageId,
} from "@/config/navigation-stages";
import {
  NAV_DESTINATIONS,
  type CoverageState,
  type NavDestination,
} from "@/config/navigation-destinations";
import { canRoleAccessPath } from "@/config/route-access-control";
import type { UserRole } from "@/types/auth";

export type PaletteView = "root" | "stage" | "search";

export function resolvePaletteView(
  search: string,
  stageFilter: string | null,
): PaletteView {
  if (search.trim().length > 0) return "search";
  if (stageFilter) return "stage";
  return "root";
}

export function isDestinationVisible(
  dest: NavDestination,
  role: UserRole | undefined,
): boolean {
  if (!canRoleAccessPath(role, dest.route)) return false;
  if (dest.fallbackRoute && !canRoleAccessPath(role, dest.fallbackRoute)) {
    return false;
  }
  return true;
}

export function destinationsForStage(
  stageId: NavStageId,
  role: UserRole | undefined,
): NavDestination[] {
  return NAV_DESTINATIONS.filter(
    (d) =>
      d.stage === stageId &&
      d.coverageState !== "deferred_persona" &&
      isDestinationVisible(d, role),
  );
}

export function searchableDestinations(
  role: UserRole | undefined,
): NavDestination[] {
  return NAV_DESTINATIONS.filter((d) => isDestinationVisible(d, role));
}

export function destinationSearchKeywords(dest: NavDestination): string[] {
  const stageLabel =
    dest.stage === "family-office"
      ? "Family Office"
      : NAV_STAGE_LABEL_BY_ID[dest.stage as NavStageId];
  return [...dest.keywords, ...dest.workflowPatterns, stageLabel];
}

export function coverageBadge(
  state: CoverageState,
): "Planned" | "Future" | null {
  if (state === "needs_tab" || state === "needs_shell") return "Planned";
  if (state === "deferred_persona") return "Future";
  return null;
}
