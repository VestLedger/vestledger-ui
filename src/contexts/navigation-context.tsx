'use client';

import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleGroup,
  toggleLeftSidebar,
  toggleRightSidebar,
  updateBadge,
  type NavigationBadge,
  type SidebarState,
} from '@/store/slices/navigationSlice';

interface NavigationContextType {
  expandedGroups: Set<string>;
  toggleGroup: (groupId: string) => void;
  badges: Record<string, NavigationBadge>;
  updateBadge: (itemId: string, badge: NavigationBadge | null) => void;
  sidebarState: SidebarState;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useNavigation(): NavigationContextType {
  const dispatch = useAppDispatch();
  const expandedGroupsArray = useAppSelector((state) => state.navigation.expandedGroups);
  const badges = useAppSelector((state) => state.navigation.badges);
  const sidebarState = useAppSelector((state) => state.navigation.sidebarState);

  const expandedGroups = useMemo(() => new Set(expandedGroupsArray), [expandedGroupsArray]);

  const onToggleGroup = useCallback<NavigationContextType['toggleGroup']>(
    (groupId) => {
      dispatch(toggleGroup(groupId));
    },
    [dispatch]
  );

  const onUpdateBadge = useCallback<NavigationContextType['updateBadge']>(
    (itemId, badge) => {
      dispatch(updateBadge({ itemId, badge }));
    },
    [dispatch]
  );

  const onToggleLeftSidebar = useCallback<NavigationContextType['toggleLeftSidebar']>(() => {
    dispatch(toggleLeftSidebar());
  }, [dispatch]);

  const onToggleRightSidebar = useCallback<NavigationContextType['toggleRightSidebar']>(() => {
    dispatch(toggleRightSidebar());
  }, [dispatch]);

  return {
    expandedGroups,
    toggleGroup: onToggleGroup,
    badges,
    updateBadge: onUpdateBadge,
    sidebarState,
    toggleLeftSidebar: onToggleLeftSidebar,
    toggleRightSidebar: onToggleRightSidebar,
  };
}

