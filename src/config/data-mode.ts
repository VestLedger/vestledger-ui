export type DataMode = 'mock' | 'api';

export function getDataMode(): DataMode {
  const raw = process.env.NEXT_PUBLIC_DATA_MODE?.toLowerCase();
  if (raw === 'api') return 'api';
  return 'mock';
}

export function isMockMode(): boolean {
  return getDataMode() === 'mock';
}

