import { test, expect } from "@playwright/test";
import { createApiStorageState, getTestUser } from "../helpers/auth-helpers";
import {
  DASHBOARD_ROUTES,
  GP_ACCESSIBLE_ROUTES,
  GP_DENIED_ROUTES,
} from "../constants/routes";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Route Guards - Unauthenticated Redirect", () => {
  for (const route of DASHBOARD_ROUTES) {
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
