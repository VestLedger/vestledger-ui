import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { InlineValidation } from "./InlineValidation";

describe("InlineValidation (P2-011)", () => {
  it("renders nothing when no message is supplied", () => {
    const { container } = render(<InlineValidation />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an error message with alert role by default", () => {
    render(<InlineValidation message="Required field" />);
    const node = screen.getByTestId("inline-validation");
    expect(node).toHaveAttribute("data-tone", "error");
    expect(node).toHaveAttribute("role", "alert");
    expect(node).toHaveTextContent("Required field");
  });

  it("renders warning/info tones with status role", () => {
    const { rerender } = render(
      <InlineValidation message="Above policy threshold" tone="warning" />,
    );
    let node = screen.getByTestId("inline-validation");
    expect(node).toHaveAttribute("data-tone", "warning");
    expect(node).toHaveAttribute("role", "status");

    rerender(<InlineValidation message="Helpful hint" tone="info" />);
    node = screen.getByTestId("inline-validation");
    expect(node).toHaveAttribute("data-tone", "info");
    expect(node).toHaveAttribute("role", "status");
  });

  it("wires up fieldId for aria-describedby targeting", () => {
    render(
      <InlineValidation message="Required field" fieldId="iban-validation" />,
    );
    expect(screen.getByTestId("inline-validation")).toHaveAttribute(
      "id",
      "iban-validation",
    );
  });
});
