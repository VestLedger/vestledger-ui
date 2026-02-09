import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getTestUser } from '../helpers/auth-helpers';

const storageStatePath = path.resolve(__dirname, '..', '.auth', 'storageState.json');

test('authenticate once for all tests', async ({ page, baseURL }) => {
  const { email, password } = getTestUser();
  const resolvedBaseURL = baseURL || process.env.BASE_URL || 'http://localhost:3000';
  const loginUrl = new URL('/login', resolvedBaseURL).toString();

  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('form');

  await page.locator('input[type="email"], input[type="text"]').first().fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');

  await page.context().storageState({ path: storageStatePath });
});
