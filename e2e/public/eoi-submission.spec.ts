import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("EOI Form Submission", () => {
  test("should fill and submit the EOI form and show success state", async ({
    page,
  }) => {
    await page.goto("/eoi");
    await page.waitForLoadState("networkidle");

    // Fill text inputs
    await page.getByLabel("First Name").fill("Sunila");
    await page.getByLabel("Last Name").fill("Viz");
    await page.getByLabel("Work Email").fill("sunila.viz@gmail.com");
    await page.getByLabel("Company / Firm Name").fill("VestLedger");

    // Role select (HeroUI renders a hidden <select> + visible trigger button)
    await page.getByRole("button", { name: /select your role/i }).click();
    await page.getByRole("option", { name: "General Partner" }).click();

    // AUM select
    await page.getByRole("button", { name: /select range/i }).click();
    await page.getByRole("option", { name: "$50M - $200M" }).click();

    // Fund Strategy select
    await page.getByRole("button", { name: /select strategy/i }).click();
    await page.getByRole("option", { name: "Venture (Series A/B)" }).click();

    // Textarea
    await page
      .getByLabel("What would you want Vesta to help with first?")
      .fill("Analyzing deal flow and automating capital calls.");

    // Submit
    await page.getByRole("button", { name: /request your vesta/i }).click();

    // Wait for success state
    await expect(
      page.getByRole("heading", { name: /your vesta journey begins/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
