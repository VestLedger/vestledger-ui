"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Bell,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  HeartPulse,
  Info,
  Landmark,
  Mail,
  Menu,
  Moon,
  Radar,
  Search,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/brand-logo";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";
import { Input } from "@/ui";

type Tone = "violet" | "cyan" | "orange" | "green" | "blue";

type RailItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
};

type PriorityAction = {
  title: string;
  description: string;
  priority: string;
  duration: string;
  due: string;
  badge: string;
  action: string;
  icon: LucideIcon;
  tone: Tone;
};

type DeckItem = {
  title: string;
  status: string;
  icon: LucideIcon;
  tone: Tone;
};

type PipelineItem = {
  company: string;
  round: string;
  amount: string;
  tone: Tone;
};

const smartActions: RailItem[] = [
  {
    title: "IC Meeting",
    description: "Deck, memo, and talking points",
    icon: Users,
    tone: "violet",
  },
  {
    title: "Portfolio Performance",
    description: "KPIs and attribution summary",
    icon: BarChart3,
    tone: "cyan",
  },
  {
    title: "LP Updates",
    description: "Draft, review, and send updates",
    icon: Mail,
    tone: "violet",
  },
  {
    title: "Research Briefing",
    description: "Market and sector intelligence",
    icon: FileText,
    tone: "cyan",
  },
];

const vestaSuggestions: RailItem[] = [
  {
    title: "LP update draft ready for review",
    description: "22 results overview",
    icon: Sparkles,
    tone: "cyan",
  },
  {
    title: "3 investments approaching key milestones",
    description: "Review timeline and risks",
    icon: Users,
    tone: "violet",
  },
];

const priorityActions: PriorityAction[] = [
  {
    title: "Review 3 funding updates",
    description:
      "Apex Bio, Luma AI, and FleetOps submitted updates requiring your review.",
    priority: "High Priority",
    duration: "15 min",
    due: "Due today",
    badge: "3 updates",
    action: "Review now",
    icon: FileText,
    tone: "violet",
  },
  {
    title: "Approve 2 capital calls",
    description:
      "Summit Series B and Nexora Seed II are awaiting your approval.",
    priority: "High Priority",
    duration: "10 min",
    due: "Due tomorrow",
    badge: "$4.2M",
    action: "Review & approve",
    icon: Landmark,
    tone: "cyan",
  },
  {
    title: "Monitor 1 portfolio risk",
    description:
      "Vector Metrics flagged for potential revenue shortfall in Q3.",
    priority: "Medium Priority",
    duration: "20 min",
    due: "Due this week",
    badge: "At risk",
    action: "View details",
    icon: AlertTriangle,
    tone: "orange",
  },
];

const deckItems: DeckItem[] = [
  {
    title: "LP Update: Q2 newsletter draft",
    status: "Draft in progress",
    icon: FileText,
    tone: "blue",
  },
  {
    title: "Research: AI infrastructure market scan",
    status: "New data available",
    icon: Search,
    tone: "cyan",
  },
  {
    title: "Portfolio memo: Helios Robotics check-in",
    status: "Last updated 3 days ago",
    icon: Radar,
    tone: "violet",
  },
  {
    title: "Compliance: Quarterly document review",
    status: "Due in 5 days",
    icon: FileText,
    tone: "orange",
  },
];

const pipelineItems: PipelineItem[] = [
  {
    company: "Helios Robotics",
    round: "Series B",
    amount: "$45M",
    tone: "green",
  },
  {
    company: "Arcadia Health",
    round: "Series A",
    amount: "$28M",
    tone: "violet",
  },
  {
    company: "Nexora AI",
    round: "Seed II",
    amount: "$12M",
    tone: "blue",
  },
];

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
    text: "text-[#b759ff]",
    border: "border-[#8e31d5]",
    bg: "bg-[#8e31d5]",
    softBg: "bg-[#5d1f9f]/22",
  },
  cyan: {
    text: "text-[#00e5e8]",
    border: "border-[#00aeb5]",
    bg: "bg-[#00cbd0]",
    softBg: "bg-[#006f78]/22",
  },
  orange: {
    text: "text-[#ff7a00]",
    border: "border-[#e15700]",
    bg: "bg-[#ff6a00]",
    softBg: "bg-[#8d3200]/24",
  },
  green: {
    text: "text-[#2de8a4]",
    border: "border-[#14aa79]",
    bg: "bg-[#2de8a4]",
    softBg: "bg-[#087657]/22",
  },
  blue: {
    text: "text-[#45a9ff]",
    border: "border-[#247ec5]",
    bg: "bg-[#45a9ff]",
    softBg: "bg-[#175a94]/22",
  },
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const SIDEBAR_WIDTH_STORAGE_KEY = "vestledger-home-sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 515;
const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 620;
const SIDEBAR_KEYBOARD_STEP = 12;

const clampSidebarWidth = (width: number) =>
  Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));

function IconButton({
  label,
  children,
  className,
  onClick,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#d8d2ca] transition hover:bg-[#0b1d31] hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

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
      <Icon
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

function RailHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#8f3dff]" />
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1ede7]">
          {title}
        </h2>
        <p className="mt-1 text-xs text-[#8e9aab]">{description}</p>
      </div>
    </div>
  );
}

function RailAction({ item }: { item: RailItem }) {
  return (
    <button
      type="button"
      className="group flex min-h-[62px] w-full items-center gap-4 rounded-lg border border-[#0d2239] bg-[#08182a]/86 px-3 py-2.5 text-left transition hover:border-[#284b72] hover:bg-[#0a2037]"
    >
      <ToneIcon icon={item.icon} tone={item.tone} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[#f4f0ea]">
          {item.title}
        </span>
        <span className="mt-1 block truncate text-xs text-[#9ba6b6]">
          {item.description}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#e6e0d8] transition group-hover:translate-x-0.5" />
    </button>
  );
}

function LeftRail() {
  return (
    <aside className="h-full min-w-0 border-r border-[#102840] bg-[#031020] px-5 py-7 lg:px-7">
      <div className="flex items-center gap-4">
        <BrandLogo className="h-14 w-14 text-[#7336ff]" />
        <div className="text-2xl font-semibold tracking-[0.16em] text-[#f3f0eb]">
          VESTLEDGER
        </div>
      </div>

      <div className="mt-8 border-t border-[#0d263f] pt-6">
        <RailHeading
          icon={Sparkles}
          title="Smart Actions"
          description="High-level workflows to move your day forward."
        />
        <div className="mt-4 space-y-2">
          {smartActions.map((item) => (
            <RailAction key={item.title} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-[#0d263f] pt-5">
        <RailHeading
          icon={Zap}
          title="Vesta Suggests"
          description="Insights tailored to your context."
        />
        <div className="mt-4 space-y-2">
          {vestaSuggestions.map((item) => (
            <RailAction key={item.title} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-[#0d263f] pt-5">
        <RailHeading
          icon={Sparkles}
          title="Ask Vesta"
          description="Get instant clarity across your fund."
        />
        <div className="mt-4 flex items-center rounded-lg border border-[#16426b] bg-[#061427] p-2 pl-3">
          <Input
            aria-label="Ask Vesta"
            placeholder="Ask Vesta anything..."
            size="sm"
            className="min-w-0 flex-1"
            classNames={{
              base: "min-w-0 flex-1",
              inputWrapper:
                "min-h-9 border-0 bg-transparent px-0 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
              input: "text-sm text-white placeholder:text-[#8d98a9]",
            }}
          />
          <IconButton
            label="Send Vesta prompt"
            className="h-8 w-8 rounded-full bg-[#6737d7] text-white hover:bg-[#7a49e5]"
          >
            <ArrowUp className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            "How is Fund I performing?",
            "Summarize recent updates",
            "What needs my attention?",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="min-h-10 rounded-lg bg-[#07172a] px-2 text-[10px] leading-4 text-[#9ca7b7] transition hover:bg-[#0b2038] hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";

  return (
    <header
      className="flex min-h-[60px] items-center justify-between border-b border-[#0b2138] px-4"
      data-testid="gp-home-prototype-topbar"
    >
      <div className="flex items-center gap-3">
        <IconButton label="Open dashboard menu" className="bg-[#07182a]">
          <Menu className="h-6 w-6" />
        </IconButton>
        <h1 className="text-lg font-medium text-[#f2eee8]">Home</h1>
      </div>
      <div className="flex items-center gap-4">
        <IconButton
          label={`Switch to ${isDarkTheme ? "light" : "dark"} theme`}
          className="hover:text-[#fbbf24]"
          onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
        >
          {isDarkTheme ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </IconButton>
        <IconButton label="Notifications">
          <Bell className="h-5 w-5" />
        </IconButton>
        <IconButton label="Help">
          <CircleHelp className="h-5 w-5" />
        </IconButton>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#4d1fb8] text-sm font-medium text-white">
          AK
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#031020] bg-[#14d5a0]" />
        </div>
      </div>
    </header>
  );
}

function PriorityCard({ item }: { item: PriorityAction }) {
  const style = toneStyles[item.tone];

  return (
    <article
      className={cx(
        "grid min-h-[146px] gap-4 rounded-lg border border-[#0d2239] border-l-2 bg-[#061629]/92 p-4 md:grid-cols-[56px_minmax(0,1fr)_160px]",
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
        <h3 className="mt-2 font-serif text-xl text-[#f3eee7]">{item.title}</h3>
        <p className="mt-1 max-w-[430px] text-xs leading-5 text-[#aeb5bf]">
          {item.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#aeb5bf]">
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
          className={cx(
            "flex h-10 w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border px-3 text-sm text-[#f6f0e8] transition hover:brightness-125",
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

function QueueMain() {
  return (
    <main className="min-w-0 px-5 py-8 lg:pl-10 lg:pr-12 lg:pt-10">
      <h2 className="font-serif text-4xl leading-tight text-[#f3eee7]">
        Today&apos;s Action Queue
      </h2>
      <p className="mt-2 text-base text-[#c9c2ba]">
        3 priority items for your focus
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-full border border-[#19344e] bg-[#071629] px-4 text-xs text-[#d9d3cc]"
        >
          <Sparkles className="h-4 w-4 text-[#8f3dff]" />
          Priority 3
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 text-xs text-[#9ca6b4]">
          <span>Showing top 3 priorities</span>
          <Info className="h-4 w-4 text-[#c8c1b8]" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {priorityActions.map((item) => (
          <PriorityCard key={item.title} item={item} />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <p className="shrink-0 text-sm text-[#c8c1b8]">Also on deck (4)</p>
        <span className="h-px flex-1 bg-[#1b2e43]" />
      </div>

      <div className="mt-2 space-y-1.5">
        {deckItems.map((item) => {
          const style = toneStyles[item.tone];
          return (
            <button
              key={item.title}
              type="button"
              className="grid min-h-9 w-full grid-cols-[28px_minmax(0,1fr)_minmax(130px,0.54fr)_18px] items-center gap-3 rounded-lg border border-[#0d2239] bg-[#061629]/88 px-3 text-left transition hover:border-[#284b72]"
            >
              <ToneIcon icon={item.icon} tone={item.tone} size="sm" />
              <span className="truncate text-xs text-[#eee9e2]">
                {item.title}
              </span>
              <span
                className={cx("truncate text-xs text-[#9da8b6]", style.text)}
              >
                {item.status}
              </span>
              <ChevronRight className="h-4 w-4 text-[#d8d1c8]" />
            </button>
          );
        })}
      </div>
    </main>
  );
}

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
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2ede7]">
          {title}
        </h2>
      </div>
      <Info className="h-5 w-5 text-[#d3ccc3]" />
    </div>
  );
}

function VestaButton({ children, tone }: { children: ReactNode; tone: Tone }) {
  const style = toneStyles[tone];
  return (
    <button
      type="button"
      className={cx(
        "mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-lg border bg-[#061629]/70 text-sm transition hover:brightness-125",
        style.border,
        style.text,
      )}
    >
      <Sparkles className="h-5 w-5" />
      {children}
    </button>
  );
}

function FundHealthPanel() {
  return (
    <section className="rounded-lg border border-[#0d2239] bg-[#061629]/92 p-5">
      <InsightHeader title="Fund Health" icon={HeartPulse} tone="cyan" />
      <div className="mt-7 grid grid-cols-3 divide-x divide-[#14283e]">
        {[
          { value: "1.8x", label: "Net TVPI" },
          { value: "21%", label: "IRR" },
          { value: "58%", label: "DPI" },
        ].map((metric) => (
          <div key={metric.label} className="text-center">
            <p className="font-serif text-2xl text-[#eee9e2]">{metric.value}</p>
            <p className="mt-1 text-xs text-[#b2bac4]">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 flex gap-4">
        <TrendingUp className="h-6 w-6 shrink-0 text-[#2de8a4]" />
        <p className="text-sm leading-6 text-[#eee9e2]">
          Performance remains strong across vintage and strategy.
        </p>
      </div>
      <VestaButton tone="cyan">Ask Vesta: explain changes</VestaButton>
    </section>
  );
}

function PipelinePanel() {
  return (
    <section className="rounded-lg border border-[#0d2239] bg-[#061629]/92 p-5">
      <InsightHeader title="Pipeline Watch" icon={TrendingUp} tone="violet" />
      <div className="mt-6 space-y-4">
        {pipelineItems.map((item) => {
          const style = toneStyles[item.tone];
          return (
            <div
              key={item.company}
              className="grid grid-cols-[14px_minmax(0,1fr)_80px_58px] items-center gap-3 text-sm"
            >
              <span className={cx("h-3 w-3 rounded-full", style.bg)} />
              <span className="truncate text-[#eee9e2]">{item.company}</span>
              <span className="text-[#c6c2bd]">{item.round}</span>
              <span className="text-right text-[#eee9e2]">{item.amount}</span>
            </div>
          );
        })}
      </div>
      <VestaButton tone="violet">Ask Vesta: review pipeline</VestaButton>
    </section>
  );
}

function PortfolioIntelligencePanel() {
  return (
    <section className="rounded-lg border border-[#0d2239] bg-[#061629]/92 p-5">
      <InsightHeader title="Portfolio Intelligence" icon={Radar} tone="cyan" />
      <div className="mt-7 grid grid-cols-3 divide-x divide-[#14283e]">
        {[
          { value: "47", label: "Companies" },
          { value: "12", label: "Watchlist" },
          { value: "5", label: "Risks" },
        ].map((metric) => (
          <div key={metric.label} className="text-center">
            <p className="font-serif text-2xl text-[#eee9e2]">{metric.value}</p>
            <p className="mt-1 text-xs text-[#b2bac4]">{metric.label}</p>
          </div>
        ))}
      </div>
      <VestaButton tone="cyan">Ask Vesta: summarize signals</VestaButton>
    </section>
  );
}

function RightRail() {
  return (
    <aside className="min-w-0 space-y-5 px-5 pb-8 pt-8 xl:pl-0 xl:pr-7">
      <FundHealthPanel />
      <PipelinePanel />
      <PortfolioIntelligencePanel />
    </aside>
  );
}

export function HomeCommandCenterPrototype() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const dragStartRef = useRef<{ clientX: number; width: number } | null>(null);

  const updateSidebarWidth = useCallback((width: number) => {
    const nextWidth = clampSidebarWidth(width);
    setSidebarWidth(nextWidth);
    safeLocalStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(nextWidth));
  }, []);

  useEffect(() => {
    const storedWidth = Number(
      safeLocalStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY),
    );

    if (Number.isFinite(storedWidth) && storedWidth > 0) {
      setSidebarWidth(clampSidebarWidth(storedWidth));
    }
  }, []);

  useEffect(() => {
    if (!isResizingSidebar) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const dragStart = dragStartRef.current;

      if (!dragStart) {
        return;
      }

      updateSidebarWidth(dragStart.width + event.clientX - dragStart.clientX);
    };

    const stopResizing = () => {
      dragStartRef.current = null;
      setIsResizingSidebar(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isResizingSidebar, updateSidebarWidth]);

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button > 0) {
      return;
    }

    dragStartRef.current = {
      clientX: event.clientX,
      width: sidebarWidth,
    };
    setIsResizingSidebar(true);
    event.preventDefault();
  };

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextWidth: number | null = null;

    if (event.key === "ArrowLeft") {
      nextWidth = sidebarWidth - SIDEBAR_KEYBOARD_STEP;
    } else if (event.key === "ArrowRight") {
      nextWidth = sidebarWidth + SIDEBAR_KEYBOARD_STEP;
    } else if (event.key === "Home") {
      nextWidth = MIN_SIDEBAR_WIDTH;
    } else if (event.key === "End") {
      nextWidth = MAX_SIDEBAR_WIDTH;
    }

    if (nextWidth === null) {
      return;
    }

    event.preventDefault();
    updateSidebarWidth(nextWidth);
  };

  return (
    <div
      className={cx(
        "min-h-screen bg-[#020b17] text-white",
        isResizingSidebar && "select-none xl:cursor-col-resize",
      )}
    >
      <div
        className="grid min-h-screen min-w-0 xl:grid-cols-[var(--home-sidebar-width)_minmax(0,1fr)]"
        data-testid="gp-home-command-center"
        style={
          {
            "--home-sidebar-width": `${sidebarWidth}px`,
          } as CSSProperties
        }
      >
        <div className="relative min-w-0">
          <LeftRail />
          <button
            type="button"
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuemin={MIN_SIDEBAR_WIDTH}
            aria-valuemax={MAX_SIDEBAR_WIDTH}
            aria-valuenow={sidebarWidth}
            aria-valuetext={`${sidebarWidth} pixels`}
            title="Drag to resize sidebar"
            onKeyDown={handleResizeKeyDown}
            onPointerDown={handleResizePointerDown}
            className="group absolute -right-1.5 top-0 z-30 hidden h-full w-3 cursor-col-resize touch-none bg-transparent p-0 outline-none xl:block"
          >
            <span
              className={cx(
                "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#17405f] transition-[width,background-color,box-shadow]",
                "group-hover:w-0.5 group-hover:bg-[#00cbd0] group-hover:shadow-[0_0_12px_rgba(0,203,208,0.7)]",
                "group-focus-visible:w-0.5 group-focus-visible:bg-[#00cbd0] group-focus-visible:shadow-[0_0_12px_rgba(0,203,208,0.7)]",
                isResizingSidebar &&
                  "w-0.5 bg-[#00cbd0] shadow-[0_0_12px_rgba(0,203,208,0.7)]",
              )}
            />
          </button>
        </div>

        <div className="min-w-0" data-testid="gp-home-prototype-content-shell">
          <Topbar />
          <div
            className="grid min-w-0 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.95fr)]"
            data-testid="gp-home-prototype-body"
          >
            <QueueMain />
            <RightRail />
          </div>
        </div>
      </div>
    </div>
  );
}
