import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { Download, RefreshCw } from "lucide-react";

import { PageShell } from "./PageShell";

/**
 * PageShell — P2-003 component tests. The acceptance criterion for P2-003 is
 * "three migrated pages use PageShell without visual regressions"; these
 * tests pin the slot contract (S1–S5) and the UX-04 "one primary action"
 * discipline that the migrated pages rely on.
 */
describe("PageShell (P2-003)", () => {
  it("renders the title in S1 capped at the operational heading size", () => {
    render(
      <PageShell title="Deals">
        <div>content</div>
      </PageShell>,
    );

    const title = screen.getByTestId("page-shell-title");
    expect(title).toHaveTextContent("Deals");
    expect(title.tagName).toBe("H1");
    // P2-001 T14: operational title is text-2xl, not display sizes.
    expect(title.className).toMatch(/text-2xl/);
    expect(title.className).not.toMatch(/text-3xl|text-4xl|text-5xl|text-6xl/);
  });

  it("renders subtitle and content slot", () => {
    render(
      <PageShell title="Documents" subtitle="Manage fund documents">
        <div data-testid="content">rows</div>
      </PageShell>,
    );

    expect(screen.getByText("Manage fund documents")).toBeInTheDocument();
    const content = screen.getByTestId("page-shell-content");
    expect(within(content).getByTestId("content")).toBeInTheDocument();
  });

  it("renders the freshness chip when lastUpdated is provided", () => {
    render(
      <PageShell title="Reports" lastUpdated="2026-05-14T10:00:00.000Z">
        <div />
      </PageShell>,
    );

    expect(screen.getByTestId("page-shell-last-updated")).toHaveTextContent(
      /Updated/,
    );
  });

  it("suppresses the freshness chip when lastUpdated is explicitly null", () => {
    render(
      <PageShell title="Reports" lastUpdated={null}>
        <div />
      </PageShell>,
    );

    expect(screen.queryByTestId("page-shell-last-updated")).toBeNull();
  });

  it("renders a View only badge when viewOnly is true (UX-09)", () => {
    render(
      <PageShell title="Documents" viewOnly>
        <div />
      </PageShell>,
    );

    expect(screen.getByTestId("page-shell-view-only")).toHaveTextContent(
      /View only/,
    );
  });

  it("renders context badges with semantic tone classes", () => {
    render(
      <PageShell
        title="Deals"
        contextBadges={[
          { label: "Acme Fund I", tone: "neutral", testId: "badge-tenant" },
          { label: "12 open", tone: "info", testId: "badge-count" },
        ]}
      >
        <div />
      </PageShell>,
    );

    expect(screen.getByTestId("badge-tenant")).toHaveTextContent("Acme Fund I");
    expect(screen.getByTestId("badge-count")).toHaveTextContent("12 open");
  });

  it("renders a single primary action and invokes its handler (UX-04)", () => {
    const handler = vi.fn();
    render(
      <PageShell
        title="Deals"
        primaryAction={{ label: "Add deal", onClick: handler }}
      >
        <div />
      </PageShell>,
    );

    const button = screen.getByTestId("page-shell-primary-action");
    expect(button).toHaveTextContent("Add deal");
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("disables the primary action when policy denies and exposes reason via title", () => {
    const handler = vi.fn();
    render(
      <PageShell
        title="Deals"
        primaryAction={{
          label: "Add deal",
          onClick: handler,
          disabled: true,
          disabledReason: "Requires GP role",
        }}
      >
        <div />
      </PageShell>,
    );

    const button = screen.getByTestId("page-shell-primary-action");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("title", "Requires GP role");
    fireEvent.click(button);
    expect(handler).not.toHaveBeenCalled();
  });

  it("renders icon actions up to the limit and demotes extras into the overflow menu", () => {
    const refresh = vi.fn();
    const download = vi.fn();
    const share = vi.fn();
    const copyLink = vi.fn();
    const reset = vi.fn();
    render(
      <PageShell
        title="Reports"
        iconActions={[
          {
            icon: RefreshCw,
            label: "Refresh",
            onClick: refresh,
            testId: "icon-refresh",
          },
          {
            icon: Download,
            label: "Download",
            onClick: download,
            testId: "icon-download",
          },
          {
            icon: RefreshCw,
            label: "Share",
            onClick: share,
            testId: "icon-share",
          },
          {
            icon: Download,
            label: "Copy link",
            onClick: copyLink,
            testId: "icon-copy",
          },
          {
            icon: RefreshCw,
            label: "Reset",
            onClick: reset,
            testId: "icon-reset",
          },
        ]}
      >
        <div />
      </PageShell>,
    );

    const toolbar = screen.getByTestId("page-shell-action-bar");
    // First four icon actions render in the toolbar.
    expect(within(toolbar).getByTestId("icon-refresh")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("icon-download")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("icon-share")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("icon-copy")).toBeInTheDocument();
    // Fifth icon action is NOT rendered as a toolbar icon button…
    expect(within(toolbar).queryByLabelText("Reset")).toBeNull();
    // …but is reachable via the overflow menu.
    expect(screen.getByTestId("page-shell-overflow")).toBeInTheDocument();
    expect(screen.getByTestId("icon-reset")).toHaveAttribute(
      "role",
      "menuitem",
    );
  });

  it("caps visible secondary actions at three and routes the rest to overflow", () => {
    const handlers = Array.from({ length: 5 }, () => vi.fn());
    render(
      <PageShell
        title="Documents"
        secondaryActions={handlers.map((onClick, i) => ({
          label: `Action ${i + 1}`,
          onClick,
          testId: `secondary-${i + 1}`,
        }))}
      >
        <div />
      </PageShell>,
    );

    const toolbar = screen.getByTestId("page-shell-action-bar");
    // First three secondary actions render as visible bordered buttons.
    expect(within(toolbar).getByTestId("secondary-1")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("secondary-2")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("secondary-3")).toBeInTheDocument();
    // Anything beyond the third is demoted into the overflow menu.
    expect(
      within(toolbar).queryByRole("button", { name: "Action 4" }),
    ).toBeNull();
    expect(screen.getByTestId("page-shell-overflow")).toBeInTheDocument();
    expect(screen.getByTestId("secondary-4")).toHaveAttribute(
      "role",
      "menuitem",
    );
    expect(screen.getByTestId("secondary-5")).toHaveAttribute(
      "role",
      "menuitem",
    );
  });

  it("mounts the filters slot (S3) above content", () => {
    render(
      <PageShell
        title="Deals"
        filters={<div data-testid="filter-bar">filters</div>}
      >
        <div />
      </PageShell>,
    );

    const filters = screen.getByTestId("page-shell-filters");
    expect(within(filters).getByTestId("filter-bar")).toBeInTheDocument();
  });

  it("mounts the right rail (S5) when supplied and not otherwise", () => {
    const { rerender } = render(
      <PageShell
        title="Deals"
        rightRail={<div data-testid="drawer">drawer</div>}
      >
        <div />
      </PageShell>,
    );
    expect(screen.getByTestId("page-shell-right-rail")).toBeInTheDocument();
    expect(screen.getByTestId("drawer")).toBeInTheDocument();

    rerender(
      <PageShell title="Deals">
        <div />
      </PageShell>,
    );
    expect(screen.queryByTestId("page-shell-right-rail")).toBeNull();
  });

  it("omits the action bar when no actions are passed", () => {
    render(
      <PageShell title="Empty">
        <div />
      </PageShell>,
    );
    expect(screen.queryByTestId("page-shell-action-bar")).toBeNull();
  });

  it("uses a semantic toolbar role for the action bar", () => {
    render(
      <PageShell
        title="Deals"
        primaryAction={{ label: "Add deal", onClick: vi.fn() }}
      >
        <div />
      </PageShell>,
    );
    const toolbar = screen.getByTestId("page-shell-action-bar");
    expect(toolbar).toHaveAttribute("role", "toolbar");
    expect(toolbar).toHaveAttribute("aria-label", "Page actions");
  });
});
