import { ROUTE_PATHS } from "@/config/routes";

/**
 * Shell mode policy for authenticated (dashboard) routes — the named
 * routing/frame policy required by the spec (§Shell Mode Policy), replacing
 * hidden `pathname === "/home"` branches.
 *
 * Per-mode contract (spec §Shell Mode Requirements):
 * - "login":            /login renders directly; no navigation, no Vesta, no
 *                       topbar, page owns scroll, no PageScaffold assumption.
 * - "vesta-standalone": /vesta full assistant; no left navigation; Vesta IS
 *                       the surface; CommandPalette mounted.
 * - "redesign":         layout renders a minimal app background wrapper and
 *                       the route's page composes RedesignedFrameShell (left
 *                       Vesta command rail, redesigned topbar, optional
 *                       right rail). The FRAME owns scroll and the <main>
 *                       landmark; pages must not recreate full-screen
 *                       wrappers; PageScaffold is allowed inside the frame
 *                       body; mobile: rail stacks above content (drawer
 *                       model deferred to the mobile navigation spec).
 * - "legacy":           SidebarGrouped + Topbar + right AICopilotSidebar;
 *                       the layout owns <main> and scroll; PageScaffold
 *                       pages render as today; CommandPalette mounted.
 *
 * Migration is allowlist-only: add ROUTE_PATHS entries to
 * REDESIGNED_FRAME_ROUTES as pages are migrated. Never use implicit
 * "everything in dashboard except…" matching (spec §Migration Policy).
 */
export type ShellMode = "login" | "vesta-standalone" | "redesign" | "legacy";

const LOGIN_PATH = "/login";

export const REDESIGNED_FRAME_ROUTES: ReadonlySet<string> = new Set<string>([
  ROUTE_PATHS.dashboard,
  ROUTE_PATHS.pipeline,
]);

export function resolveShellMode(pathname: string): ShellMode {
  if (pathname === LOGIN_PATH) {
    return "login";
  }
  if (pathname === ROUTE_PATHS.vesta) {
    return "vesta-standalone";
  }
  if (REDESIGNED_FRAME_ROUTES.has(pathname)) {
    return "redesign";
  }
  return "legacy";
}
