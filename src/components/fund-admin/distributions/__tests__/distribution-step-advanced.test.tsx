import type { ReactElement } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextUIProvider } from "@nextui-org/react";
import { DistributionStepAdvanced } from "@/components/fund-admin/distributions/distribution-step-advanced";

const renderWithNextUI = (ui: ReactElement) =>
  render(<NextUIProvider>{ui}</NextUIProvider>);

describe("DistributionStepAdvanced", () => {
  it("renders advanced workflow sections", () => {
    renderWithNextUI(
      <DistributionStepAdvanced data={{}} eventType="exit" onChange={() => {}} />
    );

    expect(screen.getByText(/distribution-in-kind assets/i)).toBeInTheDocument();
    expect(screen.getByText(/special distribution details/i)).toBeInTheDocument();
  });
});
