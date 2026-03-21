import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type {
  DailyBriefItem,
  HomeBlocker,
  HomeOpportunity,
} from "@/data/mocks/hooks/dashboard-data";
import { HomeActionCenter } from "./home-action-center";

const items: DailyBriefItem[] = [
  {
    id: "brief-1",
    type: "warning",
    title: "Escalate overdue LP commitments",
    description: "Commitments require follow-up.",
    owner: "Fund Admin",
    lane: "LP Relations",
    dueDate: new Date("2026-03-20T00:00:00.000Z"),
    urgencyScore: 9,
    importanceScore: 9,
    route: "/fund-admin",
    quadrant: "urgent-important",
  },
];

const blockers: HomeBlocker[] = [
  {
    id: "blocker-1",
    sourceId: "brief-1",
    title: "Bridge extension decision",
    description: "Runway approaching threshold.",
    blockedDays: 4,
    severity: "critical",
    lane: "Portfolio",
    route: "/portfolio",
  },
];

const opportunities: HomeOpportunity[] = [
  {
    id: "opp-1",
    sourceId: "portfolio-1",
    title: "Secondary liquidity signal",
    thesis: "Partial liquidity could strengthen LP trust.",
    impactLabel: "Trust builder",
    confidence: 0.82,
    lane: "LP Relations",
    route: "/fund-admin",
  },
];

describe("HomeActionCenter", () => {
  it("defaults to a collapsed preview and expands into detail", () => {
    render(
      <HomeActionCenter
        items={items}
        blockers={blockers}
        opportunities={opportunities}
        onItemClick={() => {}}
        onBlockerClick={() => {}}
        onOpportunityClick={() => {}}
        blockGapClass="gap-3"
      />,
    );

    expect(
      screen.getByTestId("gp-home-action-center-preview"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("gp-priority-matrix")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("gp-home-action-center-toggle"));

    expect(
      screen.getByTestId("gp-home-action-center-content"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("gp-priority-matrix")).toBeInTheDocument();
    expect(screen.getByTestId("gp-home-opportunities")).toBeInTheDocument();
  });

  it("routes from the collapsed preview cards", () => {
    const onBlockerClick = vi.fn();
    const onOpportunityClick = vi.fn();

    render(
      <HomeActionCenter
        items={items}
        blockers={blockers}
        opportunities={opportunities}
        onItemClick={() => {}}
        onBlockerClick={onBlockerClick}
        onOpportunityClick={onOpportunityClick}
        blockGapClass="gap-3"
      />,
    );

    fireEvent.click(screen.getByText("Bridge extension decision"));
    fireEvent.click(screen.getByText("Secondary liquidity signal"));

    expect(onBlockerClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "blocker-1" }),
    );
    expect(onOpportunityClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "opp-1" }),
    );
  });
});
