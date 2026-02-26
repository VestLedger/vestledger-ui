'use client';

import type { Saga } from 'redux-saga';
import type { Task } from 'redux-saga';
import { sagaMiddleware } from '@/store/store';

type SagaLoader = () => Promise<{ saga: Saga }>;

const sagaLoaders = {
  alerts: () => import('./sagas/alertsSaga').then((mod) => ({ saga: mod.alertsSaga })),
  navigation: () => import('./sagas/navigationSaga').then((mod) => ({ saga: mod.navigationSaga })),
  fund: () => import('./sagas/fundSaga').then((mod) => ({ saga: mod.fundSaga })),
  search: () => import('./sagas/searchSaga').then((mod) => ({ saga: mod.searchSaga })),
  copilot: () => import('./sagas/copilotSaga').then((mod) => ({ saga: mod.copilotSaga })),
  uiEffects: () => import('./sagas/uiEffectsSaga').then((mod) => ({ saga: mod.uiEffectsSaga })),
  documents: () => import('./sagas/documentsSaga').then((mod) => ({ saga: mod.documentsSaga })),
  portfolio: () => import('./sagas/portfolioSaga').then((mod) => ({ saga: mod.portfolioSaga })),
  pipeline: () => import('./sagas/pipelineSaga').then((mod) => ({ saga: mod.pipelineSaga })),
  dashboards: () => import('./sagas/dashboardsSaga').then((mod) => ({ saga: mod.dashboardsSaga })),
  dealflow: () => import('./sagas/dealflowSaga').then((mod) => ({ saga: mod.dealflowSaga })),
  backOffice: () => import('./sagas/backOfficeSaga').then((mod) => ({ saga: mod.backOfficeSaga })),
  ai: () => import('./sagas/aiSaga').then((mod) => ({ saga: mod.aiSaga })),
  dealIntelligence: () =>
    import('./sagas/dealIntelligenceSaga').then((mod) => ({ saga: mod.dealIntelligenceSaga })),
  crm: () => import('./sagas/crmSaga').then((mod) => ({ saga: mod.crmSaga })),
  misc: () => import('./sagas/miscSaga').then((mod) => ({ saga: mod.miscSaga })),
  waterfall: () => import('./sagas/waterfallSaga').then((mod) => ({ saga: mod.waterfallSaga })),
  distribution: () =>
    import('./sagas/distributionSaga').then((mod) => ({ saga: mod.distributionSaga })),
  fundAdminOps: () =>
    import('./sagas/fundAdminOpsSaga').then((mod) => ({ saga: mod.fundAdminOpsSaga })),
  analytics: () =>
    import('./sagas/analyticsSaga').then((mod) => ({ saga: mod.analyticsSaga })),
} satisfies Record<string, SagaLoader>;

export type SagaKey = keyof typeof sagaLoaders;

const tasks = new Map<SagaKey, Task>();
let desiredKeys = new Set<SagaKey>();

async function runSagaOnce(key: SagaKey) {
  if (tasks.has(key)) return;
  if (!desiredKeys.has(key)) return;
  const loader = sagaLoaders[key];
  if (!loader) return;
  const { saga } = await loader();
  if (tasks.has(key)) return;
  if (!desiredKeys.has(key)) return;
  const task = sagaMiddleware.run(saga);
  tasks.set(key, task);
}

export function cancelSaga(key: SagaKey) {
  const task = tasks.get(key);
  if (!task) return;
  task.cancel();
  tasks.delete(key);
}

export async function ensureSagas(keys: SagaKey[]) {
  if (typeof window === 'undefined') return;
  desiredKeys = new Set(keys);

  tasks.forEach((_task, key) => {
    if (!desiredKeys.has(key)) {
      cancelSaga(key);
    }
  });

  await Promise.all(keys.map((key) => runSagaOnce(key)));
}

export function areSagasActive(keys: SagaKey[]): boolean {
  if (keys.length === 0) return true;
  return keys.every((key) => tasks.has(key));
}

export function getActiveSagas(): SagaKey[] {
  return Array.from(tasks.keys());
}
