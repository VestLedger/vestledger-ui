import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getTestUser } from '../helpers/auth-helpers';

const storageStatePath = path.resolve(__dirname, '..', '.auth', 'storageState.json');
const AUTH_STORAGE_KEY = 'isAuthenticated';
const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'accessToken';
const DATA_MODE_OVERRIDE_KEY = 'dataModeOverride';

test('authenticate once for all tests', async ({ baseURL }) => {
  const { email } = getTestUser();
  const resolvedBaseURL = baseURL || process.env.BASE_URL || 'http://localhost:3000';
  const baseUrl = new URL(resolvedBaseURL);
  const origin = baseUrl.origin;
  const domain = baseUrl.hostname;
  const secure = baseUrl.protocol === 'https:';
  const expires = Math.floor(Date.now() / 1000) + 86400;
  const user = {
    name: 'Playwright Test User',
    email,
    role: 'gp',
  };
  const accessToken = 'mock-token';

  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  const storageState = {
    cookies: [
      {
        name: AUTH_STORAGE_KEY,
        value: 'true',
        domain,
        path: '/',
        expires,
        httpOnly: false,
        secure,
        sameSite: 'Lax' as const,
      },
      {
        name: 'user',
        value: encodeURIComponent(JSON.stringify(user)),
        domain,
        path: '/',
        expires,
        httpOnly: false,
        secure,
        sameSite: 'Lax' as const,
      },
      {
        name: DATA_MODE_OVERRIDE_KEY,
        value: 'mock',
        domain,
        path: '/',
        expires,
        httpOnly: false,
        secure,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [
      {
        origin,
        localStorage: [
          { name: AUTH_STORAGE_KEY, value: 'true' },
          { name: USER_STORAGE_KEY, value: JSON.stringify(user) },
          { name: TOKEN_STORAGE_KEY, value: accessToken },
          { name: DATA_MODE_OVERRIDE_KEY, value: 'mock' },
        ],
      },
    ],
  };

  fs.writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2), 'utf-8');
});
