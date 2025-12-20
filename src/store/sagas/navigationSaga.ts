import { eventChannel } from 'redux-saga';
import { all, call, delay, put, race, select, take, takeLatest } from 'redux-saga/effects';
import type { RootState } from '@/store/rootReducer';
import {
  navigationHydrated,
  setExpandedGroups,
  setSidebarState,
  toggleGroup,
  toggleLeftSidebar,
  toggleRightSidebar,
  type SidebarState,
} from '@/store/slices/navigationSlice';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';

const STORAGE_KEY = 'vestledger-nav-expanded-groups';
const SIDEBAR_LEFT_KEY = 'vestledger-sidebar-left-collapsed';
const SIDEBAR_RIGHT_KEY = 'vestledger-sidebar-right-collapsed';

function* hydrateNavigationWorker() {
  const expandedGroups = safeLocalStorage.getJSON<string[]>(STORAGE_KEY) || [];
  const leftCollapsed = safeLocalStorage.getItem(SIDEBAR_LEFT_KEY) === 'true';
  const rightCollapsed = safeLocalStorage.getItem(SIDEBAR_RIGHT_KEY) === 'true';

  yield put(
    navigationHydrated({
      expandedGroups,
      sidebarState: { leftCollapsed, rightCollapsed },
    })
  );
}

function* persistExpandedGroupsWorker() {
  yield delay(300);
  const expandedGroups: string[] = yield select((state: RootState) => state.navigation.expandedGroups);
  const toStore = expandedGroups.filter((g) => g !== 'core-operations');
  safeLocalStorage.setJSON(STORAGE_KEY, toStore);
}

function* persistSidebarStateWorker() {
  yield delay(300);
  const sidebarState: SidebarState = yield select((state: RootState) => state.navigation.sidebarState);
  safeLocalStorage.setItem(SIDEBAR_LEFT_KEY, String(sidebarState.leftCollapsed));
  safeLocalStorage.setItem(SIDEBAR_RIGHT_KEY, String(sidebarState.rightCollapsed));
}

function createResizeChannel() {
  return eventChannel<number>((emit) => {
    if (typeof window === 'undefined') {
      emit(0);
      return () => {};
    }

    const handler = () => emit(window.innerWidth);
    window.addEventListener('resize', handler);
    handler();

    return () => window.removeEventListener('resize', handler);
  });
}

function* watchResizeWorker() {
  if (typeof window === 'undefined') return;

  const chan: ReturnType<typeof createResizeChannel> = yield call(createResizeChannel);
  try {
    while (true) {
      const width: number = yield take(chan);
      if (width > 0 && width < 1080) {
        yield put(setSidebarState({ leftCollapsed: true, rightCollapsed: true }));
      }
    }
  } finally {
    chan.close();
  }
}

export function* navigationSaga() {
  if (typeof window !== 'undefined') {
    // Wait for clientMounted with a 5 second timeout fallback
    yield race({
      mounted: take(clientMounted.type),
      timeout: delay(5000),
    });
  }
  yield all([
    call(hydrateNavigationWorker),
    call(watchResizeWorker),
    takeLatest([toggleGroup.type, setExpandedGroups.type], persistExpandedGroupsWorker),
    takeLatest([toggleLeftSidebar.type, toggleRightSidebar.type, setSidebarState.type], persistSidebarStateWorker),
  ]);
}
