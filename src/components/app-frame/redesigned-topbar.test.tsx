import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getInitials, RedesignedTopbar } from "./redesigned-topbar";

const mocks = vi.hoisted(() => ({
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: mocks.setTheme }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ user: { name: "Alex Kim" } }),
}));

describe("getInitials", () => {
  it("derives two-letter initials with GP fallback", () => {
    expect(getInitials("Alex Kim")).toBe("AK");
    expect(getInitials("Cher")).toBe("CH");
    expect(getInitials(undefined)).toBe("GP");
    expect(getInitials("   ")).toBe("GP");
  });
});

describe("RedesignedTopbar", () => {
  it("renders title, initials, and labelled utility controls", () => {
    render(<RedesignedTopbar title="Home" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("AK")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
  });

  it("toggles the color theme", () => {
    render(<RedesignedTopbar title="Home" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );
    expect(mocks.setTheme).toHaveBeenCalledWith("dark");
  });

  it("renders an optional route-actions slot", () => {
    render(
      <RedesignedTopbar
        title="Home"
        actions={<button type="button">Export</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });
});
