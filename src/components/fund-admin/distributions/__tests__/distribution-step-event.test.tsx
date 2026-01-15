import type { ReactElement } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextUIProvider } from "@nextui-org/react";
import { DistributionStepEvent } from "@/components/fund-admin/distributions/distribution-step-event";
import type { Distribution } from "@/types/distribution";

const renderWithNextUI = (ui: ReactElement) =>
  render(<NextUIProvider>{ui}</NextUIProvider>);

describe("DistributionStepEvent", () => {
  it("renders required form fields", () => {
    const eventData: Partial<Distribution> = {
      name: "Q4 Distribution",
      eventType: "dividend",
      eventDate: "2024-12-31",
      paymentDate: "2024-12-31",
      grossProceeds: 10000000,
      fundName: "Test Fund",
    };

    renderWithNextUI(
      <DistributionStepEvent eventData={eventData} onChange={() => {}} />
    );

    expect(screen.getByLabelText(/distribution name/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/event type/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/gross proceeds/i)).toBeInTheDocument();
  });
});
