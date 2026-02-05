'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { areSagasActive, ensureSagas } from '@/store/sagaManager';
import { getSagaKeysForPath } from '@/store/route-sagas';
import { useAuth } from '@/contexts/auth-context';

type UseRouteSagasOptions = {
  enabled?: boolean;
};

export function useRouteSagas(options: UseRouteSagasOptions = {}) {
  const { enabled = true } = options;
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { hydrated, isAuthenticated } = useAuth();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let active = true;

    if (!enabled || !hydrated || !isAuthenticated) {
      ensureSagas([]);
      return () => {
        active = false;
      };
    }

    const keys = getSagaKeysForPath(pathname);
    void (async () => {
      await ensureSagas(keys);
      if (active) {
        // Signal any sagas waiting on clientMounted.
        dispatch(clientMounted());
        forceUpdate((tick) => tick + 1);
      }
    })();

    return () => {
      active = false;
    };
  }, [pathname, hydrated, isAuthenticated, enabled, dispatch]);

  if (!enabled || !hydrated || !isAuthenticated) return true;
  const keys = getSagaKeysForPath(pathname);
  return areSagasActive(keys);
}
