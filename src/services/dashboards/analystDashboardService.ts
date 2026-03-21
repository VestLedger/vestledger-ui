import { isMockMode } from "@/config/data-mode";
import {
  analystDashboardMetrics,
  analystRecentDeals,
  analystUrgentTasks,
} from "@/data/mocks/dashboards/analyst-dashboard";
import { apiClient } from "@/api/client";
import { unwrapApiResult } from "@/api/unwrap";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function formatDueLabel(value: unknown): string {
  const parsed =
    typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    const startOfDue = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
    ).getTime();
    const dayDiff = Math.round(
      (startOfDue - startOfToday) / (24 * 60 * 60 * 1000),
    );
    if (dayDiff <= 0) return "Today";
    if (dayDiff === 1) return "Tomorrow";
    return `In ${dayDiff} days`;
  }
  return readString(value, "Soon");
}

function normalizePriority(value: unknown): "High" | "Medium" | "Low" {
  if (typeof value === "number") {
    if (value >= 8) return "High";
    if (value >= 5) return "Medium";
    return "Low";
  }

  const normalized = readString(value).toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  return "Low";
}

export async function getAnalystDashboardSnapshot() {
  if (isMockMode("dashboards")) {
    return {
      metrics: analystDashboardMetrics,
      recentDeals: analystRecentDeals,
      urgentTasks: analystUrgentTasks,
    };
  }

  // API mode
  const result = await unwrapApiResult(apiClient.GET("/dashboard/analyst"), {
    fallbackMessage: "Failed to fetch analyst dashboard",
  });

  const apiData: Record<string, unknown> = isRecord(result) ? result : {};
  const metricsSource = isRecord(apiData.metrics) ? apiData.metrics : {};
  const portfolioOverview = isRecord(apiData.portfolioOverview)
    ? apiData.portfolioOverview
    : {};
  const pendingDueDiligence = Array.isArray(apiData.pendingDueDiligence)
    ? apiData.pendingDueDiligence.filter(isRecord)
    : [];
  const recentUpdates = Array.isArray(apiData.recentUpdates)
    ? apiData.recentUpdates.filter(isRecord)
    : [];
  const recentDealsApi = Array.isArray(apiData.recentDeals)
    ? apiData.recentDeals.filter(isRecord)
    : [];
  const urgentTasksApi = Array.isArray(apiData.urgentTasks)
    ? apiData.urgentTasks.filter(isRecord)
    : [];

  const activeDeals = readNumber(
    metricsSource.activeDealsPipeline,
    readNumber(portfolioOverview.totalCompanies),
  );
  const dealsUnderDD = readNumber(
    metricsSource.dealsUnderDD,
    pendingDueDiligence.length,
  );
  const pendingMemos = readNumber(
    metricsSource.pendingMemos,
    urgentTasksApi.length || pendingDueDiligence.length,
  );
  const averageHealthScore = readNumber(
    metricsSource.averageHealthScore,
    readNumber(portfolioOverview.averageHealth),
  );

  const metrics = analystDashboardMetrics.map((metric) => ({ ...metric }));
  if (metrics[0]) metrics[0].value = String(activeDeals);
  if (metrics[1]) metrics[1].value = String(dealsUnderDD);
  if (metrics[2])
    metrics[2].value = String(
      Math.max(recentUpdates.length, recentDealsApi.length),
    );
  if (metrics[3]) metrics[3].value = String(pendingMemos);
  if (metrics[2]) metrics[2].change = `${Math.round(averageHealthScore)}/100`;
  if (metrics[3]) metrics[3].change = pendingMemos > 0 ? "Action Req" : "Clear";

  const normalizedRecentDeals = (
    recentDealsApi.length > 0 ? recentDealsApi : recentUpdates
  )
    .map((deal) => ({
      name: readString(deal.name, readString(deal.companyName, "Deal")),
      stage: readString(deal.stage, "Under Review"),
      score: Math.max(
        1,
        Math.min(
          100,
          Math.round(readNumber(deal.score, readNumber(deal.health, 82))),
        ),
      ),
      sector: readString(deal.sector, "General"),
    }))
    .filter((deal) => deal.name.trim().length > 0);

  const normalizedUrgentTasks = (
    urgentTasksApi.length > 0 ? urgentTasksApi : pendingDueDiligence
  )
    .map((task) => ({
      task: readString(
        task.task,
        readString(
          task.title,
          `Review ${readString(task.companyName, "item")}`,
        ),
      ).trim(),
      due: formatDueLabel(task.due ?? task.dueDate ?? task.deadline),
      priority: normalizePriority(task.priority ?? task.urgency),
    }))
    .filter((task) => task.task.length > 0);

  return {
    metrics,
    recentDeals:
      normalizedRecentDeals.length > 0
        ? normalizedRecentDeals
        : analystRecentDeals,
    urgentTasks:
      normalizedUrgentTasks.length > 0
        ? normalizedUrgentTasks
        : analystUrgentTasks,
  };
}
