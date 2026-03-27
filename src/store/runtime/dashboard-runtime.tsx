"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";
import { calculateBadges } from "@/services/ai/aiBadgesService";
import { loadFundsOperation } from "@/store/async/fundOperations";
import { authSelectors } from "@/store/slices/authSlice";
import { fundHydrated, fundUISelectors } from "@/store/slices/fundSlice";
import {
  navigationHydrated,
  navigationSelectors,
  setSidebarState,
  type SidebarState,
} from "@/store/slices/navigationSlice";
import { setUIState } from "@/store/slices/uiSlice";
import type { FundViewMode } from "@/types/fund";
import {
  UI_STATE_DEFAULTS,
  UI_STATE_KEYS,
} from "@/store/constants/uiStateKeys";

const NAVIGATION_STORAGE_KEY = "vestledger-nav-expanded-groups";
const SIDEBAR_LEFT_KEY = "vestledger-sidebar-left-collapsed";
const SIDEBAR_RIGHT_KEY = "vestledger-sidebar-right-collapsed";
const STORAGE_SELECTED_FUND_ID = "vestledger-selected-fund-id";
const STORAGE_FUND_VIEW_MODE = "vestledger-fund-view-mode";
const STORAGE_ARCHIVED_FUND_IDS = "vestledger-archived-fund-ids";
const STORAGE_VESTA_SHELL_KEY = UI_STATE_KEYS.VESTA_SHELL;

type PersistedVestaShellState = Pick<
  typeof UI_STATE_DEFAULTS.vestaShell,
  "ttsEnabled" | "voiceCaptureMode" | "vestaViewMode"
>;

type AbortableDispatch = {
  abort?: () => void;
};

function parseArchivedFundIds(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function readSidebarState(): SidebarState {
  return {
    leftCollapsed: safeLocalStorage.getItem(SIDEBAR_LEFT_KEY) === "true",
    rightCollapsed: safeLocalStorage.getItem(SIDEBAR_RIGHT_KEY) === "true",
  };
}

function readFundPreferences() {
  const rawFundId = safeLocalStorage.getItem(STORAGE_SELECTED_FUND_ID);
  const rawViewMode = safeLocalStorage.getItem(
    STORAGE_FUND_VIEW_MODE,
  ) as FundViewMode | null;
  const viewMode: FundViewMode =
    rawViewMode === "individual" ||
    rawViewMode === "consolidated" ||
    rawViewMode === "comparison"
      ? rawViewMode
      : "consolidated";
  const selectedFundId =
    viewMode === "consolidated" || rawFundId === null || rawFundId === "null"
      ? null
      : rawFundId;

  return {
    selectedFundId,
    viewMode,
    archivedFundIds: parseArchivedFundIds(
      safeLocalStorage.getItem(STORAGE_ARCHIVED_FUND_IDS),
    ),
  };
}

function buildPersistedVestaShellState(
  state?: Partial<typeof UI_STATE_DEFAULTS.vestaShell> | null,
): PersistedVestaShellState {
  return {
    vestaViewMode:
      state?.vestaViewMode === "collapsed" ||
      state?.vestaViewMode === "fullscreen"
        ? state.vestaViewMode
        : UI_STATE_DEFAULTS.vestaShell.vestaViewMode,
    ttsEnabled:
      typeof state?.ttsEnabled === "boolean"
        ? state.ttsEnabled
        : UI_STATE_DEFAULTS.vestaShell.ttsEnabled,
    voiceCaptureMode:
      state?.voiceCaptureMode === "hold"
        ? "hold"
        : UI_STATE_DEFAULTS.vestaShell.voiceCaptureMode,
  };
}

function readVestaShellPreferences(): PersistedVestaShellState {
  return buildPersistedVestaShellState(
    safeLocalStorage.getJSON<Partial<PersistedVestaShellState>>(
      STORAGE_VESTA_SHELL_KEY,
    ),
  );
}

export function DashboardRuntime() {
  const dispatch = useAppDispatch();
  const navigationHydratedState = useAppSelector(
    navigationSelectors.selectHydrated,
  );
  const expandedGroups = useAppSelector(
    navigationSelectors.selectExpandedGroups,
  );
  const sidebarState = useAppSelector(navigationSelectors.selectSidebarState);
  const fundHydratedState = useAppSelector(fundUISelectors.selectHydrated);
  const selectedFundId = useAppSelector(fundUISelectors.selectSelectedFundId);
  const viewMode = useAppSelector(fundUISelectors.selectViewMode);
  const archivedFundIds = useAppSelector(fundUISelectors.selectArchivedFundIds);
  const vestaShellState = useAppSelector(
    (state) =>
      state.ui.byKey[UI_STATE_KEYS.VESTA_SHELL] as
        | Partial<typeof UI_STATE_DEFAULTS.vestaShell>
        | undefined,
  );
  const authHydrated = useAppSelector(authSelectors.selectHydrated);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);
  const accessToken = useAppSelector(authSelectors.selectAccessToken);
  const persistedExpandedGroups = useMemo(
    () => expandedGroups.filter((groupId) => groupId !== "core-operations"),
    [expandedGroups],
  );
  const latestFundsRequestRef = useRef<AbortableDispatch | null>(null);
  const loadedSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (navigationHydratedState) return;

    dispatch(
      navigationHydrated({
        expandedGroups:
          safeLocalStorage.getJSON<string[]>(NAVIGATION_STORAGE_KEY) ?? [],
        sidebarState: readSidebarState(),
      }),
    );
  }, [dispatch, navigationHydratedState]);

  useEffect(() => {
    if (fundHydratedState) return;
    dispatch(fundHydrated(readFundPreferences()));
  }, [dispatch, fundHydratedState]);

  useEffect(() => {
    if (vestaShellState !== undefined) return;

    dispatch(
      setUIState({
        key: UI_STATE_KEYS.VESTA_SHELL,
        value: {
          ...UI_STATE_DEFAULTS.vestaShell,
          ...readVestaShellPreferences(),
        },
      }),
    );
  }, [dispatch, vestaShellState]);

  useEffect(() => {
    if (!navigationHydratedState) return undefined;

    const timeoutId = window.setTimeout(() => {
      safeLocalStorage.setJSON(NAVIGATION_STORAGE_KEY, persistedExpandedGroups);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [navigationHydratedState, persistedExpandedGroups]);

  useEffect(() => {
    if (!navigationHydratedState) return undefined;

    const timeoutId = window.setTimeout(() => {
      safeLocalStorage.setItem(
        SIDEBAR_LEFT_KEY,
        String(sidebarState.leftCollapsed),
      );
      safeLocalStorage.setItem(
        SIDEBAR_RIGHT_KEY,
        String(sidebarState.rightCollapsed),
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [
    navigationHydratedState,
    sidebarState.leftCollapsed,
    sidebarState.rightCollapsed,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncResponsiveSidebarState = () => {
      if (window.innerWidth >= 1080) return;
      if (sidebarState.leftCollapsed && sidebarState.rightCollapsed) return;
      dispatch(setSidebarState({ leftCollapsed: true, rightCollapsed: true }));
    };

    syncResponsiveSidebarState();
    window.addEventListener("resize", syncResponsiveSidebarState);

    return () => {
      window.removeEventListener("resize", syncResponsiveSidebarState);
    };
  }, [dispatch, sidebarState.leftCollapsed, sidebarState.rightCollapsed]);

  useEffect(() => {
    if (!fundHydratedState) return undefined;

    const timeoutId = window.setTimeout(() => {
      safeLocalStorage.setItem(
        STORAGE_SELECTED_FUND_ID,
        selectedFundId === null ? "null" : selectedFundId,
      );
      safeLocalStorage.setItem(STORAGE_FUND_VIEW_MODE, viewMode);
      safeLocalStorage.setItem(
        STORAGE_ARCHIVED_FUND_IDS,
        JSON.stringify(archivedFundIds),
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [archivedFundIds, fundHydratedState, selectedFundId, viewMode]);

  useEffect(() => {
    if (!vestaShellState) return undefined;

    const timeoutId = window.setTimeout(() => {
      safeLocalStorage.setJSON(
        STORAGE_VESTA_SHELL_KEY,
        buildPersistedVestaShellState(vestaShellState),
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [vestaShellState]);

  useEffect(() => {
    if (!authHydrated || !fundHydratedState) return undefined;

    if (!isAuthenticated) {
      loadedSessionKeyRef.current = null;
      latestFundsRequestRef.current?.abort?.();
      latestFundsRequestRef.current = null;
      return undefined;
    }

    const sessionKey = accessToken ?? "authenticated";
    if (loadedSessionKeyRef.current === sessionKey) {
      return undefined;
    }

    loadedSessionKeyRef.current = sessionKey;
    latestFundsRequestRef.current?.abort?.();
    latestFundsRequestRef.current = dispatch(
      loadFundsOperation({}),
    ) as AbortableDispatch;

    return () => {
      latestFundsRequestRef.current?.abort?.();
      latestFundsRequestRef.current = null;
    };
  }, [accessToken, authHydrated, dispatch, fundHydratedState, isAuthenticated]);

  useEffect(() => {
    let active = true;

    const refreshBadges = async () => {
      const badges = await calculateBadges();
      if (!active) return;
      dispatch(setUIState({ key: "ai-badges", value: badges }));
    };

    void refreshBadges();
    const intervalId = window.setInterval(() => {
      void refreshBadges();
    }, 60000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [dispatch]);

  return null;
}
