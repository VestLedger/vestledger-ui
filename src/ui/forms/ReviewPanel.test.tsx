import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { ReviewPanel } from "./ReviewPanel";

describe("ReviewPanel (P2-011)", () => {
  const baseSections = [
    {
      label: "Event",
      rows: [
        { label: "Type", value: "Distribution" },
        { label: "Period", value: "Q2 2026" },
      ],
    },
    {
      label: "Amounts",
      rows: [
        { label: "Gross", value: "$1,000,000" },
        { label: "Above policy", value: "Yes", warning: true },
      ],
    },
  ];

  it("renders every section and row supplied", () => {
    render(<ReviewPanel sections={baseSections} />);
    const panel = screen.getByTestId("review-panel");
    expect(panel).toBeInTheDocument();
    expect(within(panel).getAllByTestId("review-panel-section")).toHaveLength(
      2,
    );
    expect(within(panel).getByText("Distribution")).toBeInTheDocument();
    expect(within(panel).getByText("Q2 2026")).toBeInTheDocument();
    expect(within(panel).getByText("$1,000,000")).toBeInTheDocument();
  });

  it("renders warnings block when warnings are supplied", () => {
    render(
      <ReviewPanel
        sections={baseSections}
        warnings={["NAV refresh older than policy window"]}
      />,
    );
    const warnings = screen.getByTestId("review-panel-warnings");
    expect(warnings).toHaveTextContent("Warnings");
    expect(warnings).toHaveTextContent("NAV refresh older than policy window");
  });

  it("does not render the warnings block when no warnings are supplied", () => {
    render(<ReviewPanel sections={baseSections} />);
    expect(
      screen.queryByTestId("review-panel-warnings"),
    ).not.toBeInTheDocument();
  });

  it("surfaces the audit event and policy in the footer", () => {
    render(
      <ReviewPanel
        sections={baseSections}
        auditEvent="operations.distribution.submitted"
        policy="operations.distribution.manage"
      />,
    );
    const footer = screen.getByTestId("review-panel-footer");
    expect(footer).toHaveTextContent("operations.distribution.submitted");
    expect(footer).toHaveTextContent("operations.distribution.manage");
  });

  it("omits the footer when no audit/policy supplied", () => {
    render(<ReviewPanel sections={baseSections} />);
    expect(screen.queryByTestId("review-panel-footer")).not.toBeInTheDocument();
  });
});
