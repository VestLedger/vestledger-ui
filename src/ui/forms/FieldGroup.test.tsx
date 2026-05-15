import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { FieldGroup } from "./FieldGroup";

describe("FieldGroup (P2-011)", () => {
  it("renders the label and child fields", () => {
    render(
      <FieldGroup label="Banking details">
        <input data-testid="iban" />
      </FieldGroup>,
    );
    expect(screen.getByTestId("field-group")).toBeInTheDocument();
    expect(screen.getByText("Banking details")).toBeInTheDocument();
    expect(screen.getByTestId("iban")).toBeInTheDocument();
  });

  it("renders an optional description and badge", () => {
    render(
      <FieldGroup
        label="Tax info"
        description="Used for K-1 generation."
        badge={<span data-testid="optional">(optional)</span>}
      >
        <input />
      </FieldGroup>,
    );
    expect(screen.getByText("Used for K-1 generation.")).toBeInTheDocument();
    expect(screen.getByTestId("optional")).toBeInTheDocument();
  });

  it("renders a divider by default and removes it when hidden", () => {
    const { rerender } = render(
      <FieldGroup label="A">
        <input />
      </FieldGroup>,
    );
    expect(screen.getByTestId("field-group").className).toMatch(/border-b/);

    rerender(
      <FieldGroup label="A" hideDivider>
        <input />
      </FieldGroup>,
    );
    expect(screen.getByTestId("field-group").className).not.toMatch(/border-b/);
  });
});
