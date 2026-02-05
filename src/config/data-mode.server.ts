import { cookies } from 'next/headers';
import { DATA_MODE_OVERRIDE_KEY, getDataMode, isMockMode, parseDataMode, type DataMode, type FeatureName } from './data-mode';

function getServerOverride(): DataMode | null {
  const raw = cookies().get(DATA_MODE_OVERRIDE_KEY)?.value;
  return parseDataMode(raw);
}

export function getServerDataMode(): DataMode {
  const override = getServerOverride();
  if (override) return override;
  return getDataMode();
}

export function isServerMockMode(feature?: FeatureName): boolean {
  const override = getServerOverride();
  if (override) return override === 'mock';
  return isMockMode(feature);
}
