import { describe, it, expect } from 'vitest';
import {
  uiReducer,
  setUIState,
  patchUIState,
  clearUIState,
  uiSelectors,
} from '../uiSlice';
import type { RootState } from '@/store/rootReducer';

describe('uiSlice', () => {
  const initialState = {
    byKey: {},
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = uiReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual(initialState);
    });

    it('should have empty byKey object initially', () => {
      const state = uiReducer(undefined, { type: '@@INIT' });
      expect(state.byKey).toEqual({});
    });
  });

  describe('setUIState', () => {
    it('should set a new key-value pair', () => {
      const state = uiReducer(
        initialState,
        setUIState({ key: 'sidebar', value: { collapsed: true } })
      );
      expect(state.byKey['sidebar']).toEqual({ collapsed: true });
    });

    it('should overwrite existing value', () => {
      const stateWithValue = {
        byKey: { sidebar: { collapsed: false } },
      };
      const state = uiReducer(
        stateWithValue,
        setUIState({ key: 'sidebar', value: { collapsed: true } })
      );
      expect(state.byKey['sidebar']).toEqual({ collapsed: true });
    });

    it('should handle primitive values', () => {
      const state = uiReducer(
        initialState,
        setUIState({ key: 'counter', value: 42 })
      );
      expect(state.byKey['counter']).toBe(42);
    });

    it('should handle array values', () => {
      const state = uiReducer(
        initialState,
        setUIState({ key: 'selectedIds', value: [1, 2, 3] })
      );
      expect(state.byKey['selectedIds']).toEqual([1, 2, 3]);
    });

    it('should handle null value', () => {
      const state = uiReducer(
        initialState,
        setUIState({ key: 'modal', value: null })
      );
      expect(state.byKey['modal']).toBeNull();
    });
  });

  describe('patchUIState', () => {
    it('should merge patch with existing object', () => {
      const stateWithValue = {
        byKey: { sidebar: { collapsed: false, width: 250 } },
      };
      const state = uiReducer(
        stateWithValue,
        patchUIState({ key: 'sidebar', patch: { collapsed: true } })
      );
      expect(state.byKey['sidebar']).toEqual({ collapsed: true, width: 250 });
    });

    it('should create new object if key does not exist', () => {
      const state = uiReducer(
        initialState,
        patchUIState({ key: 'newKey', patch: { value: 'test' } })
      );
      expect(state.byKey['newKey']).toEqual({ value: 'test' });
    });

    it('should replace non-object value with patch', () => {
      const stateWithPrimitive = {
        byKey: { counter: 42 },
      };
      const state = uiReducer(
        stateWithPrimitive,
        patchUIState({ key: 'counter', patch: { value: 100 } })
      );
      expect(state.byKey['counter']).toEqual({ value: 100 });
    });

    it('should replace array value with patch', () => {
      const stateWithArray = {
        byKey: { items: [1, 2, 3] },
      };
      const state = uiReducer(
        stateWithArray,
        patchUIState({ key: 'items', patch: { list: [4, 5, 6] } })
      );
      expect(state.byKey['items']).toEqual({ list: [4, 5, 6] });
    });

    it('should handle deep patches', () => {
      const stateWithValue = {
        byKey: { settings: { theme: 'dark', notifications: true } },
      };
      const state = uiReducer(
        stateWithValue,
        patchUIState({
          key: 'settings',
          patch: { notifications: false, sound: true },
        })
      );
      expect(state.byKey['settings']).toEqual({
        theme: 'dark',
        notifications: false,
        sound: true,
      });
    });
  });

  describe('clearUIState', () => {
    it('should remove key from byKey', () => {
      const stateWithValue = {
        byKey: { sidebar: { collapsed: true } },
      };
      const state = uiReducer(stateWithValue, clearUIState({ key: 'sidebar' }));
      expect(state.byKey['sidebar']).toBeUndefined();
    });

    it('should not affect other keys', () => {
      const stateWithMultiple = {
        byKey: {
          sidebar: { collapsed: true },
          modal: { open: false },
        },
      };
      const state = uiReducer(
        stateWithMultiple,
        clearUIState({ key: 'sidebar' })
      );
      expect(state.byKey['sidebar']).toBeUndefined();
      expect(state.byKey['modal']).toEqual({ open: false });
    });

    it('should handle clearing non-existent key gracefully', () => {
      const state = uiReducer(
        initialState,
        clearUIState({ key: 'nonExistent' })
      );
      expect(state.byKey['nonExistent']).toBeUndefined();
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      ui: {
        byKey: {
          sidebar: { collapsed: true },
          theme: 'dark',
        },
      },
    } as unknown as RootState;

    it('selectByKey should return entire byKey object', () => {
      const result = uiSelectors.selectByKey(mockRootState);
      expect(result).toEqual({
        sidebar: { collapsed: true },
        theme: 'dark',
      });
    });

    it('selectUIState should return value for specific key', () => {
      const selectSidebar = uiSelectors.selectUIState('sidebar');
      const result = selectSidebar(mockRootState);
      expect(result).toEqual({ collapsed: true });
    });

    it('selectUIState should return undefined for non-existent key', () => {
      const selectNonExistent = uiSelectors.selectUIState('nonExistent');
      const result = selectNonExistent(mockRootState);
      expect(result).toBeUndefined();
    });
  });
});
