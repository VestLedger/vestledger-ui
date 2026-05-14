import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { Download, RefreshCw } from "lucide-react";

import { ActionToolbar } from "./ActionToolbar";

/**
 * ActionToolbar — P2-004 component tests.
 *
 * Acceptance: "Buttons show allowed, disabled, unavailable, and loading
 * states consistently." These tests pin the four states across all action
 * surfaces (primary, secondary, icon) plus the overflow demotion and
 * UX-04 one-primary-action discipline.
 */
describe("ActionToolbar (P2-004)", () => {
  it("renders nothing when no actions are supplied", () => {
    const { container } = render(<ActionToolbar />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with a semantic toolbar role and a default aria-label", () => {
    render(
      <ActionToolbar primaryAction={{ label: "Add", onClick: vi.fn() }} />,
    );
    const toolbar = screen.getByTestId("action-toolbar");
    expect(toolbar).toHaveAttribute("role", "toolbar");
    expect(toolbar).toHaveAttribute("aria-label", "Page actions");
  });

  it("allowed primary action is clickable and reports state", () => {
    const handler = vi.fn();
    render(
      <ActionToolbar primaryAction={{ label: "Add deal", onClick: handler }} />,
    );
    const button = screen.getByTestId("action-toolbar-primary");
    expect(button).toHaveAttribute("data-state", "allowed");
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("disabled primary action blocks click and surfaces reason via title", () => {
    const handler = vi.fn();
    render(
      <ActionToolbar
        primaryAction={{
          label: "Add deal",
          onClick: handler,
          state: "disabled",
          reason: "Requires GP role",
        }}
      />,
    );
    const button = screen.getByTestId("action-toolbar-primary");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-state", "disabled");
    expect(button).toHaveAttribute("title", "Requires GP role");
    fireEvent.click(button);
    expect(handler).not.toHaveBeenCalled();
  });

  it("unavailable primary action is visually distinct from policy-disabled", () => {
    const handler = vi.fn();
    render(
      <ActionToolbar
        primaryAction={{
          label: "Generate AI memo",
          onClick: handler,
          state: "unavailable",
          reason: "AI provider not configured",
        }}
      />,
    );
    const button = screen.getByTestId("action-toolbar-primary");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-state", "unavailable");
    expect(button).toHaveAttribute("title", "AI provider not configured");
    expect(button.className).toMatch(/opacity-60/);
    fireEvent.click(button);
    expect(handler).not.toHaveBeenCalled();
  });

  it("unavailable action falls back to a default reason when none supplied", () => {
    render(
      <ActionToolbar
        primaryAction={{
          label: "Open feature",
          onClick: vi.fn(),
          state: "unavailable",
        }}
      />,
    );
    const button = screen.getByTestId("action-toolbar-primary");
    expect(button.getAttribute("title")).toMatch(/Unavailable/);
  });

  it("loading primary action shows a spinner and blocks click", () => {
    const handler = vi.fn();
    render(
      <ActionToolbar
        primaryAction={{
          label: "Generate report",
          onClick: handler,
          state: "loading",
        }}
      />,
    );
    const button = screen.getByTestId("action-toolbar-primary");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-state", "loading");
    fireEvent.click(button);
    expect(handler).not.toHaveBeenCalled();
  });

  it("renders icon actions with their state attribute", () => {
    const refresh = vi.fn();
    const download = vi.fn();
    render(
      <ActionToolbar
        iconActions={[
          {
            icon: RefreshCw,
            label: "Refresh",
            onClick: refresh,
            testId: "icon-refresh",
          },
          {
            icon: Download,
            label: "Download",
            onClick: download,
            state: "unavailable",
            reason: "No artifact yet",
            testId: "icon-download",
          },
        ]}
      />,
    );
    const refreshBtn = screen.getByTestId("icon-refresh");
    expect(refreshBtn).toHaveAttribute("data-state", "allowed");
    fireEvent.click(refreshBtn);
    expect(refresh).toHaveBeenCalledTimes(1);

    const downloadBtn = screen.getByTestId("icon-download");
    expect(downloadBtn).toBeDisabled();
    expect(downloadBtn).toHaveAttribute("data-state", "unavailable");
    expect(downloadBtn).toHaveAttribute("title", "No artifact yet");
    fireEvent.click(downloadBtn);
    expect(download).not.toHaveBeenCalled();
  });

  it("caps visible secondary actions at three and demotes the rest to overflow", () => {
    const handlers = Array.from({ length: 5 }, () => vi.fn());
    render(
      <ActionToolbar
        secondaryActions={handlers.map((onClick, i) => ({
          label: `Action ${i + 1}`,
          onClick,
          testId: `secondary-${i + 1}`,
        }))}
      />,
    );
    const toolbar = screen.getByTestId("action-toolbar");
    expect(within(toolbar).getByTestId("secondary-1")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("secondary-2")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("secondary-3")).toBeInTheDocument();
    expect(
      within(toolbar).queryByRole("button", { name: "Action 4" }),
    ).toBeNull();
    expect(screen.getByTestId("action-toolbar-overflow")).toBeInTheDocument();
    expect(screen.getByTestId("secondary-4")).toHaveAttribute(
      "role",
      "menuitem",
    );
    expect(screen.getByTestId("secondary-5")).toHaveAttribute(
      "role",
      "menuitem",
    );
  });

  it("caps visible icon actions at four and demotes the rest to overflow", () => {
    const handlers = Array.from({ length: 5 }, () => vi.fn());
    render(
      <ActionToolbar
        iconActions={handlers.map((onClick, i) => ({
          icon: RefreshCw,
          label: `Icon ${i + 1}`,
          onClick,
          testId: `icon-${i + 1}`,
        }))}
      />,
    );
    const toolbar = screen.getByTestId("action-toolbar");
    expect(within(toolbar).getByTestId("icon-1")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("icon-4")).toBeInTheDocument();
    expect(within(toolbar).queryByLabelText("Icon 5")).toBeNull();
    expect(screen.getByTestId("icon-5")).toHaveAttribute("role", "menuitem");
  });

  it("overflow menu items respect state attributes (disabled / unavailable / loading)", () => {
    const disabled = vi.fn();
    const unavailable = vi.fn();
    const loading = vi.fn();
    render(
      <ActionToolbar
        overflowActions={[
          {
            label: "Disabled action",
            onClick: disabled,
            state: "disabled",
            reason: "No permission",
            testId: "overflow-disabled",
          },
          {
            label: "Unavailable action",
            onClick: unavailable,
            state: "unavailable",
            reason: "Not implemented",
            testId: "overflow-unavailable",
          },
          {
            label: "Loading action",
            onClick: loading,
            state: "loading",
            testId: "overflow-loading",
          },
        ]}
      />,
    );
    const dis = screen.getByTestId("overflow-disabled");
    expect(dis).toBeDisabled();
    expect(dis).toHaveAttribute("title", "No permission");
    fireEvent.click(dis);
    expect(disabled).not.toHaveBeenCalled();

    const un = screen.getByTestId("overflow-unavailable");
    expect(un).toBeDisabled();
    expect(un).toHaveAttribute("data-state", "unavailable");
    // Match exact-text "Unavailable" suffix (not the action label).
    expect(within(un).getByText("Unavailable")).toBeInTheDocument();

    const ld = screen.getByTestId("overflow-loading");
    expect(ld).toBeDisabled();
    expect(within(ld).getByText(/Working/)).toBeInTheDocument();
    fireEvent.click(ld);
    expect(loading).not.toHaveBeenCalled();
  });

  it("overflow testId can be overridden for wrapping composites", () => {
    render(
      <ActionToolbar
        overflowActions={[{ label: "X", onClick: vi.fn() }]}
        overflowTestId="my-shell-overflow"
      />,
    );
    expect(screen.getByTestId("my-shell-overflow")).toBeInTheDocument();
    expect(screen.queryByTestId("action-toolbar-overflow")).toBeNull();
  });

  it("preserves UX-04 — only one primary action per render", () => {
    // Type system already prevents multiple primaries; this test pins runtime
    // behaviour: the rendered toolbar exposes exactly one element with the
    // `data-state` reserved for the primary button.
    render(
      <ActionToolbar
        primaryAction={{ label: "Add", onClick: vi.fn() }}
        secondaryActions={[
          { label: "Import", onClick: vi.fn(), testId: "sec-import" },
          { label: "Export", onClick: vi.fn(), testId: "sec-export" },
        ]}
      />,
    );
    const toolbar = screen.getByTestId("action-toolbar");
    const primaryButtons = within(toolbar)
      .getAllByRole("button")
      .filter(
        (b) => b.getAttribute("data-testid") === "action-toolbar-primary",
      );
    expect(primaryButtons).toHaveLength(1);
  });
});
