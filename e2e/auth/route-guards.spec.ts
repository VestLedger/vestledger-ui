import { test, expect, type Page } from "@playwright/test";
import { createApiStorageState, getTestUser } from "../helpers/auth-helpers";
import {
  GP_ACCESSIBLE_ROUTES,
  GP_DENIED_ROUTES,
  LEGACY_DASHBOARD_REDIRECT_ROUTES,
  PROTECTED_DASHBOARD_ROUTES,
} from "../constants/routes";

const LOCAL_GP_USER = {
  id: "route-guard-gp",
  name: "Route Guard GP",
  email: "route-guard-gp@example.test",
  role: "gp",
  tenantId: "route-guard-tenant",
};

async function seedLocalGpCookieSession(
  page: Page,
  baseURL: string | undefined,
) {
  const appOrigin = new URL(baseURL || "http://localhost:3000").origin;
  const expires = Math.floor(Date.now() / 1000) + 86400;
  const encodedUser = encodeURIComponent(JSON.stringify(LOCAL_GP_USER));

  await page.context().addCookies([
    {
      name: "isAuthenticated",
      value: "true",
      url: appOrigin,
      expires,
      sameSite: "Lax",
    },
    {
      name: "user",
      value: encodedUser,
      url: appOrigin,
      expires,
      sameSite: "Lax",
    },
    {
      name: "accessToken",
      value: "route-guard-local-token",
      url: appOrigin,
      expires,
      sameSite: "Lax",
    },
    {
      name: "dataModeOverride",
      value: "api",
      url: appOrigin,
      expires,
      sameSite: "Lax",
    },
  ]);
}

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Route Guards - Unauthenticated Redirect", () => {
  for (const route of PROTECTED_DASHBOARD_ROUTES) {
    test(`unauthenticated visit to ${route} should redirect to /login`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("Route Guards - Authenticated Access (gp)", () => {
  test("authenticated gp user can visit all accessible routes", async ({
    page,
    baseURL,
  }) => {
    const appOrigin = new URL(baseURL || "http://localhost:3000").origin;
    const storageState = await createApiStorageState(appOrigin, getTestUser());

    // Seed auth into context before any navigation
    await page.context().addCookies(storageState.cookies);
    for (const { origin, localStorage } of storageState.origins) {
      await page.goto(origin, { waitUntil: "domcontentloaded" });
      await page.evaluate((items) => {
        for (const { name, value } of items) {
          window.localStorage.setItem(name, value);
        }
      }, localStorage);
    }

    for (const route of GP_ACCESSIBLE_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const currentPath = new URL(page.url()).pathname;
      expect(
        currentPath,
        `Expected to land on ${route}, got ${currentPath}`,
      ).not.toBe("/login");
      expect(
        currentPath === route || currentPath.startsWith(`${route}/`),
        `Expected path to start with ${route}, got ${currentPath}`,
      ).toBe(true);
    }
  });

  for (const { route, target } of LEGACY_DASHBOARD_REDIRECT_ROUTES) {
    test(`authenticated gp visit to ${route} should redirect to ${target}`, async ({
      page,
      baseURL,
    }) => {
      await seedLocalGpCookieSession(page, baseURL);

      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${target}(?:[?#]|$)`));

      const currentPath = new URL(page.url()).pathname;
      expect(
        currentPath,
        `Expected legacy route ${route} to redirect to ${target}`,
      ).toBe(target);
    });
  }
});

test.describe("Route Guards - Role-Denied Routes (gp)", () => {
  test("gp user is redirected away from restricted routes", async ({
    page,
    baseURL,
  }) => {
    const appOrigin = new URL(baseURL || "http://localhost:3000").origin;
    const storageState = await createApiStorageState(appOrigin, getTestUser());

    await page.context().addCookies(storageState.cookies);
    for (const { origin, localStorage } of storageState.origins) {
      await page.goto(origin, { waitUntil: "domcontentloaded" });
      await page.evaluate((items) => {
        for (const { name, value } of items) {
          window.localStorage.setItem(name, value);
        }
      }, localStorage);
    }

    for (const route of GP_DENIED_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const currentPath = new URL(page.url()).pathname;
      expect(currentPath, `Should not stay on denied route ${route}`).not.toBe(
        route,
      );
      expect(
        currentPath,
        `Should not be on /login (user is authenticated)`,
      ).not.toBe("/login");
    }
  });
});
