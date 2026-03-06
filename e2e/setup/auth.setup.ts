import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createApiStorageState, getTestUser } from '../helpers/auth-helpers';

const storageStatePath = path.resolve(__dirname, '..', '.auth', 'storageState.json');

test('authenticate once for all tests', async ({ baseURL }) => {
  const resolvedBaseURL = baseURL || process.env.APP_BASE_URL || process.env.BASE_URL;
  if (!resolvedBaseURL) {
    throw new Error('Missing base URL. Set APP_BASE_URL or BASE_URL in config/environment.');
  }

  const credentials = getTestUser();
  const appOrigin = new URL(resolvedBaseURL).origin;
  const storageState = await createApiStorageState(appOrigin, credentials);
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  fs.writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2), 'utf-8');
});
