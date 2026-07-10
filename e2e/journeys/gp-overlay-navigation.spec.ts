import { test, expect } from "../fixtures/auth.fixture";

test.describe("GP workflow overlay navigation", () => {
  test("burger opens the overlay with lifecycle stages on /home", async ({
    page,
  }) => {
    await page.goto("/home");
    await page.getByLabel("Open menu").click();
    await expect(page.getByText("Workflow stages")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Raise & LP Onboarding")).toBeVisible();
    await expect(page.getByText("Deal Execution & Closing")).toBeVisible();
  });

  test("search finds a workflow and navigates to its destination", async ({
    page,
  }) => {
    await page.goto("/home");
    await page.getByLabel("Open menu").click();
    await page
      .getByPlaceholder(/Search workflows, pages, and actions/)
      .fill("capital call");
    await expect(page.getByText("Capital Calls").first()).toBeVisible();
    await page.getByText("Capital Calls").first().click();
    await expect(page).toHaveURL(/\/fund-admin/, { timeout: 10000 });
  });

  test("planned destination lands on fallback with a toast, never a dead end", async ({
    page,
  }) => {
    await page.goto("/home");
    await page.getByLabel("Open menu").click();
    await page
      .getByPlaceholder(/Search workflows, pages, and actions/)
      .fill("ddq");
    await page.getByText("DDQ & Questionnaires").click();
    await expect(page).toHaveURL(/\/lp-management/, { timeout: 10000 });
    await expect(page.getByText("Planned destination")).toBeVisible();
  });

  test("burger also opens the overlay on /pipeline", async ({ page }) => {
    await page.goto("/pipeline");
    await page.getByLabel("Open menu").click();
    await expect(page.getByText("Workflow stages")).toBeVisible({
      timeout: 10000,
    });
  });
});
