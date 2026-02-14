import { describe, expect, it } from 'vitest';
import {
  navigationReducer,
  navigationHydrated,
  setExpandedGroups,
  toggleGroup,
  updateBadge,
  setSidebarState,
  toggleLeftSidebar,
  toggleRightSidebar,
  navigationSelectors,
} from '../navigationSlice';
import type { RootState } from '@/store/rootReducer';

function asRootState(state: ReturnType<typeof navigationReducer>): RootState {
  return { navigation: state } as unknown as RootState;
}

describe('navigationSlice', () => {
  it('returns expected initial state', () => {
    const state = navigationReducer(undefined, { type: '@@INIT' });
    expect(state.hydrated).toBe(false);
    expect(state.expandedGroups).toEqual(['core-operations']);
    expect(state.badges).toEqual({});
    expect(state.sidebarState.leftCollapsed).toBe(false);
    expect(state.sidebarState.rightCollapsed).toBe(false);
  });

  it('hydrates navigation and keeps core group expanded', () => {
    const state = navigationReducer(
      undefined,
      navigationHydrated({
        expandedGroups: ['deal-management', 'core-operations'],
        sidebarState: { leftCollapsed: true, rightCollapsed: false },
      })
    );
    expect(state.hydrated).toBe(true);
    expect(state.expandedGroups).toEqual(['core-operations', 'deal-management']);
    expect(state.sidebarState).toEqual({ leftCollapsed: true, rightCollapsed: false });
  });

  it('sets and toggles expanded groups correctly', () => {
    let state = navigationReducer(undefined, setExpandedGroups(['utilities', 'core-operations']));
    expect(state.expandedGroups).toEqual(['core-operations', 'utilities']);

    state = navigationReducer(state, toggleGroup('utilities'));
    expect(state.expandedGroups).toEqual(['core-operations']);

    state = navigationReducer(state, toggleGroup('deal-management'));
    expect(state.expandedGroups).toEqual(['core-operations', 'deal-management']);

    state = navigationReducer(state, toggleGroup('core-operations'));
    expect(state.expandedGroups).toEqual(['core-operations', 'deal-management']);
  });

  it('updates and removes badges', () => {
    let state = navigationReducer(
      undefined,
      updateBadge({
        itemId: 'notifications',
        badge: { count: 3, variant: 'warning', tooltip: 'Needs review' },
      })
    );
    expect(state.badges.notifications?.count).toBe(3);

    state = navigationReducer(state, updateBadge({ itemId: 'notifications', badge: null }));
    expect(state.badges.notifications).toBeUndefined();
  });

  it('updates sidebar state and toggles both panes', () => {
    let state = navigationReducer(
      undefined,
      setSidebarState({ leftCollapsed: true, rightCollapsed: true })
    );
    expect(state.sidebarState).toEqual({ leftCollapsed: true, rightCollapsed: true });

    state = navigationReducer(state, toggleLeftSidebar());
    state = navigationReducer(state, toggleRightSidebar());
    expect(state.sidebarState).toEqual({ leftCollapsed: false, rightCollapsed: false });
  });

  it('selector suite resolves expected values', () => {
    const state = navigationReducer(
      undefined,
      navigationHydrated({
        expandedGroups: ['deal-management'],
        sidebarState: { leftCollapsed: true, rightCollapsed: false },
      })
    );
    const root = asRootState(state);
    expect(navigationSelectors.selectHydrated(root)).toBe(true);
    expect(navigationSelectors.selectExpandedGroups(root)).toEqual(['core-operations', 'deal-management']);
    expect(navigationSelectors.selectBadges(root)).toEqual({});
    expect(navigationSelectors.selectSidebarState(root)).toEqual({ leftCollapsed: true, rightCollapsed: false });
    expect(navigationSelectors.selectIsLeftCollapsed(root)).toBe(true);
    expect(navigationSelectors.selectIsRightCollapsed(root)).toBe(false);
  });
});
