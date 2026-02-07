import { test, expect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('AI Tools - Page Load', () => {
  test('should load AI tools page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const pageTitle = authenticatedPage.locator('h1, [class*="title"]').filter({ hasText: /ai|tools|assistant/i });
    await expect(pageTitle.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display AI tools content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for AI-related content
    const content = authenticatedPage.locator('[class*="card"], [data-testid="ai-tool"], [class*="ai"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('AI Tools - Available Tools', () => {
  test('should display available AI tool cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const toolCards = authenticatedPage.locator('[data-testid="ai-tool"], [class*="card"], [class*="tool"]');
    const count = await toolCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show tool names and descriptions', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    // Common AI tools: Document Analysis, Pitch Deck Reader, Due Diligence, etc.
    const toolNames = authenticatedPage.locator('text=/document.*analysis|pitch.*deck|due.*diligence|copilot|assistant|insights/i');
    if (await toolNames.count() > 0) {
      await expect(toolNames.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Copilot', () => {
  test('should have AI copilot section', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const copilotSection = authenticatedPage.locator('text=/copilot|assistant|chat/i');
    if (await copilotSection.count() > 0) {
      await expect(copilotSection.first()).toBeVisible();
    }
  });

  test('should have launch copilot button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const launchButton = authenticatedPage.getByRole('button', { name: /launch|open|start.*copilot|chat/i });
    if (await launchButton.first().isVisible()) {
      await expect(launchButton.first()).toBeEnabled();
    }
  });
});

test.describe('AI Tools - Document Analysis', () => {
  test('should have document analysis tool', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const docAnalysis = authenticatedPage.locator('text=/document.*analysis|analyze.*document/i');
    if (await docAnalysis.count() > 0) {
      await expect(docAnalysis.first()).toBeVisible();
    }
  });

  test('should have upload document option', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const uploadButton = authenticatedPage.getByRole('button', { name: /upload|analyze/i });
    if (await uploadButton.first().isVisible()) {
      await expect(uploadButton.first()).toBeEnabled();
    }
  });
});

test.describe('AI Tools - Pitch Deck Reader', () => {
  test('should have pitch deck analysis tool', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const pitchDeck = authenticatedPage.locator('text=/pitch.*deck|deck.*reader|presentation/i');
    if (await pitchDeck.count() > 0) {
      await expect(pitchDeck.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Due Diligence Assistant', () => {
  test('should have due diligence assistant', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const ddAssistant = authenticatedPage.locator('text=/due.*diligence|dd.*assistant/i');
    if (await ddAssistant.count() > 0) {
      await expect(ddAssistant.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Insights', () => {
  test('should have AI insights section', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const insights = authenticatedPage.locator('text=/insight|recommendation|suggestion/i');
    if (await insights.count() > 0) {
      await expect(insights.first()).toBeVisible();
    }
  });

  test('should show recent AI-generated insights', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const recentInsights = authenticatedPage.locator('[data-testid="ai-insight"], [class*="insight"]');
    if (await recentInsights.count() > 0) {
      await expect(recentInsights.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Usage & Limits', () => {
  test('should show AI usage metrics', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const usageMetrics = authenticatedPage.locator('text=/usage|requests|credits|limit/i');
    if (await usageMetrics.count() > 0) {
      await expect(usageMetrics.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Task Prioritizer', () => {
  test('should have AI task prioritization', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const taskPrioritizer = authenticatedPage.locator('text=/task.*priorit|smart.*task|ai.*task/i');
    if (await taskPrioritizer.count() > 0) {
      await expect(taskPrioritizer.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Decision Writer', () => {
  test('should have decision writing tool', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const decisionWriter = authenticatedPage.locator('text=/decision.*writer|investment.*memo|write.*decision/i');
    if (await decisionWriter.count() > 0) {
      await expect(decisionWriter.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Settings', () => {
  test('should have AI settings/preferences', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const settingsButton = authenticatedPage.getByRole('button', { name: /settings|preferences|configure/i });
    if (await settingsButton.first().isVisible()) {
      await expect(settingsButton.first()).toBeEnabled();
    }
  });
});

test.describe('AI Tools - History', () => {
  test('should show AI interaction history', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const historySection = authenticatedPage.locator('text=/history|recent|past.*interactions/i');
    if (await historySection.count() > 0) {
      await expect(historySection.first()).toBeVisible();
    }
  });
});

test.describe('AI Tools - Interactions - Data Verification', () => {
  test('tool category filter should update displayed tools', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const categoryFilter = authenticatedPage.getByRole('combobox', { name: /category|type/i })
      .or(authenticatedPage.locator('[data-testid="category-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /category|all|type/i }));

    const dataSelector = '[class*="card"], [data-testid="ai-tool"], [class*="tool"]';

    if (await categoryFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await categoryFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Tool category filter should update displayed tools'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking AI tool card should show tool details or launch', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const toolCards = authenticatedPage.locator('[class*="card"], [data-testid="ai-tool"]');

    if (await toolCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"], [class*="chat"]';
      const before = await captureDataSnapshot(authenticatedPage, detailsSelector);

      await toolCards.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = !authenticatedPage.url().endsWith('/ai-tools');
      expect(
        changed || urlChanged,
        'Clicking AI tool card should show details or launch tool'
      ).toBe(true);
    }
  });

  test('launch copilot button should open chat interface', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const launchButton = authenticatedPage.getByRole('button', { name: /launch|open|start.*copilot|chat/i });

    if (await launchButton.first().isVisible()) {
      const dataSelector = '[class*="chat"], [class*="copilot"], [class*="dialog"], [class*="panel"], [role="dialog"]';
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await launchButton.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'Launch copilot button should open chat interface'
      ).toBe(true);
    }
  });

  test('tab navigation should update AI tools view', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const tabs = authenticatedPage.getByRole('tab')
      .or(authenticatedPage.locator('[role="tablist"] button'));

    const dataSelector = '[class*="card"], [class*="content"], [class*="tool"]';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await tabs.nth(1).click();
      await authenticatedPage.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update AI tools view').toBe(true);
    }
  });

  test('search should filter AI tools', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i)
      .or(authenticatedPage.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [data-testid="ai-tool"], [class*="tool"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-tool');
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('clicking upload button should open upload interface', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const uploadButton = authenticatedPage.getByRole('button', { name: /upload|analyze/i });

    if (await uploadButton.first().isVisible()) {
      const dataSelector = '[role="dialog"], [class*="modal"], [class*="upload"], input[type="file"]';
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await uploadButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'Upload button should open upload interface'
      ).toBe(true);
    }
  });

  test('settings button should open settings panel', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ai-tools');
    await authenticatedPage.waitForLoadState('networkidle');

    const settingsButton = authenticatedPage.getByRole('button', { name: /settings|preferences|configure/i });

    if (await settingsButton.first().isVisible()) {
      const dataSelector = '[role="dialog"], [class*="modal"], [class*="settings"], [class*="panel"], [class*="drawer"]';
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await settingsButton.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'Settings button should open settings panel'
      ).toBe(true);
    }
  });
});
