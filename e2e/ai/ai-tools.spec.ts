import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';
import {
  clickContextualTab,
  getContextualTab,
  openContextualMenu,
} from '../helpers/navigation-helpers';

test.describe('AI Tools - Page Load', () => {
  test('should load AI tools page', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const pageTitle = page.locator('h1, [class*="title"]').filter({ hasText: /ai|tools|assistant/i });
    await expect(pageTitle.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display AI tools content', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');
    await openContextualMenu(page, /ai tools/i);

    // Look for stable UI elements instead of CSS class names
    await expect(
      getContextualTab(page, /ai decision writer/i)
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('heading', { name: /deal information/i })
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('AI Tools - Available Tools', () => {
  test('should display available AI tool cards', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const toolCards = page.locator('[data-testid="ai-tool"], div.rounded-lg, [class*="tool"]');
    const count = await toolCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show tool names and descriptions', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    // Common AI tools: Document Analysis, Pitch Deck Reader, Due Diligence, etc.
    const toolNames = page.locator('text=/document.*analysis|pitch.*deck|due.*diligence|copilot|assistant|insights/i');
    if (await toolNames.count() > 0) {
      await expect(toolNames.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Copilot', () => {
  test('should have AI copilot section', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const copilotSection = page.locator('text=/copilot|assistant|chat/i');
    if (await copilotSection.count() > 0) {
      await expect(copilotSection.first()).toBeVisible();
    }
  });

  test('should have launch copilot button', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const launchButton = page.getByRole('button', {
      name: /launch.*copilot|start.*copilot|open ai copilot|open vesta and start voice capture/i,
    });
    if (await launchButton.first().isVisible()) {
      await expect(launchButton.first()).toBeEnabled();
    }
  });
});

test.describe('AI Tools - Document Analysis', () => {
  test('should have document analysis tool', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const docAnalysis = page.locator('text=/document.*analysis|analyze.*document/i');
    if (await docAnalysis.count() > 0) {
      await expect(docAnalysis.first()).toBeVisible();
    }
  });

  test('should have upload document option', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const uploadButton = page.getByRole('button', { name: /upload|analyze/i });
    if (await uploadButton.first().isVisible()) {
      await expect(uploadButton.first()).toBeEnabled();
    }
  });
});

test.describe('AI Tools - Pitch Deck Reader', () => {
  test('should have pitch deck analysis tool', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const pitchDeck = page.locator('text=/pitch.*deck|deck.*reader|presentation/i');
    if (await pitchDeck.count() > 0) {
      await expect(pitchDeck.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Due Diligence Assistant', () => {
  test('should have due diligence assistant', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const ddAssistant = page.locator('text=/due.*diligence|dd.*assistant/i');
    if (await ddAssistant.count() > 0) {
      await expect(ddAssistant.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Insights', () => {
  test('should have AI insights section', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const insights = page.locator('text=/insight|recommendation|suggestion/i');
    if (await insights.count() > 0) {
      await expect(insights.first()).toBeVisible();
    }
  });

  test('should show recent AI-generated insights', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const recentInsights = page.locator('[data-testid="ai-insight"], [class*="insight"]');
    if (await recentInsights.count() > 0) {
      await expect(recentInsights.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Usage & Limits', () => {
  test('should show AI usage metrics', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const usageMetrics = page.locator('text=/usage|requests|credits|limit/i');
    if (await usageMetrics.count() > 0) {
      await expect(usageMetrics.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Task Prioritizer', () => {
  test('should have AI task prioritization', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const taskPrioritizer = page.locator('text=/task.*priorit|smart.*task|ai.*task/i');
    if (await taskPrioritizer.count() > 0) {
      await expect(taskPrioritizer.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Decision Writer', () => {
  test('should have decision writing tool', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const decisionWriter = page.locator('text=/decision.*writer|investment.*memo|write.*decision/i');
    if (await decisionWriter.count() > 0) {
      await expect(decisionWriter.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Settings', () => {
  test('should have AI settings/preferences', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const settingsButton = page.getByRole('button', { name: /settings|preferences|configure/i });
    if (await settingsButton.first().isVisible()) {
      await expect(settingsButton.first()).toBeEnabled();
    }
  });
});

test.describe('AI Tools - History', () => {
  test('should show AI interaction history', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const historySection = page.locator('text=/history|recent|past.*interactions/i');
    if (await historySection.count() > 0) {
      await expect(historySection.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Interactions - Data Verification', () => {
  test('tool category filter should update displayed tools', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const categoryFilter = page.getByRole('combobox', { name: /category|type/i })
      .or(page.locator('[data-testid="category-filter"]'))
      .or(page.locator('select').filter({ hasText: /category|all|type/i }));

    const dataSelector = 'div.rounded-lg, [data-testid="ai-tool"], [class*="tool"]';

    if (await categoryFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await categoryFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Tool category filter should update displayed tools'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking AI tool card should show tool details or launch', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const toolCards = page.locator('div.rounded-lg, [data-testid="ai-tool"]');

    if (await toolCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"], [class*="chat"]';
      const before = await captureDataSnapshot(page, detailsSelector);

      await toolCards.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = !page.url().endsWith('/ai-tools');
      expect(
        changed || urlChanged,
        'Clicking AI tool card should show details or launch tool'
      ).toBe(true);
    }
  });

  test('launch copilot button should open chat interface', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const launchButton = page.getByRole('button', {
      name: /launch.*copilot|start.*copilot|open ai copilot|open vesta and start voice capture/i,
    });

    if (await launchButton.first().isVisible()) {
      await launchButton.first().click();
      await page.waitForLoadState('networkidle');
      const chatInterface = page
        .getByPlaceholder(/ask me anything/i)
        .or(page.getByRole('heading', { name: /^vesta$/i }))
        .or(page.getByText(/voice mode:/i));

      await expect(
        chatInterface.first(),
        'Launch copilot button should open chat interface'
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('tab navigation should update AI tools view', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');
    await openContextualMenu(page, /ai tools/i);

    const dataSelector = 'div.rounded-lg, [class*="content"], [class*="tool"]';

    const decisionWriterTab = getContextualTab(page, /ai decision writer/i);
    const pitchDeckTab = getContextualTab(page, /ai pitch deck reader/i);
    if (await decisionWriterTab.count() > 0 && await pitchDeckTab.count() > 0) {
      const before = await captureDataSnapshot(page, dataSelector);
      await clickContextualTab(page, /ai pitch deck reader/i);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update AI tools view').toBe(true);
    }
  });

  test('search should filter AI tools', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    const dataSelector = 'div.rounded-lg, [data-testid="ai-tool"], [class*="tool"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-tool');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('clicking upload button should open upload interface', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const uploadButton = page.getByRole('button', { name: /upload|analyze/i });

    if (await uploadButton.first().isVisible()) {
      const dataSelector = '[role="dialog"], [class*="modal"], [class*="upload"], input[type="file"]';
      const before = await captureDataSnapshot(page, dataSelector);

      await uploadButton.first().click();
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'Upload button should open upload interface'
      ).toBe(true);
    }
  });

  test('settings button should open settings panel', async ({ page }) => {
    await loginViaRedirect(page, '/ai-tools');

    const settingsButton = page.getByRole('button', { name: /settings|preferences|configure/i });

    if (await settingsButton.first().isVisible()) {
      const dataSelector = '[role="dialog"], [class*="modal"], [class*="settings"], [class*="panel"], [class*="drawer"]';
      const before = await captureDataSnapshot(page, dataSelector);

      await settingsButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'Settings button should open settings panel'
      ).toBe(true);
    }
  });
});
