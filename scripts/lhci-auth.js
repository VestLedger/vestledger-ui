const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('.lighthouseci', 'auth');
const LOG_PREFIX = '[LHCI Auth]';

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function attachDiagnostics(page) {
  if (page.__lhciDiagnosticsAttached) {
    return;
  }
  page.__lhciDiagnosticsAttached = true;

  page.on('console', (msg) => {
    const location = msg.location();
    const locationSuffix = location && location.url
      ? ` (${location.url}:${location.lineNumber || 0}:${location.columnNumber || 0})`
      : '';
    console.log(`${LOG_PREFIX} console.${msg.type()}: ${msg.text()}${locationSuffix}`);
  });

  page.on('pageerror', (error) => {
    console.error(`${LOG_PREFIX} pageerror:`, error);
  });

  page.on('requestfailed', (request) => {
    const failure = request.failure();
    console.warn(`${LOG_PREFIX} requestfailed: ${request.method()} ${request.url()} ${failure ? failure.errorText : ''}`);
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      console.warn(`${LOG_PREFIX} response ${response.status()}: ${response.url()}`);
    }
  });
}

async function captureSnapshot(page, name) {
  ensureOutputDir();
  const filePath = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`${LOG_PREFIX} screenshot saved: ${filePath}`);
}

module.exports = async (browser) => {
  const pages = await browser.pages();
  pages.forEach((page) => attachDiagnostics(page));
  browser.on('targetcreated', async (target) => {
    if (target.type() !== 'page') return;
    const page = await target.page();
    if (page) attachDiagnostics(page);
  });

  const page = await browser.newPage();
  attachDiagnostics(page);

  // Navigate to login page via localhost
  const response = await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  const status = response ? response.status() : 'no-response';
  console.log(`${LOG_PREFIX} login response status:`, status);
  await captureSnapshot(page, 'login');

  // Set authentication in localStorage
  await page.evaluate(() => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Lighthouse User',
        email: 'lighthouse@vestledger.local',
        role: 'gp',
      })
    );
  });

  // Set authentication cookies for middleware
  await page.setCookie({
    name: 'isAuthenticated',
    value: 'true',
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  });

  await page.setCookie({
    name: 'user',
    value: encodeURIComponent(JSON.stringify({
      name: 'Lighthouse User',
      email: 'lighthouse@vestledger.local',
      role: 'gp',
    })),
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  });

  const authState = await page.evaluate(() => ({
    isAuthenticated: localStorage.getItem('isAuthenticated'),
    user: localStorage.getItem('user'),
  }));
  console.log(`${LOG_PREFIX} auth state:`, authState);

  await page.close();
};
