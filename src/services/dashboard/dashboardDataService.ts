import { isMockMode } from "@/config/data-mode";
import {
  getMockDashboardData,
  type DashboardData as MockDashboardData,
  type DailyBriefItem,
  type FundTrustRow,
  type HomeBlocker,
  type HomeOpportunity,
  type PortfolioRevenueRow,
  type PortfolioRevenueTrendPoint,
  type RevenueDistributionSlice,
} from "@/data/mocks/hooks/dashboard-data";
import { requestJson } from "@/services/shared/httpClient";
import type { Fund, FundViewMode } from "@/types/fund";
import { ROUTE_PATHS } from "@/config/routes";
import { formatDate } from "@/utils/formatting/date";

export type DashboardData = MockDashboardData;

const BRIEF_HORIZON_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RECENT_MONTHS = 7;

export function createEmptyDashboardData(): DashboardData {
  return {
    capitalCalls: [],
    portfolioCompanies: [],
    alerts: [],
    quickActions: [],
    tasks: [],
    morningBrief: {
      summary: "",
      confidence: 0,
      asOf: new Date(),
      horizonDays: 7,
      itemCount: 0,
      urgentCount: 0,
      importantCount: 0,
    },
    dailyBriefItems: [],
    fundHealthRows: [],
    portfolioSignals: [],
    fundTrustRows: [],
    portfolioRevenueRows: [],
    blockers: [],
    opportunities: [],
    revenueDistribution: [],
    portfolioRevenueTrend: [],
    metrics: {
      overdueCapitalCalls: 0,
      upcomingDeadlines: 0,
      atRiskCompanies: 0,
      healthyCompanies: 0,
      totalTasks: 0,
      urgentTasks: 0,
    },
    selectedFundName: "",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseDate(value: unknown, fallback = new Date()): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toQuadrant(
  urgencyScore: number,
  importanceScore: number,
  dueDate: Date,
  now: Date,
): DailyBriefItem["quadrant"] {
  const daysUntilDue = Math.floor(
    (dueDate.getTime() - now.getTime()) / MS_PER_DAY,
  );
  const urgent = urgencyScore >= 8 || daysUntilDue <= 2;
  const important = importanceScore >= 8;

  if (urgent && important) return "urgent-important";
  if (urgent) return "urgent-non-important";
  if (important) return "non-urgent-important";
  return "non-urgent-non-important";
}

function quadrantRank(quadrant: DailyBriefItem["quadrant"]): number {
  switch (quadrant) {
    case "urgent-important":
      return 0;
    case "urgent-non-important":
      return 1;
    case "non-urgent-important":
      return 2;
    default:
      return 3;
  }
}

function isDashboardLikePayload(value: Record<string, unknown>): boolean {
  return (
    "capitalCalls" in value ||
    "portfolioCompanies" in value ||
    "alerts" in value ||
    "tasks" in value ||
    "metrics" in value ||
    "morningBrief" in value
  );
}

function unwrapDashboardPayload(
  payload: unknown,
): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (isDashboardLikePayload(payload)) return payload;

  const nestedKeys = ["data", "payload", "result"] as const;
  for (const key of nestedKeys) {
    const nested = payload[key];
    if (isRecord(nested) && isDashboardLikePayload(nested)) {
      return nested;
    }
  }

  return payload;
}

function mapAlertType(value: unknown): "critical" | "warning" | "info" {
  const normalized = readString(value).toLowerCase();
  if (
    normalized === "critical" ||
    normalized === "high" ||
    normalized === "error"
  )
    return "critical";
  if (normalized === "warning" || normalized === "medium") return "warning";
  return "info";
}

function mapTaskDomain(
  value: unknown,
): DashboardData["tasks"][number]["domain"] {
  const normalized = readString(value).toLowerCase();
  if (
    normalized === "capital-calls" ||
    normalized === "portfolio" ||
    normalized === "compliance" ||
    normalized === "operations" ||
    normalized === "reporting"
  ) {
    return normalized;
  }
  return "operations";
}

function normalizeCapitalCalls(value: unknown): DashboardData["capitalCalls"] {
  const today = new Date();
  return ensureArray<unknown>(value)
    .filter(isRecord)
    .map((item, index) => {
      const dueDate = parseDate(item.dueDate, today);
      const amount = readNumber(item.amount);
      const collected = readNumber(item.collected);
      const totalLPs = readNumber(item.totalLPs, 0);
      const respondedLPs = readNumber(item.respondedLPs, 0);
      const overdueLPs = readNumber(item.overdueLPs, 0);
      const prediction = isRecord(item.prediction) ? item.prediction : {};

      return {
        id: readString(item.id, `capital-call-${index + 1}`),
        fundName: readString(item.fundName, "Fund"),
        amount,
        collected,
        dueDate,
        totalLPs,
        respondedLPs,
        overdueLPs,
        prediction: {
          expectedCompletion: parseDate(
            prediction.expectedCompletion,
            new Date(dueDate.getTime() + 3 * MS_PER_DAY),
          ),
          confidence: clamp(readNumber(prediction.confidence, 0.72), 0, 1),
          atRiskLPs: ensureArray<unknown>(prediction.atRiskLPs)
            .filter(isRecord)
            .map((lp) => ({
              name: readString(lp.name, "LP"),
              typicalDelayDays: readNumber(lp.typicalDelayDays, 3),
            })),
        },
      };
    });
}

function normalizePortfolioCompanies(
  value: unknown,
): DashboardData["portfolioCompanies"] {
  return ensureArray<unknown>(value)
    .filter(isRecord)
    .map((item, index) => {
      const health = clamp(readNumber(item.health, 72), 0, 100);
      const healthChange = clamp(readNumber(item.healthChange, 0), -100, 100);
      const runway = Math.max(0, readNumber(item.runway, 14));
      const prediction = isRecord(item.prediction) ? item.prediction : {};

      return {
        id: readString(item.id, `company-${index + 1}`),
        name: readString(item.name, `Portfolio Company ${index + 1}`),
        health,
        healthChange,
        runway,
        burnRate: readNumber(item.burnRate),
        prediction: {
          nextQuarterHealth: clamp(
            readNumber(
              prediction.nextQuarterHealth,
              health + healthChange * 0.45,
            ),
            0,
            100,
          ),
          confidence: clamp(readNumber(prediction.confidence, 0.78), 0, 1),
          reasoning: readString(
            prediction.reasoning,
            "Derived from current health trend and runway posture.",
          ),
        },
        anomalies: ensureArray<unknown>(item.anomalies)
          .filter(isRecord)
          .map((anomaly) => ({
            metric: readString(anomaly.metric, "health"),
            change: readString(anomaly.change, "n/a"),
            severity:
              readString(anomaly.severity, "low") === "high"
                ? "high"
                : readString(anomaly.severity, "low") === "medium"
                  ? "medium"
                  : "low",
          })),
      };
    });
}

function normalizeAlerts(value: unknown): DashboardData["alerts"] {
  return ensureArray<unknown>(value)
    .filter(isRecord)
    .map((item, index) => {
      const type = mapAlertType(item.type ?? item.severity);
      const priority = clamp(
        readNumber(
          item.priority,
          type === "critical" ? 90 : type === "warning" ? 70 : 45,
        ),
        0,
        100,
      );
      const title = readString(item.title, `Alert ${index + 1}`);
      const description = readString(
        item.description,
        readString(item.message, "Action recommended."),
      );

      return {
        id: readString(item.id, `alert-${index + 1}`),
        type,
        title,
        description,
        priority,
        reasoning: readString(
          item.reasoning,
          `System marked this as ${type} based on urgency and operational impact.`,
        ),
      };
    });
}

function normalizeTasks(value: unknown): DashboardData["tasks"] {
  return ensureArray<unknown>(value)
    .filter(isRecord)
    .map((item, index) => {
      const urgency = clamp(readNumber(item.urgency, 6), 0, 10);
      const impact = clamp(
        readNumber(
          item.impact,
          readNumber(item.priorityScore, urgency * 6) / Math.max(urgency, 1),
        ),
        0,
        10,
      );
      const statusRaw = readString(item.status, "pending");
      const status: DashboardData["tasks"][number]["status"] =
        statusRaw === "completed" || statusRaw === "in_progress"
          ? statusRaw
          : "pending";

      return {
        id: readString(item.id, `task-${index + 1}`),
        title: readString(item.title, `Task ${index + 1}`),
        description: readString(
          item.description,
          "Review and action required.",
        ),
        domain: mapTaskDomain(item.domain),
        urgency,
        impact,
        priorityScore: clamp(
          readNumber(item.priorityScore, urgency * impact),
          0,
          100,
        ),
        estimatedTime: readString(item.estimatedTime, "30 min"),
        status,
        delegationSuggestion: isRecord(item.delegationSuggestion)
          ? {
              person: readString(item.delegationSuggestion.person, "Team"),
              reasoning: readString(item.delegationSuggestion.reasoning, ""),
            }
          : undefined,
      };
    });
}

function deriveFundTrustRows(sourceFunds: Fund[]): FundTrustRow[] {
  return sourceFunds
    .map((fund) => {
      const deploymentPct = Math.round(
        (fund.deployedCapital / Math.max(fund.totalCommitment, 1)) * 100,
      );
      const statusPenalty =
        fund.status === "active" ? 0 : fund.status === "fundraising" ? 5 : 9;

      const lpCommitmentRate = clamp(
        Math.round(
          84 + fund.irr * 0.25 - (deploymentPct > 92 ? 8 : 0) - statusPenalty,
        ),
        62,
        99,
      );
      const reportingQuality = clamp(
        Math.round(79 + fund.tvpi * 5.5 + (fund.status === "closed" ? 5 : 0)),
        68,
        98,
      );
      const lpSatisfaction = clamp(
        Math.round(
          lpCommitmentRate * 0.45 +
            reportingQuality * 0.35 +
            clamp(fund.irr * 1.2, 0, 100) * 0.2,
        ),
        60,
        98,
      );
      const capitalEfficiency = clamp(
        Math.round(
          fund.tvpi * 24 -
            (deploymentPct > 90 ? 8 : 0) +
            (fund.status === "fundraising" ? 4 : 0),
        ),
        58,
        98,
      );

      const trustScore = Math.round(
        (lpCommitmentRate +
          reportingQuality +
          lpSatisfaction +
          capitalEfficiency) /
          4,
      );
      const trustDelta = clamp(
        Math.round(
          (fund.irr - 18) / 4 + (fund.tvpi - 1.6) * 3 - statusPenalty / 3,
        ),
        -9,
        9,
      );

      const riskFlag: FundTrustRow["riskFlag"] =
        trustScore < 75 ? "critical" : trustScore < 85 ? "watch" : "stable";

      return {
        id: fund.id,
        displayName: fund.displayName,
        status: fund.status,
        trustScore,
        trustDelta,
        lpCommitmentRate,
        reportingQuality,
        lpSatisfaction,
        capitalEfficiency,
        deploymentPct,
        availableCapital: fund.availableCapital,
        irr: fund.irr,
        tvpi: fund.tvpi,
        riskFlag,
      };
    })
    .sort((a, b) => a.trustScore - b.trustScore);
}

function derivePortfolioRevenueRows(
  companies: DashboardData["portfolioCompanies"],
): PortfolioRevenueRow[] {
  return companies
    .map((company) => {
      const anomalyCount = company.anomalies?.length ?? 0;
      const health = clamp(company.health, 0, 100);
      const runwayMonths = Math.max(0, company.runway);
      const arr = Math.max(
        1,
        Math.round(
          ((health / 100) * 22 + Math.max(0, company.burnRate / 200_000)) * 10,
        ) / 10,
      );
      const arrGrowthQoq = clamp(
        Math.round(company.healthChange * 1.6),
        -30,
        45,
      );
      const valuation = Math.max(
        8,
        Math.round(arr * (health >= 80 ? 8 : health >= 70 ? 7 : 6)),
      );
      const valuationPotential: PortfolioRevenueRow["valuationPotential"] =
        runwayMonths < 9 || health < 70
          ? "watch"
          : arrGrowthQoq >= 20
            ? "high"
            : "medium";

      const riskFlag: PortfolioRevenueRow["riskFlag"] =
        health < 70 || runwayMonths < 9
          ? "critical"
          : health < 80 || runwayMonths < 12 || anomalyCount > 0
            ? "watch"
            : "stable";

      const upsideLabel =
        valuationPotential === "high"
          ? `~$${Math.max(10, Math.round(arr * 1.25))}M upside`
          : valuationPotential === "watch"
            ? "Stabilization required"
            : "Measured upside";

      return {
        id: company.id,
        name: company.name,
        arr,
        arrGrowthQoq,
        valuation,
        valuationPotential,
        upsideLabel,
        runwayMonths,
        anomalyCount,
        riskFlag,
        healthScore: health,
        healthDelta: company.healthChange,
        route: ROUTE_PATHS.portfolio,
      };
    })
    .sort((a, b) => b.arr - a.arr);
}

function derivePortfolioSignals(
  rows: PortfolioRevenueRow[],
): DashboardData["portfolioSignals"] {
  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      healthScore: row.healthScore,
      healthDelta: row.healthDelta,
      runwayMonths: row.runwayMonths,
      anomalyCount: row.anomalyCount,
      riskFlag: row.riskFlag,
      route: row.route,
    }))
    .sort((a, b) => a.healthScore - b.healthScore);
}

function mapDomainToRoute(
  domain: DashboardData["tasks"][number]["domain"],
): Pick<DailyBriefItem, "route" | "tabTarget" | "lane"> {
  if (domain === "capital-calls") {
    return {
      route: ROUTE_PATHS.fundAdmin,
      tabTarget: "capital-calls",
      lane: "LP Relations",
    };
  }
  if (domain === "portfolio") {
    return { route: ROUTE_PATHS.portfolio, lane: "Portfolio" };
  }
  if (domain === "compliance") {
    return { route: ROUTE_PATHS.compliance, lane: "Operations" };
  }
  if (domain === "reporting") {
    return { route: ROUTE_PATHS.reports, lane: "LP Relations" };
  }
  return { route: ROUTE_PATHS.dashboard, lane: "Operations" };
}

function mapAlertToRouteAndLane(
  alert: DashboardData["alerts"][number],
): Pick<DailyBriefItem, "route" | "tabTarget" | "lane"> {
  const lowerTitle = alert.title.toLowerCase();
  if (
    lowerTitle.includes("capital call") ||
    lowerTitle.includes("lp") ||
    lowerTitle.includes("trust")
  ) {
    return {
      route: ROUTE_PATHS.fundAdmin,
      tabTarget: "capital-calls",
      lane: "LP Relations",
    };
  }
  if (lowerTitle.includes("compliance")) {
    return { route: ROUTE_PATHS.compliance, lane: "Operations" };
  }
  if (
    lowerTitle.includes("portfolio") ||
    lowerTitle.includes("company") ||
    lowerTitle.includes("runway") ||
    lowerTitle.includes("revenue")
  ) {
    return { route: ROUTE_PATHS.portfolio, lane: "Portfolio" };
  }
  return { route: ROUTE_PATHS.dashboard, lane: "Operations" };
}

function deriveDailyBriefItems(
  tasks: DashboardData["tasks"],
  alerts: DashboardData["alerts"],
  capitalCalls: DashboardData["capitalCalls"],
  now: Date,
): DailyBriefItem[] {
  const activeTasks = tasks.filter((task) => task.status !== "completed");
  const taskItems: DailyBriefItem[] = activeTasks.map((task, index) => {
    const dueDate = new Date(
      now.getTime() + (index % BRIEF_HORIZON_DAYS) * MS_PER_DAY,
    );
    const urgencyScore = clamp(Math.round(task.urgency), 1, 10);
    const importanceScore = clamp(Math.round(task.impact), 1, 10);
    const routeContext = mapDomainToRoute(task.domain);

    return {
      id: `brief-task-${task.id}`,
      type: "task",
      title: task.title,
      description: task.description,
      owner: task.delegationSuggestion?.person || "GP",
      lane: routeContext.lane,
      dueDate,
      urgencyScore,
      importanceScore,
      route: routeContext.route,
      tabTarget: routeContext.tabTarget,
      quadrant: toQuadrant(urgencyScore, importanceScore, dueDate, now),
    };
  });

  const warningItems: DailyBriefItem[] = alerts.map((alert, index) => {
    const dueDate = new Date(
      now.getTime() + (index % BRIEF_HORIZON_DAYS) * MS_PER_DAY,
    );
    const urgencyScore = clamp(Math.round(alert.priority / 10), 4, 10);
    const importanceScore = clamp(
      Math.round((alert.priority + 10) / 12),
      4,
      10,
    );
    const routeContext = mapAlertToRouteAndLane(alert);

    return {
      id: `brief-alert-${alert.id}`,
      type: "warning",
      title: alert.title,
      description: alert.description,
      owner: "GP",
      lane: routeContext.lane,
      dueDate,
      urgencyScore,
      importanceScore,
      route: routeContext.route,
      tabTarget: routeContext.tabTarget,
      quadrant: toQuadrant(urgencyScore, importanceScore, dueDate, now),
    };
  });

  const overdueCallWarnings: DailyBriefItem[] = capitalCalls
    .filter((call) => call.overdueLPs > 0)
    .map((call) => {
      const dueDate = new Date(now.getTime() + MS_PER_DAY);
      const urgencyScore = 9;
      const importanceScore = 8;

      return {
        id: `brief-capital-call-${call.id}`,
        type: "warning",
        title: `Escalate overdue LP commitments for ${call.fundName}`,
        description: `${call.overdueLPs} LPs overdue. ${call.respondedLPs}/${call.totalLPs} have responded.`,
        owner: "Fund Admin",
        lane: "LP Relations",
        dueDate,
        urgencyScore,
        importanceScore,
        route: ROUTE_PATHS.fundAdmin,
        tabTarget: "capital-calls",
        quadrant: toQuadrant(urgencyScore, importanceScore, dueDate, now),
      };
    });

  return [...taskItems, ...warningItems, ...overdueCallWarnings].sort(
    (a, b) => {
      const quadrantDiff = quadrantRank(a.quadrant) - quadrantRank(b.quadrant);
      if (quadrantDiff !== 0) return quadrantDiff;
      if (a.dueDate.getTime() !== b.dueDate.getTime()) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return (
        b.urgencyScore +
        b.importanceScore -
        (a.urgencyScore + a.importanceScore)
      );
    },
  );
}

function deriveBlockers(items: DailyBriefItem[], now: Date): HomeBlocker[] {
  const dedup = new Set<string>();
  return items
    .filter(
      (item) =>
        item.quadrant === "urgent-important" ||
        (item.type === "warning" && item.urgencyScore >= 8),
    )
    .map((item) => {
      const severity: HomeBlocker["severity"] =
        item.urgencyScore >= 9 && item.importanceScore >= 8
          ? "critical"
          : item.urgencyScore >= 8
            ? "warning"
            : "info";

      const blockedDays = Math.max(
        1,
        Math.ceil((now.getTime() - item.dueDate.getTime()) / MS_PER_DAY),
      );

      return {
        id: `blocker-${item.id}`,
        sourceId: item.id,
        title: item.title,
        description: item.description,
        blockedDays,
        severity,
        lane: item.lane,
        route: item.route,
        tabTarget: item.tabTarget,
        fundId: item.fundId,
        searchHint: item.searchHint,
      };
    })
    .filter((blocker) => {
      const key = blocker.title.toLowerCase();
      if (dedup.has(key)) return false;
      dedup.add(key);
      return true;
    })
    .sort((a, b) => {
      const severityRank = { critical: 0, warning: 1, info: 2 } as const;
      const rankDiff = severityRank[a.severity] - severityRank[b.severity];
      if (rankDiff !== 0) return rankDiff;
      if (a.blockedDays !== b.blockedDays) return b.blockedDays - a.blockedDays;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 6);
}

function deriveOpportunities(rows: PortfolioRevenueRow[]): HomeOpportunity[] {
  const candidates = [...rows]
    .filter((row) => row.arrGrowthQoq > 12)
    .sort((a, b) => b.arrGrowthQoq - a.arrGrowthQoq)
    .slice(0, 3);

  return candidates.map((row) => ({
    id: `opp-${row.id}`,
    sourceId: row.id,
    title: `${row.name} expansion window`,
    thesis: `${row.name} is tracking $${row.arr.toFixed(1)}M ARR with ${row.arrGrowthQoq}% QoQ growth.`,
    impactLabel: row.upsideLabel,
    confidence: clamp(0.62 + row.arrGrowthQoq / 100, 0.62, 0.95),
    lane: "Portfolio",
    route: ROUTE_PATHS.portfolio,
    companyName: row.name,
    searchHint: row.name,
  }));
}

function deriveTrendPoints(
  payloadTrend: unknown,
  rows: PortfolioRevenueRow[],
  now: Date,
): PortfolioRevenueTrendPoint[] {
  const provided = ensureArray<unknown>(payloadTrend)
    .filter(isRecord)
    .map((item) => ({
      month: readString(item.month),
      arr: readNumber(item.arr),
    }))
    .filter((point) => point.month.length > 0);

  if (provided.length > 0) return provided;

  const currentArr = Math.max(
    1,
    rows.reduce((sum, row) => sum + row.arr, 0),
  );
  const startArr = Math.max(1, Math.round(currentArr * 0.72 * 10) / 10);
  const points: PortfolioRevenueTrendPoint[] = [];

  for (let index = 0; index < RECENT_MONTHS; index += 1) {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - (RECENT_MONTHS - 1 - index),
      1,
    );
    const month = formatDate(monthDate, { month: "short" });
    const arr =
      Math.round(
        (startArr +
          ((currentArr - startArr) * index) / Math.max(RECENT_MONTHS - 1, 1)) *
          10,
      ) / 10;
    points.push({ month, arr });
  }

  return points;
}

function deriveRevenueDistribution(
  payloadSlices: unknown,
  rows: PortfolioRevenueRow[],
  trend: PortfolioRevenueTrendPoint[],
): RevenueDistributionSlice[] {
  const provided = ensureArray<unknown>(payloadSlices)
    .filter(isRecord)
    .map((slice, index) => ({
      id: readString(slice.id, `rev-${index + 1}`),
      name: readString(slice.name, `Slice ${index + 1}`),
      value: readNumber(slice.value),
      color: readString(slice.color, "#64748b"),
    }))
    .filter((slice) => slice.value > 0);

  if (provided.length > 0) return provided;

  const topContributors = rows.slice(0, 3);
  if (topContributors.length === 0) return [];

  const colors = ["#10b981", "#3b82f6", "#f59e0b"];
  const topSum = topContributors.reduce((sum, row) => sum + row.arr, 0);
  const currentArr = trend[trend.length - 1]?.arr ?? topSum;
  const others = Math.max(0, Math.round((currentArr - topSum) * 10) / 10);

  const slices: RevenueDistributionSlice[] = topContributors.map(
    (row, index) => ({
      id: `rev-${row.id}`,
      name: row.name,
      value: row.arr,
      color: colors[index] ?? "#64748b",
    }),
  );

  if (others > 0) {
    slices.push({
      id: "rev-others",
      name: "Others",
      value: others,
      color: "#94a3b8",
    });
  }

  return slices;
}

function normalizeDashboardPayload(
  payload: unknown,
  selectedFund: Fund | null,
  funds: Fund[],
): DashboardData {
  const base = createEmptyDashboardData();
  const root = unwrapDashboardPayload(payload);
  if (!root) return base;

  const now = new Date();
  const metrics = isRecord(root.metrics) ? root.metrics : {};
  const morningBrief = isRecord(root.morningBrief) ? root.morningBrief : {};

  const capitalCalls = normalizeCapitalCalls(root.capitalCalls);
  const portfolioCompanies = normalizePortfolioCompanies(
    root.portfolioCompanies,
  );
  const alerts = normalizeAlerts(root.alerts);
  const tasks = normalizeTasks(root.tasks);
  const quickActions = ensureArray(
    root.quickActions,
  ) as DashboardData["quickActions"];

  const sourceFunds =
    funds.length > 0 ? funds : selectedFund ? [selectedFund] : [];
  const derivedFundTrustRows = deriveFundTrustRows(sourceFunds);
  const portfolioRevenueRows = derivePortfolioRevenueRows(portfolioCompanies);
  const portfolioSignals = derivePortfolioSignals(portfolioRevenueRows);
  const dailyBriefItems = deriveDailyBriefItems(
    tasks,
    alerts,
    capitalCalls,
    now,
  );
  const blockers = deriveBlockers(dailyBriefItems, now);
  const opportunities = deriveOpportunities(portfolioRevenueRows);
  const portfolioRevenueTrend = deriveTrendPoints(
    root.portfolioRevenueTrend,
    portfolioRevenueRows,
    now,
  );
  const revenueDistribution = deriveRevenueDistribution(
    root.revenueDistribution,
    portfolioRevenueRows,
    portfolioRevenueTrend,
  );

  const urgentCount = dailyBriefItems.filter((item) =>
    item.quadrant.startsWith("urgent"),
  ).length;
  const importantCount = dailyBriefItems.filter((item) =>
    item.quadrant.endsWith("important"),
  ).length;
  const currentArr =
    portfolioRevenueTrend[portfolioRevenueTrend.length - 1]?.arr ?? 0;
  const trustWatchCount = derivedFundTrustRows.filter(
    (row) => row.riskFlag !== "stable",
  ).length;

  return {
    capitalCalls,
    portfolioCompanies,
    alerts,
    quickActions,
    tasks,
    morningBrief: {
      summary:
        typeof morningBrief.summary === "string" &&
        morningBrief.summary.trim().length > 0
          ? morningBrief.summary
          : `Revenue makers currently track $${currentArr.toFixed(1)}M ARR. ${urgentCount} urgent and ${importantCount} important signals are active, with ${blockers.length} blockers and ${trustWatchCount} funds on trust watch.`,
      confidence:
        typeof morningBrief.confidence === "number" &&
        Number.isFinite(morningBrief.confidence)
          ? morningBrief.confidence
          : 0.9,
      asOf: parseDate(morningBrief.asOf, now),
      horizonDays:
        typeof morningBrief.horizonDays === "number" &&
        Number.isFinite(morningBrief.horizonDays)
          ? morningBrief.horizonDays
          : BRIEF_HORIZON_DAYS,
      itemCount:
        typeof morningBrief.itemCount === "number" &&
        Number.isFinite(morningBrief.itemCount)
          ? morningBrief.itemCount
          : dailyBriefItems.length,
      urgentCount:
        typeof morningBrief.urgentCount === "number" &&
        Number.isFinite(morningBrief.urgentCount)
          ? morningBrief.urgentCount
          : urgentCount,
      importantCount:
        typeof morningBrief.importantCount === "number" &&
        Number.isFinite(morningBrief.importantCount)
          ? morningBrief.importantCount
          : importantCount,
    },
    dailyBriefItems,
    fundHealthRows: derivedFundTrustRows.map((row) => ({
      id: row.id,
      displayName: row.displayName,
      status: row.status,
      healthScore: row.trustScore,
      healthDelta: row.trustDelta,
      deploymentPct: row.deploymentPct,
      availableCapital: row.availableCapital,
      irr: row.irr,
      tvpi: row.tvpi,
      riskFlag: row.riskFlag,
    })),
    portfolioSignals,
    fundTrustRows: derivedFundTrustRows,
    portfolioRevenueRows,
    blockers,
    opportunities,
    revenueDistribution,
    portfolioRevenueTrend,
    metrics: {
      overdueCapitalCalls:
        typeof metrics.overdueCapitalCalls === "number" &&
        Number.isFinite(metrics.overdueCapitalCalls)
          ? metrics.overdueCapitalCalls
          : capitalCalls.filter((call) => call.overdueLPs > 0).length,
      upcomingDeadlines:
        typeof metrics.upcomingDeadlines === "number" &&
        Number.isFinite(metrics.upcomingDeadlines)
          ? metrics.upcomingDeadlines
          : dailyBriefItems.length,
      atRiskCompanies:
        typeof metrics.atRiskCompanies === "number" &&
        Number.isFinite(metrics.atRiskCompanies)
          ? metrics.atRiskCompanies
          : portfolioRevenueRows.filter((row) => row.riskFlag === "critical")
              .length,
      healthyCompanies:
        typeof metrics.healthyCompanies === "number" &&
        Number.isFinite(metrics.healthyCompanies)
          ? metrics.healthyCompanies
          : portfolioRevenueRows.filter((row) => row.riskFlag === "stable")
              .length,
      totalTasks:
        typeof metrics.totalTasks === "number" &&
        Number.isFinite(metrics.totalTasks)
          ? metrics.totalTasks
          : tasks.filter((task) => task.status !== "completed").length,
      urgentTasks:
        typeof metrics.urgentTasks === "number" &&
        Number.isFinite(metrics.urgentTasks)
          ? metrics.urgentTasks
          : tasks.filter(
              (task) => task.priorityScore >= 70 && task.status !== "completed",
            ).length,
    },
    selectedFundName:
      typeof root.selectedFundName === "string"
        ? root.selectedFundName
        : selectedFund?.displayName || selectedFund?.name || "All Funds",
  };
}

export async function getDashboardData(
  selectedFund: Fund | null,
  viewMode: FundViewMode,
  funds: Fund[] = [],
): Promise<DashboardData> {
  if (isMockMode("dashboards")) {
    return getMockDashboardData(selectedFund, viewMode, funds);
  }

  const payload = await requestJson<unknown>("/dashboard", {
    query: {
      fundId: selectedFund?.id,
      viewMode,
    },
    fallbackMessage: "Failed to load dashboard data",
  });

  return normalizeDashboardPayload(payload, selectedFund, funds);
}
