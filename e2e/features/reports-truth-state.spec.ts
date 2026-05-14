import { test, expect, loginViaRedirect } from "../fixtures/auth.fixture";

/**
 * P1-014 — Make report export truth explicit.
 *
 * The acceptance criterion is: the Completed download button only appears
 * when a real `downloadUrl` is present. These tests pin the visible
 * contract for each truth state by intercepting the reports endpoints and
 * driving the UI directly off the response.
 */
test.describe("Reports truth state (P1-014)", () => {
  const NOW = "2026-05-14T10:00:00.000Z";

  test.beforeEach(async ({ page }) => {
    await page.route("**/reports/templates", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "tmpl-portfolio-summary",
            name: "Portfolio Summary",
            type: "custom",
            description: "Portfolio overview",
            format: "pdf",
            sections: ["Overview"],
          },
        ]),
      });
    });

    await page.route("**/reports/export-jobs", async (route) => {
      if (route.request().method() !== "GET") {
        return route.continue();
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "job-completed-with-artifact",
            reportName: "Q1 LP Report",
            templateId: "tmpl-portfolio-summary",
            format: "pdf",
            status: "completed",
            progress: 100,
            downloadUrl: "https://files.example.com/q1-lp-report.pdf",
            artifactAvailable: true,
            createdAt: NOW,
          },
          {
            id: "job-completed-no-artifact",
            reportName: "Portfolio Dashboard",
            templateId: "tmpl-portfolio-summary",
            format: "excel",
            status: "completed_no_artifact",
            progress: 100,
            createdAt: NOW,
          },
          {
            id: "job-processing",
            reportName: "Deal Pipeline Report",
            templateId: "tmpl-portfolio-summary",
            format: "excel",
            status: "processing",
            progress: 40,
            createdAt: NOW,
          },
          {
            id: "job-queued",
            reportName: "Tax Pack",
            templateId: "tmpl-portfolio-summary",
            format: "pdf",
            status: "queued",
            progress: 0,
            createdAt: NOW,
          },
          {
            id: "job-failed",
            reportName: "Annual Fund Report",
            templateId: "tmpl-portfolio-summary",
            format: "pdf",
            status: "failed",
            progress: 80,
            createdAt: NOW,
          },
          {
            // Even if the server claims "completed", a missing downloadUrl
            // must be reclassified to completed_no_artifact by the UI.
            id: "job-completed-placeholder-url",
            reportName: "Legacy Report",
            templateId: "tmpl-portfolio-summary",
            format: "pdf",
            status: "completed",
            progress: 100,
            downloadUrl: "#",
            createdAt: NOW,
          },
        ]),
      });
    });
  });

  test("renders a download button only for completed jobs with a real downloadUrl", async ({
    page,
  }) => {
    await loginViaRedirect(page, "/reports");
    await page.waitForLoadState("networkidle");

    const completedRow = page
      .locator("div")
      .filter({ hasText: "Q1 LP Report" })
      .first();
    await expect(completedRow).toBeVisible({ timeout: 10000 });

    // Exactly one Download button on the page — for the only job with a
    // real artifact.
    const downloadButtons = page.getByTestId("report-download");
    await expect(downloadButtons).toHaveCount(1);
    await expect(downloadButtons).toHaveAttribute(
      "href",
      "https://files.example.com/q1-lp-report.pdf",
    );
  });

  test("completed_no_artifact rows surface the no-file message and no download", async ({
    page,
  }) => {
    await loginViaRedirect(page, "/reports");
    await page.waitForLoadState("networkidle");

    const noArtifactBanners = page.getByTestId("report-no-artifact");
    // Server-declared completed_no_artifact + UI-derived from `#` placeholder.
    await expect(noArtifactBanners).toHaveCount(2);

    const portfolioRow = page
      .locator("div")
      .filter({ hasText: "Portfolio Dashboard" })
      .first();
    await expect(portfolioRow).toBeVisible();
    await expect(
      portfolioRow.getByRole("button", { name: /download/i }),
    ).toHaveCount(0);
  });

  test("queued and processing jobs do not render a download button", async ({
    page,
  }) => {
    await loginViaRedirect(page, "/reports");
    await page.waitForLoadState("networkidle");

    for (const name of ["Tax Pack", "Deal Pipeline Report"]) {
      const row = page.locator("div").filter({ hasText: name }).first();
      await expect(row).toBeVisible();
      await expect(row.getByRole("button", { name: /download/i })).toHaveCount(
        0,
      );
    }
  });

  test("failed jobs do not render a download button", async ({ page }) => {
    await loginViaRedirect(page, "/reports");
    await page.waitForLoadState("networkidle");

    const failedRow = page
      .locator("div")
      .filter({ hasText: "Annual Fund Report" })
      .first();
    await expect(failedRow).toBeVisible();
    await expect(
      failedRow.getByRole("button", { name: /download/i }),
    ).toHaveCount(0);
  });
});
