"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  ChevronRight,
  Clock3,
  HeartPulse,
  Info,
  Layers,
  Radar,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFund } from "@/contexts/fund-context";
import { ROUTE_PATHS } from "@/config/routes";
import {
  cx,
  RedesignedFrameShell,
  useRedesignedFrameVesta,
} from "@/components/app-frame";
import {
  fundHealth,
  pipeline,
  portfolioIntel,
  queueScenarios,
  resolveQueueSize,
  vestaPrompts as mockVestaPrompts,
  type HomeTone,
  type MockDeckItem,
  type MockMetric,
  type MockPipelineItem,
  type MockPriorityAction,
} from "@/components/dashboard/home-command-center.mock";

type Tone = HomeTone;

const toneStyles: Record<
  Tone,
  {
    text: string;
    border: string;
    bg: string;
    softBg: string;
  }
> = {
  violet: {
    text: "text-app-vesta dark:text-app-dark-vesta",
    border: "border-app-vesta dark:border-app-dark-vesta",
    bg: "bg-app-vesta dark:bg-app-dark-vesta",
    softBg: "bg-app-vesta-light dark:bg-app-dark-vesta-light",
  },
  cyan: {
    text: "text-app-info dark:text-app-dark-info",
    border: "border-app-info dark:border-app-dark-info",
    bg: "bg-app-info dark:bg-app-dark-info",
    softBg: "bg-app-info-light dark:bg-app-dark-info-light",
  },
  orange: {
    text: "text-app-warning dark:text-app-dark-warning",
    border: "border-app-warning dark:border-app-dark-warning",
    bg: "bg-app-warning dark:bg-app-dark-warning",
    softBg: "bg-app-warning-light dark:bg-app-dark-warning-light",
  },
  green: {
    text: "text-app-success dark:text-app-dark-success",
    border: "border-app-success dark:border-app-dark-success",
    bg: "bg-app-success dark:bg-app-dark-success",
    softBg: "bg-app-success-light dark:bg-app-dark-success-light",
  },
  blue: {
    text: "text-app-primary dark:text-app-dark-primary",
    border: "border-app-primary dark:border-app-dark-primary",
    bg: "bg-app-primary dark:bg-app-dark-primary",
    softBg: "bg-app-primary-light dark:bg-app-dark-primary-light",
  },
};

const MAX_VISIBLE_PRIORITIES = 3;
const CAUGHT_UP_THRESHOLD = 1;

function ToneIcon({
  icon: Icon,
  tone,
  size = "md",
}: {
  icon: LucideIcon;
  tone: Tone;
  size?: "sm" | "md" | "lg";
}) {
  const style = toneStyles[tone];
  const ResolvedIcon = Icon || Sparkles;
  return (
    <span
      className={cx(
        "flex shrink-0 items-center justify-center rounded-lg border",
        style.border,
        style.softBg,
        size === "sm" && "h-7 w-7",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-12 w-12",
      )}
    >
      <ResolvedIcon
        className={cx(
          style.text,
          size === "sm" && "h-4 w-4",
          size === "md" && "h-6 w-6",
          size === "lg" && "h-7 w-7",
        )}
      />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Center queue
// ─────────────────────────────────────────────────────────────────────────────

type PriorityCardModel = MockPriorityAction & { onClick: () => void };
type DeckItemModel = MockDeckItem & { onClick: () => void };

function PriorityCard({ item }: { item: PriorityCardModel }) {
  const style = toneStyles[item.tone];

  return (
    <article
      className={cx(
        "grid min-h-[146px] gap-4 rounded-lg border border-app-border border-l-2 bg-app-surface p-4 dark:border-app-dark-border dark:bg-app-dark-surface 2xl:grid-cols-[56px_minmax(0,1fr)_160px]",
        style.border,
      )}
    >
      <ToneIcon icon={item.icon} tone={item.tone} size="lg" />

      <div className="min-w-0">
        <span
          className={cx(
            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
            style.softBg,
            style.text,
          )}
        >
          {item.priority}
        </span>
        <h3 className="mt-2 font-serif text-xl text-app-text dark:text-app-dark-text">
          {item.title}
        </h3>
        <p className="mt-1 max-w-[430px] text-xs leading-5 text-app-text-muted dark:text-app-dark-text-muted">
          {item.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-app-text-muted dark:text-app-dark-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            {item.duration}
          </span>
          <span>•</span>
          <span>{item.due}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-end justify-between gap-4">
        <span
          className={cx(
            "rounded-full border px-4 py-2 text-xs",
            style.border,
            style.text,
          )}
        >
          {item.badge}
        </span>
        <button
          type="button"
          onClick={item.onClick}
          className={cx(
            "flex h-10 w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border px-3 text-sm text-app-text transition hover:brightness-110 dark:text-app-dark-text",
            style.border,
            style.softBg,
          )}
        >
          {item.action}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function CaughtUpHero({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-app-vesta to-app-info opacity-40 blur-xl dark:from-app-dark-vesta dark:to-app-dark-info" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-app-info bg-app-surface dark:border-app-dark-info dark:bg-app-dark-surface">
          <Check className="h-7 w-7 text-app-info dark:text-app-dark-info" />
        </span>
      </div>
      <h3 className="mt-5 font-serif text-2xl text-app-text dark:text-app-dark-text">
        You&apos;re caught up.
      </h3>
      <p className="mt-2 text-sm text-app-text-muted dark:text-app-dark-text-muted">
        Only {count} priority item{count === 1 ? "" : "s"} need
        {count === 1 ? "s" : ""} attention today.
      </p>
    </div>
  );
}

function RemainingExpander({
  remaining,
  onClick,
}: {
  remaining: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-app-border bg-app-surface p-4 text-left transition hover:border-app-border-strong dark:border-app-dark-border dark:bg-app-dark-surface dark:hover:border-app-dark-border-strong"
    >
      <ToneIcon icon={Layers} tone="violet" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-app-text dark:text-app-dark-text">
          {remaining} more priority item{remaining === 1 ? "" : "s"}
        </span>
        <span className="mt-0.5 block text-xs text-app-text-muted dark:text-app-dark-text-muted">
          View remaining {remaining} priorit{remaining === 1 ? "y" : "ies"}
        </span>
      </span>
      <span className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-app-border-strong bg-app-surface-2 px-3 py-2 text-xs text-app-text dark:border-app-dark-border-strong dark:bg-app-dark-surface-2 dark:text-app-dark-text">
        View remaining {remaining}
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function DeckRow({ item }: { item: DeckItemModel }) {
  const statusClass =
    item.statusTone && item.statusTone !== "muted"
      ? toneStyles[item.statusTone].text
      : "text-app-text-muted dark:text-app-dark-text-muted";

  return (
    <button
      type="button"
      onClick={item.onClick}
      className="grid min-h-9 w-full grid-cols-[28px_minmax(0,1fr)_minmax(130px,0.54fr)_18px] items-center gap-3 rounded-lg border border-app-border bg-app-surface px-3 py-2 text-left transition hover:border-app-border-strong dark:border-app-dark-border dark:bg-app-dark-surface dark:hover:border-app-dark-border-strong"
    >
      <ToneIcon icon={item.icon} tone={item.tone} size="sm" />
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-xs text-app-text dark:text-app-dark-text">
          {item.title}
        </span>
        {item.badge ? (
          <span
            className={cx(
              "hidden shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] sm:inline-flex",
              toneStyles[item.badgeTone ?? item.tone].softBg,
              toneStyles[item.badgeTone ?? item.tone].text,
            )}
          >
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className={cx("truncate text-right text-xs", statusClass)}>
        {item.status ?? ""}
      </span>
      <ChevronRight className="h-4 w-4 text-app-text-muted dark:text-app-dark-text-muted" />
    </button>
  );
}

function PoweredByFooter() {
  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-app-text-muted dark:text-app-dark-text-muted">
      <Sparkles className="h-4 w-4 text-app-vesta dark:text-app-dark-vesta" />
      Powered by Vesta AI
    </div>
  );
}

function QueueMain({
  priorityActions,
  deckItems,
  totalCount,
  onViewRemaining,
}: {
  priorityActions: PriorityCardModel[];
  deckItems: DeckItemModel[];
  totalCount: number;
  onViewRemaining: () => void;
}) {
  const visible = priorityActions.slice(0, MAX_VISIBLE_PRIORITIES);
  const remaining = Math.max(0, totalCount - MAX_VISIBLE_PRIORITIES);
  const showChip = totalCount >= 2;
  const showCaughtUp = totalCount <= CAUGHT_UP_THRESHOLD;
  const showExpander = remaining > 0;

  const subtitle =
    totalCount > MAX_VISIBLE_PRIORITIES
      ? `${totalCount} priority items. Showing the top ${MAX_VISIBLE_PRIORITIES} for focus.`
      : `${totalCount} priority item${totalCount === 1 ? "" : "s"} for your focus`;

  const showingLabel =
    totalCount > MAX_VISIBLE_PRIORITIES
      ? `Showing top ${MAX_VISIBLE_PRIORITIES} of ${totalCount} priorities`
      : `Showing top ${MAX_VISIBLE_PRIORITIES} priorities`;

  return (
    <section className="min-w-0 px-5 py-8 lg:pl-10 lg:pr-12 lg:pt-10">
      <h2 className="font-serif text-4xl leading-tight text-app-text dark:text-app-dark-text">
        Today&apos;s Action Queue
      </h2>
      <p className="mt-2 text-base text-app-text-muted dark:text-app-dark-text-muted">
        {subtitle}
      </p>

      {showChip ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 items-center gap-2 rounded-full border border-app-border-strong bg-app-surface-2 px-4 text-xs text-app-text-muted dark:border-app-dark-border-strong dark:bg-app-dark-surface-2 dark:text-app-dark-text-muted">
              <Sparkles className="h-4 w-4 text-app-vesta dark:text-app-dark-vesta" />
              Priority
              {totalCount > MAX_VISIBLE_PRIORITIES ? "" : ` ${totalCount}`}
              <ChevronRight className="h-4 w-4" />
            </span>
            {totalCount > MAX_VISIBLE_PRIORITIES ? (
              <span className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                {totalCount} items
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-xs text-app-text-muted dark:text-app-dark-text-muted">
            <span>{showingLabel}</span>
            <Info className="h-4 w-4" />
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {visible.map((item) => (
          <PriorityCard key={item.id} item={item} />
        ))}
        {showExpander ? (
          <RemainingExpander remaining={remaining} onClick={onViewRemaining} />
        ) : null}
      </div>

      {showCaughtUp ? <CaughtUpHero count={totalCount} /> : null}

      <div className="mt-6 flex items-center gap-3">
        <p className="shrink-0 text-sm text-app-text-muted dark:text-app-dark-text-muted">
          Also on deck ({deckItems.length})
        </p>
        <span className="h-px flex-1 bg-app-border dark:bg-app-dark-border" />
      </div>

      <div className="mt-3 space-y-1.5">
        {deckItems.map((item) => (
          <DeckRow key={item.id} item={item} />
        ))}
      </div>

      <PoweredByFooter />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right rail
// ─────────────────────────────────────────────────────────────────────────────

function InsightHeader({
  title,
  icon: Icon,
  tone,
}: {
  title: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  const style = toneStyles[tone];
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Icon className={cx("h-6 w-6", style.text)} />
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-app-text dark:text-app-dark-text">
          {title}
        </h2>
      </div>
      <Info className="h-5 w-5 text-app-text-muted dark:text-app-dark-text-muted" />
    </div>
  );
}

function VestaButton({
  children,
  tone,
  onClick,
}: {
  children: ReactNode;
  tone: Tone;
  onClick: () => void;
}) {
  const style = toneStyles[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-lg border bg-app-surface-2 text-sm transition hover:brightness-110 dark:bg-app-dark-surface-2",
        style.border,
        style.text,
      )}
    >
      <Sparkles className="h-5 w-5" />
      {children}
    </button>
  );
}

function MetricRow({ metrics }: { metrics: MockMetric[] }) {
  return (
    <div className="mt-7 grid grid-cols-3 divide-x divide-app-border dark:divide-app-dark-border">
      {metrics.map((metric) => (
        <div key={metric.label} className="text-center">
          <p className="font-serif text-2xl text-app-text dark:text-app-dark-text">
            {metric.value}
          </p>
          <p className="mt-1 text-xs text-app-text-muted dark:text-app-dark-text-muted">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function FundHealthPanel({
  onAskVesta,
}: {
  onAskVesta: (query: string) => void;
}) {
  return (
    <section className="rounded-lg border border-app-border bg-app-surface p-5 dark:border-app-dark-border dark:bg-app-dark-surface">
      <InsightHeader title="Fund Health" icon={HeartPulse} tone="cyan" />
      <MetricRow metrics={fundHealth.metrics} />
      <div className="mt-7 flex gap-4">
        <TrendingUp className="h-6 w-6 shrink-0 text-app-success dark:text-app-dark-success" />
        <p className="text-sm leading-6 text-app-text dark:text-app-dark-text">
          {fundHealth.note}
        </p>
      </div>
      <VestaButton
        tone="cyan"
        onClick={() => onAskVesta("Explain the latest fund health changes")}
      >
        Ask Vesta: explain changes
      </VestaButton>
    </section>
  );
}

function PipelinePanel({
  pipelineItems,
  onAskVesta,
}: {
  pipelineItems: Array<MockPipelineItem & { onClick: () => void }>;
  onAskVesta: (query: string) => void;
}) {
  return (
    <section className="rounded-lg border border-app-border bg-app-surface p-5 dark:border-app-dark-border dark:bg-app-dark-surface">
      <InsightHeader title="Pipeline Watch" icon={TrendingUp} tone="violet" />
      <div className="mt-6 space-y-4">
        {pipelineItems.map((item) => {
          const style = toneStyles[item.tone];
          return (
            <button
              key={item.company}
              type="button"
              onClick={item.onClick}
              className="grid w-full grid-cols-[14px_minmax(0,1fr)_80px_58px] items-center gap-3 text-sm"
            >
              <span className={cx("h-3 w-3 rounded-full", style.bg)} />
              <span className="truncate text-left text-app-text dark:text-app-dark-text">
                {item.company}
              </span>
              <span className="text-left text-app-text-muted dark:text-app-dark-text-muted">
                {item.round}
              </span>
              <span className="text-right text-app-text dark:text-app-dark-text">
                {item.amount}
              </span>
            </button>
          );
        })}
      </div>
      <VestaButton
        tone="violet"
        onClick={() => onAskVesta("Review the current pipeline")}
      >
        Ask Vesta: review pipeline
      </VestaButton>
    </section>
  );
}

function PortfolioIntelligencePanel({
  onAskVesta,
}: {
  onAskVesta: (query: string) => void;
}) {
  return (
    <section className="rounded-lg border border-app-border bg-app-surface p-5 dark:border-app-dark-border dark:bg-app-dark-surface">
      <InsightHeader title="Portfolio Intelligence" icon={Radar} tone="cyan" />
      <MetricRow metrics={portfolioIntel} />
      <VestaButton
        tone="cyan"
        onClick={() => onAskVesta("Summarize the latest portfolio signals")}
      >
        Ask Vesta: summarize signals
      </VestaButton>
    </section>
  );
}

function RightRail({
  pipelineItems,
  onAskVesta,
}: {
  pipelineItems: Array<MockPipelineItem & { onClick: () => void }>;
  onAskVesta: (query: string) => void;
}) {
  return (
    <aside className="min-w-0 space-y-5 px-5 pb-8 pt-8 xl:pl-0 xl:pr-7">
      <FundHealthPanel onAskVesta={onAskVesta} />
      <PipelinePanel pipelineItems={pipelineItems} onAskVesta={onAskVesta} />
      <PortfolioIntelligencePanel onAskVesta={onAskVesta} />
    </aside>
  );
}

function HomeRightRail({
  pipelineItems,
}: {
  pipelineItems: Array<MockPipelineItem & { onClick: () => void }>;
}) {
  const { submitVestaQuery } = useRedesignedFrameVesta();
  return (
    <RightRail pipelineItems={pipelineItems} onAskVesta={submitVestaQuery} />
  );
}

export function HomeCommandCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedFund } = useFund();

  const queueSize = resolveQueueSize(searchParams?.get("queue"));
  const scenario = queueScenarios[queueSize];

  const navigate = useCallback(
    (route?: string) => {
      router.push(route || ROUTE_PATHS.dashboard);
    },
    [router],
  );

  const priorityActions = useMemo(
    () =>
      scenario.priorityActions.map((item) => ({
        ...item,
        onClick: () => navigate(item.route),
      })),
    [navigate, scenario],
  );

  const deckItems = useMemo(
    () =>
      scenario.deckItems.map((item) => ({
        ...item,
        onClick: () => navigate(item.route),
      })),
    [navigate, scenario],
  );

  const pipelineItems = useMemo(
    () =>
      pipeline.map((item) => ({
        ...item,
        onClick: () => navigate(item.route),
      })),
    [navigate],
  );

  const scopeName = selectedFund?.displayName || "Fund I";
  const vestaPrompts = useMemo(
    () => mockVestaPrompts.map((prompt) => prompt.replace("Fund I", scopeName)),
    [scopeName],
  );

  return (
    <RedesignedFrameShell
      title="Home"
      prompts={vestaPrompts}
      rightRail={<HomeRightRail pipelineItems={pipelineItems} />}
    >
      <QueueMain
        priorityActions={priorityActions}
        deckItems={deckItems}
        totalCount={scenario.priorityActions.length}
        onViewRemaining={() => navigate(ROUTE_PATHS.dashboard)}
      />
    </RedesignedFrameShell>
  );
}
