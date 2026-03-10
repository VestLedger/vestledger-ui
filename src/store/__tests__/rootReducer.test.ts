import { describe, expect, it } from "vitest";
import { rootReducer } from "../rootReducer";
import { loggedOut, loginSucceeded } from "../slices/authSlice";
import { setUIState } from "../slices/uiSlice";
import { navigationHydrated } from "../slices/navigationSlice";
import { searchLoaded } from "../slices/searchSlice";
import { fundsLoaded } from "../slices/fundSlice";
import type { Fund } from "@/types/fund";
import type { User } from "@/types/auth";

const mockUser: User = {
  id: "user-1",
  name: "Test User",
  email: "user@example.com",
  role: "gp",
};

const mockFund: Fund = {
  id: "fund-1",
  name: "Fund I",
  displayName: "Fund I",
  fundNumber: 1,
  status: "active",
  strategy: "early-stage",
  totalCommitment: 100000000,
  deployedCapital: 50000000,
  availableCapital: 50000000,
  vintage: 2024,
  startDate: "2024-01-01",
  fundTerm: 10,
  portfolioCount: 8,
  activeDeals: 3,
  totalInvestments: 25000000,
  portfolioValue: 30000000,
  irr: 12.5,
  tvpi: 1.3,
  dpi: 0.2,
  minInvestment: 100000,
  maxInvestment: 5000000,
  targetSectors: ["AI"],
  targetStages: ["Seed"],
  managers: ["Test User"],
  createdAt: "2024-01-01",
  updatedAt: "2026-03-01",
};

describe("rootReducer", () => {
  it("clears route-owned async slices on logout while preserving shell state", () => {
    let state = rootReducer(undefined, { type: "@@INIT" });
    state = rootReducer(
      state,
      loginSucceeded({ user: mockUser, accessToken: "token-1" }),
    );
    state = rootReducer(
      state,
      navigationHydrated({
        expandedGroups: ["funds"],
        sidebarState: { leftCollapsed: true, rightCollapsed: false },
      }),
    );
    state = rootReducer(
      state,
      setUIState({ key: "dashboard-density", value: { mode: "compact" } }),
    );
    state = rootReducer(
      state,
      searchLoaded({
        query: "fund",
        results: [],
      }),
    );
    state = rootReducer(state, fundsLoaded({ funds: [mockFund] }));

    const nextState = rootReducer(state, loggedOut());

    expect(nextState.auth.isAuthenticated).toBe(false);
    expect(nextState.navigation).toEqual(state.navigation);
    expect(nextState.ui).toEqual(state.ui);
    expect(nextState.search.status).toBe("idle");
    expect(nextState.search.data).toBeNull();
    expect(nextState.fund.data).toBeNull();
    expect(nextState.copilot.messages).toHaveLength(1);
  });
});
