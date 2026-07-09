import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  RedesignedFrameShell,
  useRedesignedFrameVesta,
} from "./redesigned-frame-shell";

const mocks = vi.hoisted(() => {
  const dispatch = vi.fn();
  const openCopilotWithQuery = vi.fn();
  const state = {
    copilot: { messages: [], isTyping: false, error: null },
    ui: { byKey: {} as Record<string, unknown> },
  };
  return { dispatch, openCopilotWithQuery, state };
});

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/home",
}));

vi.mock("@/hooks/use-copilot-controller", () => ({
  openCopilotWithQuery: mocks.openCopilotWithQuery,
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: typeof mocks.state) => unknown) =>
    selector(mocks.state),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ user: { name: "Alex Kim" } }),
}));

function SubmitProbe() {
  const { submitVestaQuery } = useRedesignedFrameVesta();
  return (
    <button type="button" onClick={() => submitVestaQuery("From the page")}>
      Ask from page
    </button>
  );
}

describe("RedesignedFrameShell", () => {
  it("renders topbar title, Vesta rail, and page children inside the frame", () => {
    render(
      <RedesignedFrameShell title="Home" prompts={["Prompt A"]}>
        <div data-testid="page-content" />
      </RedesignedFrameShell>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ask Vesta" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("redesigned-app-frame")).toBeInTheDocument();
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("submits prompt chips with the current pathname", () => {
    render(
      <RedesignedFrameShell title="Home" prompts={["Prompt A"]}>
        <div />
      </RedesignedFrameShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Prompt A" }));
    expect(mocks.openCopilotWithQuery).toHaveBeenCalledWith(
      mocks.dispatch,
      "/home",
      "Prompt A",
    );
  });

  it("exposes submitVestaQuery to page content through context", () => {
    render(
      <RedesignedFrameShell title="Home" prompts={[]}>
        <SubmitProbe />
      </RedesignedFrameShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ask from page" }));
    expect(mocks.openCopilotWithQuery).toHaveBeenCalledWith(
      mocks.dispatch,
      "/home",
      "From the page",
    );
  });

  it("throws when useRedesignedFrameVesta is used outside the shell", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<SubmitProbe />)).toThrow(
      "useRedesignedFrameVesta must be used inside RedesignedFrameShell",
    );
    consoleError.mockRestore();
  });
});
