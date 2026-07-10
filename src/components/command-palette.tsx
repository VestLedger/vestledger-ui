"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { ArrowLeft, Building2, Layers, Search, Sparkles } from "lucide-react";
import "./command-palette.css";
import { useUIKey } from "@/store/ui";
import {
  UI_STATE_DEFAULTS,
  UI_STATE_KEYS,
} from "@/store/constants/uiStateKeys";
import { useAppDispatch } from "@/store/hooks";
import { patchUIState } from "@/store/slices/uiSlice";
import {
  NAV_STAGES,
  NAV_STAGE_LABEL_BY_ID,
  type NavStageId,
} from "@/config/navigation-stages";
import {
  NAV_QUICK_ACTIONS,
  type NavDestination,
  type NavQuickAction,
} from "@/config/navigation-destinations";
import { TAB_ACTIVATION_BY_ROUTE } from "@/config/tab-activation";
import {
  coverageBadge,
  destinationsForStage,
  destinationSearchKeywords,
  resolvePaletteView,
  searchableDestinations,
} from "./command-palette-items";
import { openCopilotWithQuery } from "@/hooks/use-copilot-controller";
import { useAuth } from "@/contexts/auth-context";
import { buildAdminSuperadminUrl } from "@/config/env";
import { isSuperadminUser } from "@/utils/auth/internal-access";
import { useToast } from "@/ui";

export function CommandPalette() {
  const { value: commandUI, patch: patchCommandUI } = useUIKey(
    UI_STATE_KEYS.COMMAND_PALETTE,
    UI_STATE_DEFAULTS.commandPalette,
  );
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const toast = useToast();
  const isSuperadmin = isSuperadminUser(user);

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        patchCommandUI({ open: !commandUI.open });
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandUI.open, patchCommandUI]);

  // Reset transient state when closed
  useEffect(() => {
    if (!commandUI.open && (commandUI.search || commandUI.stageFilter)) {
      patchCommandUI({ search: "", stageFilter: null });
    }
  }, [commandUI.open, commandUI.search, commandUI.stageFilter, patchCommandUI]);

  const close = useCallback(() => {
    patchCommandUI({ open: false, search: "", stageFilter: null });
  }, [patchCommandUI]);

  const activateDestination = useCallback(
    (dest: NavDestination) => {
      close();
      if (dest.coverageState === "existing") {
        if (dest.tabId) {
          const activation = TAB_ACTIVATION_BY_ROUTE[dest.route];
          if (activation) {
            dispatch(
              patchUIState({
                key: activation.uiKey,
                patch: { [activation.field]: dest.tabId },
              }),
            );
          }
        }
        router.push(dest.route);
        return;
      }
      const target = dest.fallbackRoute ?? dest.route;
      toast.info(
        `${dest.label} is planned. Landing on the closest existing surface.`,
        "Planned destination",
      );
      router.push(target);
    },
    [close, dispatch, router, toast],
  );

  const runQuickAction = useCallback(
    (action: NavQuickAction) => {
      close();
      if (action.vestaPrompt) {
        void openCopilotWithQuery(dispatch, pathname, action.vestaPrompt);
        return;
      }
      if (action.id === "add-deal") {
        toast.info("Opening pipeline with create-deal workflow.", "Add Deal");
      }
      if (action.id === "add-contact") {
        toast.info(
          "Opening contacts workspace to add a contact.",
          "Add Contact",
        );
      }
      if (action.route) {
        if (action.tabId) {
          const activation = TAB_ACTIVATION_BY_ROUTE[action.route];
          if (activation) {
            dispatch(
              patchUIState({
                key: activation.uiKey,
                patch: { [activation.field]: action.tabId },
              }),
            );
          }
        }
        router.push(action.route);
      }
    },
    [close, dispatch, pathname, router, toast],
  );

  const navigateToSuperadminDomain = useCallback(() => {
    close();
    if (typeof window !== "undefined") {
      window.location.href = buildAdminSuperadminUrl(window.location.host);
    }
  }, [close]);

  const view = resolvePaletteView(
    commandUI.search,
    commandUI.stageFilter ?? null,
  );
  const stageFilter = (commandUI.stageFilter ?? null) as NavStageId | null;

  const renderDestination = (dest: NavDestination) => {
    const badge = coverageBadge(dest.coverageState);
    return (
      <Command.Item
        key={dest.id}
        value={dest.id}
        keywords={[dest.label, ...destinationSearchKeywords(dest)]}
        onSelect={() => activateDestination(dest)}
        className="command-palette-item"
      >
        <Layers className="command-palette-item-icon" />
        <div className="command-palette-item-content">
          <span className="command-palette-item-title">{dest.label}</span>
          <span className="command-palette-item-subtitle">
            {dest.stage === "family-office"
              ? "Family Office & Principal"
              : NAV_STAGE_LABEL_BY_ID[dest.stage as NavStageId]}
          </span>
        </div>
        {badge && (
          <span
            className={`command-palette-badge command-palette-badge-${
              badge === "Future" ? "future" : "planned"
            }`}
          >
            {badge}
          </span>
        )}
      </Command.Item>
    );
  };

  const renderQuickActions = () => (
    <Command.Group heading="Quick actions" className="command-palette-group">
      {NAV_QUICK_ACTIONS.map((action) => (
        <Command.Item
          key={action.id}
          value={`action-${action.id}`}
          keywords={[action.label, ...action.keywords]}
          onSelect={() => runQuickAction(action)}
          className="command-palette-item"
        >
          <Sparkles className="command-palette-item-icon command-palette-item-icon-action" />
          <div className="command-palette-item-content">
            <span className="command-palette-item-title">{action.label}</span>
          </div>
        </Command.Item>
      ))}
    </Command.Group>
  );

  return (
    <Command.Dialog
      open={commandUI.open}
      onOpenChange={(nextOpen) =>
        patchCommandUI({
          open: nextOpen,
          search: nextOpen ? commandUI.search : "",
          stageFilter: nextOpen ? (commandUI.stageFilter ?? null) : null,
        })
      }
      label="Global Command Menu"
      className="command-palette"
    >
      <DialogTitle className="sr-only">Global Command Menu</DialogTitle>
      <DialogDescription className="sr-only">
        Browse GP workflow stages or search for pages, workflows, and actions.
      </DialogDescription>
      <div className="command-palette-header">
        <Search className="command-palette-icon" />
        <Command.Input
          value={commandUI.search}
          onValueChange={(nextValue) => patchCommandUI({ search: nextValue })}
          placeholder={
            view === "stage"
              ? `Search in ${stageFilter ? NAV_STAGE_LABEL_BY_ID[stageFilter] : ""}...`
              : "Search workflows, pages, and actions..."
          }
          className="command-palette-input"
        />
        <kbd className="command-palette-kbd">
          {typeof navigator !== "undefined" &&
          navigator.platform.toLowerCase().includes("mac")
            ? "⌘"
            : "Ctrl+"}
          K
        </kbd>
      </div>

      <Command.List className="command-palette-list">
        <Command.Empty className="command-palette-empty">
          <p>No results found.</p>
          <span>
            Try workflow language — &ldquo;capital call&rdquo;,
            &ldquo;DDQ&rdquo;, &ldquo;term sheet&rdquo;
          </span>
        </Command.Empty>

        {isSuperadmin ? (
          <Command.Group heading="Pages" className="command-palette-group">
            <Command.Item
              value="superadmin"
              keywords={["internal", "tenant", "platform", "admin"]}
              onSelect={navigateToSuperadminDomain}
              className="command-palette-item"
            >
              <Building2 className="command-palette-item-icon" />
              <div className="command-palette-item-content">
                <span className="command-palette-item-title">
                  Superadmin Cockpit
                </span>
                <span className="command-palette-item-subtitle">
                  Tenant onboarding and platform operations
                </span>
              </div>
            </Command.Item>
          </Command.Group>
        ) : (
          <>
            {view === "root" && (
              <>
                <Command.Group
                  heading="Workflow stages"
                  className="command-palette-group"
                >
                  {NAV_STAGES.map((stage) => (
                    <Command.Item
                      key={stage.id}
                      value={`stage-${stage.id}`}
                      keywords={[stage.label, stage.description]}
                      onSelect={() => patchCommandUI({ stageFilter: stage.id })}
                      className="command-palette-item"
                      data-testid="palette-stage"
                    >
                      <Layers className="command-palette-item-icon" />
                      <div className="command-palette-item-content">
                        <span className="command-palette-item-title">
                          {stage.label}
                        </span>
                        <span className="command-palette-item-subtitle">
                          {stage.description}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
                {renderQuickActions()}
              </>
            )}

            {view === "stage" && stageFilter && (
              <Command.Group
                heading={NAV_STAGE_LABEL_BY_ID[stageFilter]}
                className="command-palette-group"
              >
                <Command.Item
                  value="back-to-stages"
                  onSelect={() => patchCommandUI({ stageFilter: null })}
                  className="command-palette-item"
                >
                  <ArrowLeft className="command-palette-item-icon" />
                  <div className="command-palette-item-content">
                    <span className="command-palette-item-title">
                      ← All stages
                    </span>
                  </div>
                </Command.Item>
                {destinationsForStage(stageFilter, user?.role).map(
                  renderDestination,
                )}
              </Command.Group>
            )}

            {view === "search" && (
              <>
                <Command.Group
                  heading="Destinations"
                  className="command-palette-group"
                >
                  {searchableDestinations(user?.role).map(renderDestination)}
                </Command.Group>
                {renderQuickActions()}
              </>
            )}
          </>
        )}
      </Command.List>

      <div className="command-palette-footer">
        <div className="command-palette-footer-hint">
          <kbd>↑↓</kbd> Navigate
          <kbd>Enter</kbd> Select
          <kbd>Esc</kbd> Close
        </div>
      </div>
    </Command.Dialog>
  );
}
