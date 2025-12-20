import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';

export interface NavigationBadge {
  count: number;
  variant: 'danger' | 'warning' | 'info';
  tooltip?: string;
}

export interface SidebarState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

/**
 * Navigation slice - Pure UI state (no async operations)
 * Manages sidebar state, expanded groups, and navigation badges
 */
interface NavigationState {
  hydrated: boolean;
  expandedGroups: string[];
  badges: Record<string, NavigationBadge>;
  sidebarState: SidebarState;
}

const DEFAULT_EXPANDED = ['core-operations'];

const initialState: NavigationState = {
  hydrated: false,
  expandedGroups: DEFAULT_EXPANDED,
  badges: {},
  sidebarState: {
    leftCollapsed: false,
    rightCollapsed: false,
  },
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigationHydrated: (
      state,
      action: PayloadAction<{ expandedGroups: string[]; sidebarState: SidebarState }>
    ) => {
      state.hydrated = true;
      state.expandedGroups = Array.from(new Set([...DEFAULT_EXPANDED, ...action.payload.expandedGroups]));
      state.sidebarState = action.payload.sidebarState;
    },
    setExpandedGroups: (state, action: PayloadAction<string[]>) => {
      state.expandedGroups = Array.from(new Set([...DEFAULT_EXPANDED, ...action.payload]));
    },
    toggleGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      if (groupId === 'core-operations') return;

      if (state.expandedGroups.includes(groupId)) {
        state.expandedGroups = state.expandedGroups.filter((g) => g !== groupId);
      } else {
        state.expandedGroups = [...state.expandedGroups, groupId];
      }
    },
    updateBadge: (
      state,
      action: PayloadAction<{ itemId: string; badge: NavigationBadge | null }>
    ) => {
      const { itemId, badge } = action.payload;
      if (badge === null) {
        const { [itemId]: _, ...rest } = state.badges;
        state.badges = rest;
        return;
      }
      state.badges = {
        ...state.badges,
        [itemId]: badge,
      };
    },
    setSidebarState: (state, action: PayloadAction<SidebarState>) => {
      state.sidebarState = action.payload;
    },
    toggleLeftSidebar: (state) => {
      state.sidebarState.leftCollapsed = !state.sidebarState.leftCollapsed;
    },
    toggleRightSidebar: (state) => {
      state.sidebarState.rightCollapsed = !state.sidebarState.rightCollapsed;
    },
  },
});

export const {
  navigationHydrated,
  setExpandedGroups,
  toggleGroup,
  updateBadge,
  setSidebarState,
  toggleLeftSidebar,
  toggleRightSidebar,
} = navigationSlice.actions;

// Selectors
export const navigationSelectors = {
  selectHydrated: (state: RootState) => state.navigation.hydrated,
  selectExpandedGroups: (state: RootState) => state.navigation.expandedGroups,
  selectBadges: (state: RootState) => state.navigation.badges,
  selectSidebarState: (state: RootState) => state.navigation.sidebarState,
  selectIsLeftCollapsed: (state: RootState) => state.navigation.sidebarState.leftCollapsed,
  selectIsRightCollapsed: (state: RootState) => state.navigation.sidebarState.rightCollapsed,
};

export const navigationReducer = navigationSlice.reducer;
