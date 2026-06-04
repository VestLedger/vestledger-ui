import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeCommandCenterPrototype } from "./home-command-center-prototype";

const { setTheme } = vi.hoisted(() => ({
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "dark",
    setTheme,
  }),
}));

describe("HomeCommandCenterPrototype", () => {
  beforeEach(() => {
    localStorage.clear();
    setTheme.mockClear();
  });

  it("renders the new priority action queue with mock data", () => {
    render(<HomeCommandCenterPrototype />);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Today's Action Queue" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("3 priority items for your focus"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Review 3 funding updates" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Approve 2 capital calls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Monitor 1 portfolio risk" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Also on deck (4)")).toBeInTheDocument();
  });

  it("renders the new workflow and intelligence rails with mock data", () => {
    render(<HomeCommandCenterPrototype />);

    expect(screen.getByText("Smart Actions")).toBeInTheDocument();
    expect(screen.getByText("Vesta Suggests")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ask Vesta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fund Health" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pipeline Watch" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Portfolio Intelligence" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Helios Robotics")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(
      screen.getByText("Ask Vesta: summarize signals"),
    ).toBeInTheDocument();
  });

  it("keeps the topbar in the content shell that spans the center and right rail", () => {
    render(<HomeCommandCenterPrototype />);

    const contentShell = screen.getByTestId("gp-home-prototype-content-shell");

    expect(contentShell).toContainElement(
      screen.getByTestId("gp-home-prototype-topbar"),
    );
    expect(contentShell).toContainElement(
      screen.getByTestId("gp-home-prototype-body"),
    );
  });

  it("places the theme toggle before notifications and switches themes", () => {
    render(<HomeCommandCenterPrototype />);

    const topbar = screen.getByTestId("gp-home-prototype-topbar");
    const topbarButtons = within(topbar).getAllByRole("button");
    const themeToggle = within(topbar).getByRole("button", {
      name: "Switch to light theme",
    });
    const notifications = within(topbar).getByRole("button", {
      name: "Notifications",
    });

    expect(topbarButtons.indexOf(themeToggle)).toBeLessThan(
      topbarButtons.indexOf(notifications),
    );

    fireEvent.click(themeToggle);

    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("resizes the sidebar with the keyboard and persists the chosen width", () => {
    render(<HomeCommandCenterPrototype />);

    const dashboard = screen.getByTestId("gp-home-command-center");
    const resizeHandle = screen.getByRole("separator", {
      name: "Resize sidebar",
    });

    expect(resizeHandle).toHaveAttribute("aria-valuenow", "515");

    fireEvent.keyDown(resizeHandle, { key: "ArrowRight" });

    expect(resizeHandle).toHaveAttribute("aria-valuenow", "527");
    expect(dashboard.style.getPropertyValue("--home-sidebar-width")).toBe(
      "527px",
    );
    expect(localStorage.getItem("vestledger-home-sidebar-width")).toBe("527");
  });

  it("resizes the sidebar by dragging its divider", () => {
    render(<HomeCommandCenterPrototype />);

    const dashboard = screen.getByTestId("gp-home-command-center");
    const resizeHandle = screen.getByRole("separator", {
      name: "Resize sidebar",
    });

    fireEvent(
      resizeHandle,
      new MouseEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: 515,
      }),
    );
    fireEvent(
      window,
      new MouseEvent("pointermove", { bubbles: true, clientX: 575 }),
    );
    fireEvent(window, new MouseEvent("pointerup", { bubbles: true }));

    expect(resizeHandle).toHaveAttribute("aria-valuenow", "575");
    expect(dashboard.style.getPropertyValue("--home-sidebar-width")).toBe(
      "575px",
    );
  });
});
