/**
 * API contract test.
 *
 * Calls each frontend service function in API mode against a live NestJS
 * instance and asserts no 4xx response. Catches the class of bug where the
 * frontend request body / query string drifts from the backend DTO.
 *
 * Skipped unless RUN_API_CONTRACT=1. Requires the docker-compose stack
 * (or any reachable API at NEXT_PUBLIC_API_BASE_URL) to be running and
 * seeded. Run via `pnpm test:contract`.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const SEED_EMAIL = process.env.SEED_EMAIL ?? "james.chen@apexventures.com";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Password123!";

const enabled = process.env.RUN_API_CONTRACT === "1";
const skip = !enabled;

const STORAGE_TOKEN_KEY = "accessToken";
const DATA_MODE_KEY = "dataModeOverride";

let fundId = "";
let allFunds: Array<{ id: string; name: string }> = [];

beforeAll(async () => {
  if (!enabled) return;

  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SEED_EMAIL, password: SEED_PASSWORD }),
  });
  if (!loginResponse.ok) {
    throw new Error(
      `Login failed (${loginResponse.status}): is the API up at ${API_URL}? ` +
        `Try \`docker compose up -d\`.`,
    );
  }
  const { access_token: token } = (await loginResponse.json()) as {
    access_token: string;
  };

  globalThis.localStorage.setItem(STORAGE_TOKEN_KEY, token);
  globalThis.localStorage.setItem(DATA_MODE_KEY, "api");

  const fundsResponse = await fetch(`${API_URL}/funds`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const fundsBody = (await fundsResponse.json()) as
    | { data: typeof allFunds }
    | typeof allFunds;
  allFunds = Array.isArray(fundsBody) ? fundsBody : (fundsBody.data ?? []);
  if (allFunds.length === 0) {
    throw new Error(
      "No funds returned from /funds — seed data missing. Re-run seed.",
    );
  }
  fundId = allFunds[0].id;
});

afterAll(() => {
  if (!enabled) return;
  globalThis.localStorage.removeItem(STORAGE_TOKEN_KEY);
  globalThis.localStorage.removeItem(DATA_MODE_KEY);
});

describe.skipIf(skip)("API contract: read endpoints", () => {
  it("GET /funds returns funds with portfolioCount populated", async () => {
    const { fetchFunds } = await import("@/services/fundsService");
    const funds = await fetchFunds({});
    expect(funds.length).toBeGreaterThan(0);
    // Regression: portfolioCount used to be hardcoded to 0 in the mapper.
    const someFundHasCompanies = funds.some(
      (fund) => (fund.portfolioCount ?? 0) > 0,
    );
    expect(someFundHasCompanies).toBe(true);
  });

  it("GET /capital-calls/active", async () => {
    const { getCapitalCalls } =
      await import("@/services/backOffice/fundAdminService");
    await expect(getCapitalCalls()).resolves.toEqual(expect.any(Array));
  });

  it("GET /funds/:id/capital-calls", async () => {
    const { getCapitalCalls } =
      await import("@/services/backOffice/fundAdminService");
    await expect(getCapitalCalls(fundId)).resolves.toEqual(expect.any(Array));
  });

  it("GET /distributions (no filter)", async () => {
    const { fetchDistributions } =
      await import("@/services/backOffice/distributionService");
    await expect(fetchDistributions()).resolves.toEqual(expect.any(Array));
  });

  it("GET /distributions?status=pending-approval (UI hyphen → API underscore)", async () => {
    const { fetchDistributions } =
      await import("@/services/backOffice/distributionService");
    // Regression: backend rejects 'pending-approval'; mapper must convert to 'pending_approval'.
    await expect(
      fetchDistributions({ status: ["pending-approval"] }),
    ).resolves.toEqual(expect.any(Array));
  });

  it("GET /funds/:id/carry/accruals", async () => {
    const { getCarryAccruals } =
      await import("@/services/backOffice/carryService");
    await expect(getCarryAccruals(fundId)).resolves.toEqual(expect.any(Array));
  });

  it("GET /funds/:id/carry/terms", async () => {
    const { getCarriedInterestTerms } =
      await import("@/services/backOffice/carryService");
    await expect(getCarriedInterestTerms(fundId)).resolves.toEqual(
      expect.any(Array),
    );
  });

  it("GET /analytics/performance (and the rest of the snapshot)", async () => {
    const { fetchFundAnalyticsSnapshot } =
      await import("@/services/analytics/fundAnalyticsService");
    const snapshot = await fetchFundAnalyticsSnapshot(fundId);
    expect(snapshot.fundMetrics.fundSize).toBeGreaterThan(0);
    // Regression: cohorts/concentration/valuation-trends/deployment all returned empty
    // because the mapper read the wrong field names. Don't assert non-empty for funds
    // that legitimately have no data — just that the call doesn't throw.
    expect(Array.isArray(snapshot.cohortsVintage)).toBe(true);
    expect(Array.isArray(snapshot.deploymentPacing)).toBe(true);
    expect(Array.isArray(snapshot.valuationTrends)).toBe(true);
  });

  it("GET /portfolio + /portfolio/health", async () => {
    const { fetchPortfolioSnapshot } =
      await import("@/services/portfolio/portfolioDataService");
    const snapshot = await fetchPortfolioSnapshot(fundId);
    expect(Array.isArray(snapshot.companies)).toBe(true);
  });

  it("GET /distributions/calendar", async () => {
    const { fetchDistributionCalendarEvents } =
      await import("@/services/backOffice/distributionService");
    await expect(fetchDistributionCalendarEvents()).resolves.toEqual(
      expect.any(Array),
    );
  });
});

describe.skipIf(skip)("API contract: mutation endpoint shapes", () => {
  it("POST /funds/:id/carry/accruals/calculate accepts { fundName }", async () => {
    const { calculateCarryAccrual } =
      await import("@/services/backOffice/carryService");
    // Regression: this used to send { fundId } and 400 on `fundName` validator.
    const result = await calculateCarryAccrual(fundId, allFunds[0].name);
    expect(result).toBeDefined();
  });
});
