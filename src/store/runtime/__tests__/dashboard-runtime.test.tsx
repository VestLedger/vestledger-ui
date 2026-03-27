import { act, render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardRuntime } from "../dashboard-runtime";
import { rootReducer } from "@/store/rootReducer";
import {
  UI_STATE_DEFAULTS,
  UI_STATE_KEYS,
} from "@/store/constants/uiStateKeys";
import { setUIState } from "@/store/slices/uiSlice";

vi.mock("@/services/ai/aiBadgesService", () => ({
  calculateBadges: vi.fn().mockResolvedValue({}),
}));

function createStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
}

function renderRuntime() {
  const store = createStore();

  return {
    store,
    ...render(
      <Provider store={store}>
        <DashboardRuntime />
      </Provider>,
    ),
  };
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("DashboardRuntime", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hydrates persisted Vesta shell preferences on load", async () => {
    window.localStorage.setItem(
      UI_STATE_KEYS.VESTA_SHELL,
      JSON.stringify({
        vestaViewMode: "fullscreen",
        ttsEnabled: true,
        voiceCaptureMode: "hold",
      }),
    );

    const view = renderRuntime();

    await flushEffects();

    expect(
      view.store.getState().ui.byKey[UI_STATE_KEYS.VESTA_SHELL],
    ).toMatchObject({
      ...UI_STATE_DEFAULTS.vestaShell,
      vestaViewMode: "fullscreen",
      ttsEnabled: true,
      voiceCaptureMode: "hold",
    });
  });

  it("persists durable Vesta shell preferences without ephemeral session state", async () => {
    vi.useFakeTimers();
    const view = renderRuntime();

    await flushEffects();

    expect(
      view.store.getState().ui.byKey[UI_STATE_KEYS.VESTA_SHELL],
    ).toBeDefined();

    act(() => {
      view.store.dispatch(
        setUIState({
          key: UI_STATE_KEYS.VESTA_SHELL,
          value: {
            ...UI_STATE_DEFAULTS.vestaShell,
            vestaViewMode: "collapsed",
            ttsEnabled: true,
            voiceCaptureMode: "hold",
            voiceCaptureRequestNonce: 8,
            activeThreadContext: {
              contextType: "route-tab",
              contextId: "/pipeline:watchlist",
            },
          },
        }),
      );
    });

    await flushEffects();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(
      JSON.parse(
        window.localStorage.getItem(UI_STATE_KEYS.VESTA_SHELL) ?? "null",
      ),
    ).toEqual({
      vestaViewMode: "collapsed",
      ttsEnabled: true,
      voiceCaptureMode: "hold",
    });
  });
});
