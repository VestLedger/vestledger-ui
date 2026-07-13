import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { getTestUser } from "../helpers/auth-helpers";

test.use({ storageState: { cookies: [], origins: [] } });

const SEEDED_USER = getTestUser();
const INVALID_PASSWORD = "DefinitelyWrongPassword123!";

async function gotoWithRetry(page: Page, route: string, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await page.goto(route);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isConnRefused = message.includes("ERR_CONNECTION_REFUSED");
      if (!isConnRefused || attempt === attempts) {
        throw error;
      }
      await page.waitForTimeout(1000 * attempt);
    }
  }
}

test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test("should display login form with all elements", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await expect(loginPage.brandLogo).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.signInButton).toBeVisible();
      await expect(loginPage.requestAccessLink).toBeVisible();
    });

    test("should show welcome message", async ({ page }) => {
      await page.goto("/login");
      await expect(
        page.getByRole("heading", { name: "Welcome back to Vesta" }),
      ).toBeVisible();
      await expect(
        page.getByText("Enter your credentials to continue."),
      ).toBeVisible();
      await expect(page.getByPlaceholder("jane@acme.vc")).toBeVisible();
      await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /forgot password/i }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: /create account|sign up/i }),
      ).toHaveCount(0);
    });

    test("should render the efficient branded shell and theme controls", async ({
      page,
    }) => {
      await page.goto("/login");

      await expect(page.getByTestId("login-logo-field")).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: "Toggle theme" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "VestLedger" }),
      ).toBeVisible();
    });

    test("should require email and password", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Try to submit empty form
      await loginPage.signInButton.click();

      // Form should have required validation
      await expect(loginPage.emailInput).toHaveAttribute("required", "");
      await expect(loginPage.passwordInput).toHaveAttribute("required", "");
    });

    test("should show error message for invalid credentials", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(SEEDED_USER.email, INVALID_PASSWORD);

      const authErrorToast = page
        .getByRole("alert")
        .filter({ hasText: /sign-in failed/i });
      await expect(authErrorToast).toBeVisible();
      await expect(authErrorToast).toContainText(
        /incorrect email or password\. please try again\./i,
      );
    });

    test("should navigate to request access page", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await expect(loginPage.requestAccessLink).toHaveAttribute("href", "/eoi");
    });

    test("should redirect to home dashboard after successful login", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);

      await expect
        .poll(
          () => {
            const pathname = new URL(page.url()).pathname;
            return pathname.endsWith("/") && pathname.length > 1
              ? pathname.slice(0, -1)
              : pathname;
          },
          { timeout: 20000 },
        )
        .toBe("/home");
    });

    test("should preserve redirect URL after login", async ({ page }) => {
      // Navigate to login with redirect parameter
      await page.goto("/login?redirect=/portfolio");

      const loginPage = new LoginPage(page);

      await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);

      await expect
        .poll(() => new URL(page.url()).pathname, { timeout: 15000 })
        .toBe("/portfolio");
    });

    test("should normalize legacy dashboard redirect URL after login", async ({
      page,
    }) => {
      await page.goto("/login?redirect=/dashboard");

      const loginPage = new LoginPage(page);
      await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);

      await expect
        .poll(() => new URL(page.url()).pathname, { timeout: 15000 })
        .toBe("/home");
    });
  });

  test.describe("Reduced motion", () => {
    test("should stop the branded background animation", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/login");

      await expect(page.getByTestId("login-logo-field")).toHaveCSS(
        "animation-name",
        "none",
      );
    });
  });

  test.describe("Session Management", () => {
    test("should return not found for removed dashboard route", async ({
      page,
    }) => {
      const response = await page.goto("/dashboard");
      expect(response?.status()).toBe(404);
    });
  });
});
