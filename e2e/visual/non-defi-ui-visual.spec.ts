import { expect, test, type Page } from '@playwright/test';
import { loginViaRedirect, type TestUserRole } from '../helpers/auth-helpers';

type VisualRoute = {
  path: string;
  role: TestUserRole;
  snapshot: string;
};

const VISUAL_ROUTES: VisualRoute[] = [
  { path: '/home', role: 'gp', snapshot: 'gp-home' },
  { path: '/pipeline', role: 'gp', snapshot: 'gp-pipeline' },
  { path: '/analytics', role: 'analyst', snapshot: 'analyst-analytics' },
  { path: '/lp-management', role: 'ops', snapshot: 'ops-lp-management' },
  { path: '/lp-portal', role: 'lp', snapshot: 'lp-portal' },
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
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
}

test.describe('Non-DeFi Visual Regression', () => {
  for (const route of VISUAL_ROUTES) {
    test(`matches baseline for ${route.snapshot}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await loginViaRedirect(page, route.path, {
        role: route.role,
        waitForLoadState: 'networkidle',
      });
      await stabilizeForSnapshot(page);
      await expect(page).toHaveScreenshot(`${route.snapshot}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
