import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeCommandCenter } from "./home-command-center";

const mocks = vi.hoisted(() => {
  const push = vi.fn();
  const openWithQuery = vi.fn();
  const setTheme = vi.fn();

  return {
    push,
    openWithQuery,
    setTheme,
    queueParam: null as string | null,
  };
});

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: mocks.setTheme }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () =>
    new URLSearchParams(mocks.queueParam ? `queue=${mocks.queueParam}` : ""),
}));

vi.mock("@/components/ai-copilot-sidebar", () => ({
  AICopilotSidebar: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="home-vesta-copilot">
      Vesta conversation
      <button type="button" aria-label="Close Vesta" onClick={onClose} />
    </div>
  ),
  useAICopilot: () => ({ openWithQuery: mocks.openWithQuery }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ user: { name: "Alex Kim" } }),
}));

vi.mock("@/contexts/fund-context", () => ({
  useFund: () => ({ selectedFund: null }),
}));

describe("HomeCommandCenter", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.push.mockClear();
    mocks.openWithQuery.mockClear();
    mocks.setTheme.mockClear();
    mocks.queueParam = null;
  });

  afterEach(() => {
    mocks.queueParam = null;
  });

  it("renders the topbar with the user's initials and a footer", () => {
    render(<HomeCommandCenter />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
    expect(screen.getByText("AK")).toBeInTheDocument();
    expect(screen.getByText("Powered by Vesta AI")).toBeInTheDocument();
  });

  it("toggles the color theme from the topbar", () => {
    render(<HomeCommandCenter />);

    const toggle = screen.getByRole("button", {
      name: "Switch to dark mode",
    });
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(mocks.setTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles the Smart Actions accordion from its header", () => {
    render(<HomeCommandCenter />);

    const header = screen.getByRole("button", { name: /Smart Actions/ });
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("IC Meeting")).toBeInTheDocument();

    fireEvent.click(header);

    expect(header).toHaveAttribute("aria-expanded", "false");
    // Items remain mounted (accordion collapse), header stays visible.
    expect(screen.getByText("IC Meeting")).toBeInTheDocument();
  });

  it("shows the caught-up state for a light queue (?queue=1)", () => {
    mocks.queueParam = "1";
    render(<HomeCommandCenter />);

    expect(
      screen.getByText("1 priority item for your focus"),
    ).toBeInTheDocument();
    expect(screen.getByText("You're caught up.")).toBeInTheDocument();
    expect(
      screen.getByText("Only 1 priority item needs attention today."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Review 3 funding updates" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/View remaining/)).not.toBeInTheDocument();
    expect(screen.getByText("Also on deck (4)")).toBeInTheDocument();
  });

  it("shows three priority cards for a moderate queue (?queue=3)", () => {
    mocks.queueParam = "3";
    render(<HomeCommandCenter />);

    expect(
      screen.getByText("3 priority items for your focus"),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing top 3 priorities")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Review 3 funding updates" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Approve 2 capital calls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Monitor 1 portfolio risk" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("You're caught up.")).not.toBeInTheDocument();
    expect(screen.queryByText(/View remaining/)).not.toBeInTheDocument();
  });

  it("shows the remaining-priorities expander for a heavy queue (?queue=7)", () => {
    mocks.queueParam = "7";
    render(<HomeCommandCenter />);

    expect(
      screen.getByText("7 priority items. Showing the top 3 for focus."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Showing top 3 of 7 priorities"),
    ).toBeInTheDocument();
    expect(screen.getByText("7 items")).toBeInTheDocument();
    expect(screen.getByText("4 more priority items")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /View remaining 4/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("You're caught up.")).not.toBeInTheDocument();
  });

  it("falls back to the moderate queue for an invalid ?queue value", () => {
    mocks.queueParam = "99";
    render(<HomeCommandCenter />);

    expect(
      screen.getByText("3 priority items for your focus"),
    ).toBeInTheDocument();
  });

  it("navigates when a priority card action is clicked", () => {
    mocks.queueParam = "3";
    render(<HomeCommandCenter />);

    fireEvent.click(screen.getByRole("button", { name: /Review & approve/i }));

    expect(mocks.push).toHaveBeenCalledWith("/fund-admin");
  });

  it("opens the AI copilot when an Ask Vesta query is submitted", () => {
    render(<HomeCommandCenter />);

    expect(screen.queryByTestId("home-vesta-copilot")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Ask Vesta" }), {
      target: { value: "Summarize the funding updates" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Vesta prompt" }));

    expect(mocks.openWithQuery).toHaveBeenCalledWith(
      "Summarize the funding updates",
    );
    expect(screen.getByTestId("home-vesta-copilot")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close Vesta" }));

    expect(screen.queryByTestId("home-vesta-copilot")).not.toBeInTheDocument();
  });

  it("resizes the sidebar with the keyboard and persists the chosen width", () => {
    render(<HomeCommandCenter />);

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
    render(<HomeCommandCenter />);

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
