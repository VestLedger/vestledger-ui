"use client";

import { Badge } from "@/ui";
import { ExpandableSection, SectionHeader } from "@/ui/composites";
import {
  getCollapsedDashboardBlocks,
  getConditionalDashboardBlocks,
  getDefaultVisibleDashboardBlocks,
  getProminenceLabel,
  type SegmentConfig,
  type SegmentDashboardBlockConfig,
} from "@/config/segment-config";
import type { SegmentKey } from "@/types/segments";

type SegmentDashboardCompositionProps = {
  segmentKey: SegmentKey;
  config: SegmentConfig;
  isDefaulted?: boolean;
};

function BlockRow({
  block,
  index,
}: {
  block: SegmentDashboardBlockConfig;
  index: number;
}) {
  return (
    <li className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-bg)] text-xs font-semibold text-[var(--app-primary)]">
              {index + 1}
            </span>
            <p className="truncate text-sm font-semibold text-[var(--app-text)]">
              {block.label}
            </p>
          </div>
          <p className="mt-1 text-xs text-[var(--app-text-muted)]">
            {block.sourceModules}
          </p>
        </div>
        <Badge
          size="sm"
          variant="flat"
          className="shrink-0 bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]"
        >
          {getProminenceLabel(block.prominence)}
        </Badge>
      </div>

      {block.vestaSuggestion ? (
        <p className="mt-3 line-clamp-2 text-xs text-[var(--app-text-muted)]">
          Vesta: {block.vestaSuggestion}
        </p>
      ) : null}
    </li>
  );
}

function CompactBlockList({
  title,
  blocks,
}: {
  title: string;
  blocks: SegmentDashboardBlockConfig[];
}) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {blocks.map((block) => (
          <span
            key={block.id}
            className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-xs text-[var(--app-text-muted)]"
          >
            {block.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SegmentDashboardComposition({
  segmentKey,
  config,
  isDefaulted,
}: SegmentDashboardCompositionProps) {
  const defaultBlocks = getDefaultVisibleDashboardBlocks(segmentKey);
  const conditionalBlocks = getConditionalDashboardBlocks(segmentKey);
  const collapsedBlocks = getCollapsedDashboardBlocks(segmentKey);
  const secondaryCount = conditionalBlocks.length + collapsedBlocks.length;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-2)]"
      data-testid="segment-dashboard-composition"
    >
      <div className="border-b border-[var(--app-border)] px-4 py-4">
        <SectionHeader
          title="Segment Defaults"
          description={`${config.label} · ${config.primaryWedge}`}
          action={
            <div className="flex flex-wrap justify-end gap-2">
              {isDefaulted ? (
                <Badge
                  size="sm"
                  variant="flat"
                  className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]"
                >
                  Micro VC fallback
                </Badge>
              ) : null}
              <Badge
                size="sm"
                variant="bordered"
                className="border-[var(--app-border)] text-[var(--app-text-muted)]"
              >
                {config.demoLabel}
              </Badge>
            </div>
          }
        />
      </div>

      <div className="px-4 py-4">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {defaultBlocks.map((block, index) => (
            <BlockRow key={block.id} block={block} index={index} />
          ))}
        </ul>

        {secondaryCount > 0 ? (
          <div className="mt-4">
            <ExpandableSection
              title="Collapsed Defaults"
              subtitle="Available blocks stay reachable without taking default dashboard space."
              badge={`${secondaryCount} blocks`}
              tone="default"
              preview={
                <div className="space-y-4 px-4 py-4">
                  <CompactBlockList
                    title="Off by default"
                    blocks={collapsedBlocks}
                  />
                  <CompactBlockList
                    title="On when queue is non-empty"
                    blocks={conditionalBlocks}
                  />
                </div>
              }
              expandLabel="Show collapsed blocks"
              collapseLabel="Hide collapsed blocks"
              contentClassName="px-4 py-4"
              previewClassName="px-0 py-0"
              testId="segment-dashboard-collapsed-blocks"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[...collapsedBlocks, ...conditionalBlocks].map(
                  (block, index) => (
                    <BlockRow
                      key={block.id}
                      block={block}
                      index={defaultBlocks.length + index}
                    />
                  ),
                )}
              </div>
            </ExpandableSection>
          </div>
        ) : null}
      </div>
    </section>
  );
}
