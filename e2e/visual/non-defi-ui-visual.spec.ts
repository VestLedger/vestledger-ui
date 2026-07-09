import { expect, test, type Page } from "@playwright/test";
import {
  loginViaRedirect,
  hasRoleCredentials,
  getRoleCredentialEnvNames,
  type TestUserRole,
} from "../helpers/auth-helpers";

type VisualRoute = {
  path: string;
  role: TestUserRole;
  snapshot: string;
  viewport?: { width: number; height: number };
};

const MOBILE_VIEWPORT = { width: 375, height: 812 };

const VISUAL_ROUTES: VisualRoute[] = [
  { path: "/home", role: "gp", snapshot: "gp-home" },
  {
    path: "/home",
    role: "gp",
    snapshot: "gp-home-mobile",
    viewport: MOBILE_VIEWPORT,
  },
  { path: "/pipeline", role: "gp", snapshot: "gp-pipeline" },
  {
    path: "/pipeline",
    role: "gp",
    snapshot: "gp-pipeline-mobile",
    viewport: MOBILE_VIEWPORT,
  },
  { path: "/analytics", role: "analyst", snapshot: "analyst-analytics" },
  { path: "/lp-management", role: "ops", snapshot: "ops-lp-management" },
  { path: "/lp-portal", role: "lp", snapshot: "lp-portal" },
];

async function stabilizeForSnapshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
}

test.describe("Non-DeFi Visual Regression", () => {
  for (const route of VISUAL_ROUTES) {
    test(`matches baseline for ${route.snapshot}`, async ({ page }) => {
      test.skip(
        !hasRoleCredentials(route.role),
        `Missing ${Object.values(getRoleCredentialEnvNames(route.role)).join(" / ")}`,
      );

      await page.setViewportSize(
        route.viewport ?? { width: 1440, height: 900 },
      );
      await loginViaRedirect(page, route.path, {
        role: route.role,
        waitForLoadState: "networkidle",
      });
      await stabilizeForSnapshot(page);
      await expect(page).toHaveScreenshot(`${route.snapshot}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }

  test("captures pipeline redesigned-frame interaction states", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("gp"),
      `Missing ${Object.values(getRoleCredentialEnvNames("gp")).join(" / ")}`,
    );

    await page.setViewportSize({ width: 1440, height: 900 });
    await loginViaRedirect(page, "/pipeline", {
      role: "gp",
      waitForLoadState: "networkidle",
    });
    await stabilizeForSnapshot(page);

    // Topbar menu open state (menu -> command palette, Task 9 wiring).
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page).toHaveScreenshot("gp-pipeline-menu-open.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
    await page.keyboard.press("Escape");

    // Vesta rail active state (composer focused).
    await page.getByRole("textbox", { name: "Ask Vesta" }).click();
    await expect(page).toHaveScreenshot("gp-pipeline-vesta-rail-active.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
