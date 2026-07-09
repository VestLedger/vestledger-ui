import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getInitials,
  RedesignedTopbar,
  VESTA_HELP_PROMPT,
} from "./redesigned-topbar";

const mocks = vi.hoisted(() => ({
  setTheme: vi.fn(),
  push: vi.fn(),
  dispatch: vi.fn(),
  openCopilotWithQuery: vi.fn(),
  logout: vi.fn(),
  patches: [] as Array<{ key: string; patch: Record<string, unknown> }>,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: mocks.setTheme }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => "/home",
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
}));

vi.mock("@/hooks/use-copilot-controller", () => ({
  openCopilotWithQuery: mocks.openCopilotWithQuery,
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: { name: "Alex Kim", email: "alex@vestledger.test" },
    logout: mocks.logout,
  }),
}));

vi.mock("@/config/env", () => ({
  buildPublicWebUrl: (host: string) => `https://public.test/${host}`,
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn() },
}));

// Stateful useUIKey mock: records every patch AND applies it locally so
// dropdown open/close behaves like the real store-backed hook.
vi.mock("@/store/ui", async () => {
  const { useCallback, useState } = await import("react");
  return {
    useUIKey: <T,>(key: string, fallback: T) => {
      const [value, setValue] = useState(fallback);
      const patch = useCallback(
        (patchValue: Partial<T>) => {
          mocks.patches.push({
            key,
            patch: patchValue as Record<string, unknown>,
          });
          setValue(
            (current) => ({ ...(current as object), ...patchValue }) as T,
          );
        },
        [key],
      );
      return { value, set: setValue, patch };
    },
  };
});

describe("getInitials", () => {
  it("derives two-letter initials with GP fallback", () => {
    expect(getInitials("Alex Kim")).toBe("AK");
    expect(getInitials("Cher")).toBe("CH");
    expect(getInitials(undefined)).toBe("GP");
    expect(getInitials("   ")).toBe("GP");
  });
});

describe("RedesignedTopbar", () => {
  beforeEach(() => {
    mocks.setTheme.mockClear();
    mocks.push.mockClear();
    mocks.dispatch.mockClear();
    mocks.openCopilotWithQuery.mockClear();
    mocks.logout.mockClear();
    mocks.patches.length = 0;
    sessionStorage.clear();
  });

  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("renders title, initials, and labelled utility controls", () => {
    render(<RedesignedTopbar title="Home" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("AK")).toBeInTheDocument();
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

  it("opens the command palette from the menu control", () => {
    render(<RedesignedTopbar title="Home" />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(mocks.patches).toContainEqual({
      key: "command-palette",
      patch: { open: true },
    });
  });

  it("routes the notifications control to /notifications", () => {
    render(<RedesignedTopbar title="Home" />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(mocks.push).toHaveBeenCalledWith("/notifications");
  });

  it("submits the Vesta help prompt from the help control", () => {
    render(<RedesignedTopbar title="Home" />);
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(mocks.openCopilotWithQuery).toHaveBeenCalledWith(
      mocks.dispatch,
      "/home",
      VESTA_HELP_PROMPT,
    );
  });

  it("opens the profile menu with user info and closes on Escape returning focus", () => {
    render(<RedesignedTopbar title="Home" />);
    const trigger = screen.getByRole("button", { name: "Open profile menu" });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByText("Alex Kim")).toBeInTheDocument();
    expect(screen.getByText("alex@vestledger.test")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("menu", { name: "Profile" }), {
      key: "Escape",
    });
    expect(
      screen.queryByRole("menu", { name: "Profile" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("navigates to settings from the profile menu", () => {
    render(<RedesignedTopbar title="Home" />);
    fireEvent.click(screen.getByRole("button", { name: "Open profile menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Alex Kim/ }));
    expect(mocks.push).toHaveBeenCalledWith("/settings");
    expect(
      screen.queryByRole("menu", { name: "Profile" }),
    ).not.toBeInTheDocument();
  });

  it("signs out via the legacy-equivalent flow", () => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "", host: "app.vestledger.test" },
      writable: true,
      configurable: true,
    });
    render(<RedesignedTopbar title="Home" />);
    fireEvent.click(screen.getByRole("button", { name: "Open profile menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign Out" }));
    expect(sessionStorage.getItem("isLoggingOut")).toBe("true");
    expect(mocks.logout).toHaveBeenCalled();
    expect(window.location.href).toBe(
      "https://public.test/app.vestledger.test",
    );
  });
});
