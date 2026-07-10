import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./command-palette";
import { ROUTE_PATHS } from "@/config/routes";
import type { UserRole } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  dispatch: vi.fn(),
  toastInfo: vi.fn(),
  openCopilotWithQuery: vi.fn(),
  patch: vi.fn(),
  state: {
    open: true,
    search: "",
    stageFilter: null as string | null,
  },
  role: "gp" as UserRole,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => "/home",
}));

vi.mock("@/store/ui", () => ({
  useUIKey: () => ({ value: mocks.state, patch: mocks.patch }),
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
}));

vi.mock("@/hooks/use-copilot-controller", () => ({
  openCopilotWithQuery: mocks.openCopilotWithQuery,
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ user: { role: mocks.role, name: "Test GP" } }),
}));

vi.mock("@/config/env", () => ({
  buildAdminSuperadminUrl: (host: string) => `https://admin.test/${host}`,
}));

vi.mock("@/ui", () => ({
  useToast: () => ({ info: mocks.toastInfo }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.state = { open: true, search: "", stageFilter: null };
  mocks.role = "gp";
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe("CommandPalette — root view", () => {
  it("lists the 14 GP lifecycle stages in order", () => {
    render(<CommandPalette />);
    const items = screen.getAllByTestId("palette-stage");
    expect(items).toHaveLength(14);
    expect(items[0].textContent).toContain("Overview");
    expect(items[1].textContent).toContain("Raise & LP Onboarding");
    expect(items[6].textContent).toContain("Capital & Fund Admin");
    expect(items[13].textContent).toContain("Data & Integrations");
    // Spot-check ordering of execution stage
    expect(
      items.some((el) => el.textContent!.includes("Deal Execution & Closing")),
    ).toBe(true);
  });

  it("shows quick actions", () => {
    render(<CommandPalette />);
    expect(screen.getByText("Add New Deal")).toBeTruthy();
    expect(screen.getByText("Start IC Memo")).toBeTruthy();
    expect(screen.getByText("Ask Vesta")).toBeTruthy();
  });
});

describe("CommandPalette — stage view", () => {
  it("selecting a stage patches stageFilter", () => {
    render(<CommandPalette />);
    fireEvent.click(screen.getByText("Capital & Fund Admin"));
    expect(mocks.patch).toHaveBeenCalledWith({ stageFilter: "fund-admin" });
  });

  it("renders stage destinations with Planned badges", () => {
    mocks.state = { open: true, search: "", stageFilter: "raise" };
    render(<CommandPalette />);
    expect(screen.getByText("Fundraising Pipeline")).toBeTruthy();
    expect(screen.getAllByText("Planned").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("← All stages")).toBeTruthy();
  });
});

describe("CommandPalette — activation", () => {
  it("existing tab destination dispatches tab patch and navigates", () => {
    mocks.state = { open: true, search: "", stageFilter: "fund-admin" };
    render(<CommandPalette />);
    fireEvent.click(screen.getByText("Capital Calls"));
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          key: "back-office-fund-admin",
          patch: { selectedTab: "capital-calls" },
        },
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith(ROUTE_PATHS.fundAdmin);
  });

  it("planned destination routes to fallback with a toast", () => {
    mocks.state = { open: true, search: "", stageFilter: "raise" };
    render(<CommandPalette />);
    fireEvent.click(screen.getByText("Fundraising Pipeline"));
    expect(mocks.toastInfo).toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith(ROUTE_PATHS.lpManagement);
  });

  it("Ask Vesta opens the copilot", () => {
    render(<CommandPalette />);
    fireEvent.click(screen.getByText("Ask Vesta"));
    expect(mocks.openCopilotWithQuery).toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});

describe("CommandPalette — search view", () => {
  it("finds destinations by matrix workflow language", () => {
    mocks.state = { open: true, search: "capital call", stageFilter: null };
    render(<CommandPalette />);
    expect(screen.getByText("Capital Calls")).toBeTruthy();
  });

  it("includes deferred persona entries with Future badge", () => {
    mocks.state = { open: true, search: "family office", stageFilter: null };
    render(<CommandPalette />);
    expect(screen.getByText("Family Tax & Estate Decisions")).toBeTruthy();
    expect(screen.getAllByText("Future").length).toBeGreaterThanOrEqual(1);
  });
});

describe("CommandPalette — roles and regression", () => {
  // /pipeline has no ROUTE_ACCESS_RULES entry so LP can access it.
  // Use /deal-intelligence which is restricted to ["gp", "analyst", "strategic_partner"].
  it("lp role does not see GP-only destinations in search", () => {
    mocks.role = "lp";
    mocks.state = {
      open: true,
      search: "deal intelligence",
      stageFilter: null,
    };
    render(<CommandPalette />);
    expect(screen.queryByText("Deal Intelligence")).toBeNull();
  });

  it("lp role still sees the LP portal", () => {
    mocks.role = "lp";
    mocks.state = { open: true, search: "portal", stageFilter: null };
    render(<CommandPalette />);
    expect(screen.getByText("LP Portal")).toBeTruthy();
  });

  it("Add New Deal still routes to the pipeline with its toast", () => {
    render(<CommandPalette />);
    fireEvent.click(screen.getByText("Add New Deal"));
    expect(mocks.toastInfo).toHaveBeenCalledWith(
      "Opening pipeline with create-deal workflow.",
      "Add Deal",
    );
    expect(mocks.push).toHaveBeenCalledWith(ROUTE_PATHS.pipeline);
  });

  it("Create Capital Call deep-links to the capital-calls tab", () => {
    render(<CommandPalette />);
    fireEvent.click(screen.getByText("Create Capital Call"));
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          key: "back-office-fund-admin",
          patch: { selectedTab: "capital-calls" },
        },
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith(ROUTE_PATHS.fundAdmin);
  });
});
