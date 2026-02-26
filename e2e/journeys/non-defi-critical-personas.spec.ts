import { expect, test, loginViaRedirect } from '../fixtures/auth.fixture';

type PersonaRoute = {
  role: 'gp' | 'analyst' | 'ops' | 'ir' | 'researcher' | 'lp' | 'auditor';
  defaultPath: string;
};

const CRITICAL_PERSONA_ROUTES: PersonaRoute[] = [
  { role: 'gp', defaultPath: '/home' },
  { role: 'analyst', defaultPath: '/pipeline' },
  { role: 'ops', defaultPath: '/fund-admin' },
  { role: 'ir', defaultPath: '/lp-management' },
  { role: 'researcher', defaultPath: '/reports' },
  { role: 'lp', defaultPath: '/lp-portal' },
  { role: 'auditor', defaultPath: '/compliance' },
];

test.describe('Non-DeFi Critical Persona Journeys @critical', () => {
  test.describe.configure({ mode: 'serial' });

  for (const persona of CRITICAL_PERSONA_ROUTES) {
    test(`${persona.role} reaches default route shell`, async ({ page }) => {
      await loginViaRedirect(page, persona.defaultPath, {
        role: persona.role,
        waitForLoadState: 'domcontentloaded',
      });

      await expect.poll(() => new URL(page.url()).pathname).toBe(persona.defaultPath);
      await expect(page.locator('main')).toBeVisible();

      const hasFatalError = await page
        .getByRole('heading', { name: /something went wrong|page not found/i })
        .isVisible()
        .catch(() => false);
      expect(hasFatalError).toBeFalsy();
    });
  }

  test('lp persona cannot access fund-admin route', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin', {
      role: 'lp',
      waitForLoadState: 'domcontentloaded',
    });
    await expect.poll(() => new URL(page.url()).pathname).toBe('/lp-portal');
  });

  test('analyst persona cannot access tax center route', async ({ page }) => {
    await loginViaRedirect(page, '/tax-center', {
      role: 'analyst',
      waitForLoadState: 'domcontentloaded',
    });
    await expect.poll(() => new URL(page.url()).pathname).toBe('/pipeline');
  });

  test('auditor persona cannot access deal intelligence route', async ({ page }) => {
    await loginViaRedirect(page, '/deal-intelligence', {
      role: 'auditor',
      waitForLoadState: 'domcontentloaded',
    });
    await expect.poll(() => new URL(page.url()).pathname).toBe('/compliance');
  });
});
