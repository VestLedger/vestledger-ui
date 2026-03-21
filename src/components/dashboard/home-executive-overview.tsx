"use client";

import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, Line, ResponsiveContainer } from "recharts";
import { Badge, Card } from "@/ui";
import { KpiChip, SectionHeader } from "@/ui/composites";
import type {
  DailyBriefItem,
  FundTrustRow,
  HomeBlocker,
  HomeOpportunity,
  MorningBrief,
  PortfolioRevenueRow,
  PortfolioRevenueTrendPoint,
} from "@/data/mocks/hooks/dashboard-data";
import { formatTime } from "@/utils/formatting";
import {
  countByRiskFlag,
  getArrMomentum,
  getAverageTrustScore,
  getImportantSignalsCount,
  getPortfolioRunwaySummary,
  getTopBlocker,
  getTopOpportunity,
  getUrgentSignalsCount,
} from "./home-dashboard-helpers";

interface HomeExecutiveOverviewProps {
  brief: MorningBrief;
  dailyBriefItems: DailyBriefItem[];
  fundTrustRows: FundTrustRow[];
  portfolioRevenueRows: PortfolioRevenueRow[];
  blockers: HomeBlocker[];
  opportunities: HomeOpportunity[];
  portfolioRevenueTrend: PortfolioRevenueTrendPoint[];
}

interface OverviewStatusSegment {
  label: string;
  count: number;
  tone: "success" | "warning" | "danger";
}

function getToneClass(tone: OverviewStatusSegment["tone"]) {
  if (tone === "danger") return "bg-[var(--app-danger)]";
  if (tone === "warning") return "bg-[var(--app-warning)]";
  return "bg-[var(--app-success)]";
}

function ExecutiveStatusBar({
  segments,
}: {
  segments: OverviewStatusSegment[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--app-surface-2)]">
        {total === 0 ? (
          <div className="h-full w-full bg-[var(--app-border)]" />
        ) : (
          <div className="flex h-full w-full">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className={getToneClass(segment.tone)}
                style={{ width: `${(segment.count / total) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-block h-2.5 w-2.5 rounded-full",
                  getToneClass(segment.tone),
                ].join(" ")}
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-subtle)]">
                {segment.label}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold text-[var(--app-text)]">
              {segment.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  eyebrow,
  icon,
  badge,
  testId,
  className,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: ReactNode;
  badge?: string;
  testId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      padding="md"
      className={["rounded-2xl shadow-none", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
    >
      <SectionHeader
        className="mb-4"
        title={
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-subtle)]">
              {eyebrow}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-hover)] text-[var(--app-primary)]">
                {icon}
              </span>
              <span className="text-sm font-semibold text-[var(--app-text)]">
                {title}
              </span>
            </div>
          </div>
        }
        action={
          badge ? (
            <Badge
              size="sm"
              variant="flat"
              className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]"
            >
              {badge}
            </Badge>
          ) : undefined
        }
        titleClassName="text-sm"
      />
      {children}
    </Card>
  );
}

export function HomeExecutiveOverview({
  brief,
  dailyBriefItems,
  fundTrustRows,
  portfolioRevenueRows,
  blockers,
  opportunities,
  portfolioRevenueTrend,
}: HomeExecutiveOverviewProps) {
  const arrMomentum = getArrMomentum(portfolioRevenueTrend);
  const trustBreakdown = countByRiskFlag(fundTrustRows);
  const portfolioBreakdown = countByRiskFlag(portfolioRevenueRows);
  const runwaySummary = getPortfolioRunwaySummary(portfolioRevenueRows);
  const urgentSignals = getUrgentSignalsCount(dailyBriefItems);
  const importantSignals = getImportantSignalsCount(dailyBriefItems);
  const averageTrust = getAverageTrustScore(fundTrustRows);
  const topBlocker = getTopBlocker(blockers);
  const topOpportunity = getTopOpportunity(opportunities);
  const asOfLabel = formatTime(brief.asOf, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      data-testid="gp-home-executive-overview"
      className="grid grid-cols-1 gap-3 xl:grid-cols-12"
    >
      <OverviewCard
        title="AI Brief"
        eyebrow="Executive Overview"
        icon={<Bot className="h-4 w-4" />}
        badge={`As of ${asOfLabel}`}
        testId="gp-home-ai-brief"
        className="xl:col-span-5"
      >
        <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">
          {brief.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge
            size="sm"
            variant="flat"
            className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
          >
            {brief.itemCount} signals in {brief.horizonDays}d
          </Badge>
          <Badge
            size="sm"
            variant="bordered"
            className="border-[var(--app-border)] text-[var(--app-text-muted)]"
          >
            {importantSignals} important
          </Badge>
        </div>
      </OverviewCard>

      <OverviewCard
        title="ARR Momentum"
        eyebrow="Performance"
        icon={<TrendingUp className="h-4 w-4" />}
        badge={`${arrMomentum.deltaPct >= 0 ? "+" : ""}${arrMomentum.deltaPct.toFixed(1)}%`}
        testId="gp-home-arr-momentum"
        className="xl:col-span-3"
      >
        <div className="mb-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
            Current ARR
          </p>
          <p className="mt-1 text-3xl font-semibold text-[var(--app-text)]">
            ${arrMomentum.current.toFixed(0)}M
          </p>
          <p className="text-xs text-[var(--app-text-muted)]">
            from ${arrMomentum.start.toFixed(0)}M at the start of the trend
          </p>
        </div>

        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioRevenueTrend}>
              <defs>
                <linearGradient
                  id="gpExecutiveOverviewArrGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--app-success)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--app-success)"
                    stopOpacity={0.04}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="arr"
                fill="url(#gpExecutiveOverviewArrGradient)"
                stroke="transparent"
              />
              <Line
                type="monotone"
                dataKey="arr"
                stroke="var(--app-success)"
                strokeWidth={2.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </OverviewCard>

      <OverviewCard
        title="Fund Trust"
        eyebrow="Fund Health"
        icon={<ShieldCheck className="h-4 w-4" />}
        badge={`${fundTrustRows.length} funds`}
        testId="gp-home-fund-trust-overview"
        className="xl:col-span-4"
      >
        <ExecutiveStatusBar
          segments={[
            { label: "Stable", count: trustBreakdown.stable, tone: "success" },
            { label: "Watch", count: trustBreakdown.watch, tone: "warning" },
            {
              label: "Critical",
              count: trustBreakdown.critical,
              tone: "danger",
            },
          ]}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <KpiChip
            label="Avg trust"
            value={averageTrust}
            tone={
              trustBreakdown.critical > 0
                ? "warning"
                : trustBreakdown.watch > 0
                  ? "info"
                  : "success"
            }
          />
          <KpiChip
            label="Watch funds"
            value={trustBreakdown.watch + trustBreakdown.critical}
            tone={
              trustBreakdown.watch + trustBreakdown.critical > 0
                ? "warning"
                : "success"
            }
          />
        </div>
      </OverviewCard>

      <OverviewCard
        title="Portfolio Health"
        eyebrow="Portfolio"
        icon={<Activity className="h-4 w-4" />}
        badge={`${portfolioRevenueRows.length} companies`}
        testId="gp-home-portfolio-health-overview"
        className="xl:col-span-7"
      >
        <ExecutiveStatusBar
          segments={[
            {
              label: "Stable",
              count: portfolioBreakdown.stable,
              tone: "success",
            },
            {
              label: "Watch",
              count: portfolioBreakdown.watch,
              tone: "warning",
            },
            {
              label: "Critical",
              count: portfolioBreakdown.critical,
              tone: "danger",
            },
          ]}
        />
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <KpiChip
            label="< 9m runway"
            value={runwaySummary.underNineMonths}
            tone={runwaySummary.underNineMonths > 0 ? "danger" : "success"}
          />
          <KpiChip
            label="< 12m runway"
            value={runwaySummary.underTwelveMonths}
            tone={runwaySummary.underTwelveMonths > 0 ? "warning" : "success"}
          />
          <KpiChip
            label="Anomalies"
            value={runwaySummary.withAnomalies}
            tone={runwaySummary.withAnomalies > 0 ? "info" : "neutral"}
          />
        </div>
      </OverviewCard>

      <OverviewCard
        title="Attention Summary"
        eyebrow="Decisions"
        icon={<AlertTriangle className="h-4 w-4" />}
        badge={`${urgentSignals} urgent`}
        testId="gp-home-attention-summary"
        className="xl:col-span-5"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <KpiChip
            label="Urgent"
            value={urgentSignals}
            tone={urgentSignals > 0 ? "warning" : "neutral"}
          />
          <KpiChip
            label="Blockers"
            value={blockers.length}
            tone={blockers.length > 0 ? "danger" : "neutral"}
          />
          <KpiChip
            label="Opportunities"
            value={opportunities.length}
            tone={opportunities.length > 0 ? "info" : "neutral"}
          />
        </div>

        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-hover)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
              Top blocker
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">
              {topBlocker?.title ?? "No blockers need attention"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-hover)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
              Top opportunity
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">
              {topOpportunity?.title ?? "No active opportunities right now"}
            </p>
          </div>
        </div>
      </OverviewCard>
    </section>
  );
}
