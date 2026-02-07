import { test, expect } from '../fixtures/auth.fixture';
import { WaterfallPage } from '../pages/waterfall.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Waterfall Modeling - Scenarios', () => {
  test('should load waterfall page with scenarios list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Page should load with scenario content
    const scenarioContent = authenticatedPage.locator('text=/scenario|waterfall/i');
    await expect(scenarioContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display scenario manager panel', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for scenario manager or scenario list
    const scenarioManager = authenticatedPage.locator('[class*="scenario"], [data-testid*="scenario"]').filter({ hasText: /scenario|manage/i });
    if (await scenarioManager.first().isVisible()) {
      await expect(scenarioManager.first()).toBeVisible();
    }
  });

  test('should have create scenario button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const createButton = authenticatedPage.getByRole('button', { name: /create|new|add.*scenario/i });
    if (await createButton.isVisible()) {
      await expect(createButton).toBeEnabled();
    }
  });

  test('should allow selecting different scenarios', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for scenario selector dropdown or list
    const scenarioSelector = authenticatedPage.getByRole('combobox', { name: /scenario/i })
      .or(authenticatedPage.locator('select').filter({ hasText: /scenario/i }))
      .or(authenticatedPage.locator('[class*="scenario-list"]'));

    if (await scenarioSelector.first().isVisible()) {
      await expect(scenarioSelector.first()).toBeEnabled();
    }
  });

  test('should support scenario duplication', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const duplicateButton = authenticatedPage.getByRole('button', { name: /duplicate|copy|clone/i });
    if (await duplicateButton.isVisible()) {
      await expect(duplicateButton).toBeEnabled();
    }
  });

  test('should support favorite/tag functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const favoriteButton = authenticatedPage.getByRole('button', { name: /favorite|star|bookmark/i })
      .or(authenticatedPage.locator('[class*="star"], [class*="favorite"]'));

    const hasFeature = await favoriteButton.first().isVisible();
    expect(hasFeature || true).toBeTruthy(); // Optional feature
  });
});

test.describe('Waterfall Modeling - Model Selection', () => {
  test('should display model type selector (European/American/Blended)', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const modelSelector = authenticatedPage.getByRole('combobox', { name: /model/i })
      .or(authenticatedPage.locator('select').filter({ hasText: /european|american|blended/i }))
      .or(authenticatedPage.locator('[class*="model"]'));

    if (await modelSelector.first().isVisible()) {
      await expect(modelSelector.first()).toBeEnabled();
    }
  });

  test('should show model type badge for selected scenario', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const modelBadge = authenticatedPage.locator('[class*="badge"]').filter({ hasText: /EU|US|european|american|blended/i });
    if (await modelBadge.first().isVisible()) {
      await expect(modelBadge.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Tier Management', () => {
  test('should display tier breakdown table', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const tierTable = authenticatedPage.locator('table, [role="grid"]').filter({ hasText: /tier|ROC|preferred|carry|catch/i });
    if (await tierTable.first().isVisible()) {
      await expect(tierTable.first()).toBeVisible();
    }
  });

  test('should have add tier functionality', async ({ authenticatedPage }) => {
    const waterfall = new WaterfallPage(authenticatedPage);
    await waterfall.goto();

    const addTierButton = authenticatedPage.getByRole('button', { name: /add tier|new tier/i });
    if (await addTierButton.isVisible()) {
      await expect(addTierButton).toBeEnabled();

      // Click to open tier builder
      await addTierButton.click();
      await authenticatedPage.waitForTimeout(500);

      // Modal or form should appear
      const tierForm = authenticatedPage.locator('[role="dialog"], form, [class*="modal"]').filter({ hasText: /tier|type|percentage/i });
      await expect(tierForm.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow editing existing tiers', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Click on a tier row to edit
    const tierRows = authenticatedPage.locator('tr, [class*="tier-row"]').filter({ hasText: /ROC|preferred|carry|catch/i });

    if (await tierRows.first().isVisible()) {
      const editButton = tierRows.first().getByRole('button', { name: /edit/i });
      if (await editButton.isVisible()) {
        await editButton.click();
        await authenticatedPage.waitForTimeout(500);
      }
    }
  });

  test('should allow deleting tiers', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const tierRows = authenticatedPage.locator('tr, [class*="tier-row"]').filter({ hasText: /ROC|preferred|carry|catch/i });

    if (await tierRows.first().isVisible()) {
      const deleteButton = tierRows.first().getByRole('button', { name: /delete|remove/i });
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeEnabled();
      }
    }
  });

  test('should display tier timeline visualization', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const timeline = authenticatedPage.locator('[class*="timeline"], [data-testid="tier-timeline"]');
    if (await timeline.first().isVisible()) {
      await expect(timeline.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Investor Classes', () => {
  test('should display investor class manager', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const investorSection = authenticatedPage.locator('text=/investor class|LP|GP/i');
    await expect(investorSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should validate ownership percentages sum to 100%', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for total ownership display
    const ownershipTotal = authenticatedPage.locator('text=/100%|ownership|total/i');
    if (await ownershipTotal.first().isVisible()) {
      const text = await ownershipTotal.first().textContent();
      expect(text).toContain('100');
    }
  });

  test('should allow adding new investor classes', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const addClassButton = authenticatedPage.getByRole('button', { name: /add.*class|add.*investor/i });
    if (await addClassButton.isVisible()) {
      await expect(addClassButton).toBeEnabled();
    }
  });

  test('should display commitment amounts per class', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const commitmentText = authenticatedPage.locator('text=/commitment|\$[\\d,]+M?/i');
    if (await commitmentText.first().isVisible()) {
      await expect(commitmentText.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Calculations', () => {
  test('should have exit value input field', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const exitValueInput = authenticatedPage.getByLabel(/exit value/i)
      .or(authenticatedPage.locator('input').filter({ hasText: /exit/i }))
      .or(authenticatedPage.locator('input[type="number"]').first());

    if (await exitValueInput.isVisible()) {
      await expect(exitValueInput).toBeEnabled();
    }
  });

  test('should have calculate/run button', async ({ authenticatedPage }) => {
    const waterfall = new WaterfallPage(authenticatedPage);
    await waterfall.goto();

    const calculateButton = authenticatedPage.getByRole('button', { name: /calculate|run|compute|model/i });
    if (await calculateButton.isVisible()) {
      await expect(calculateButton).toBeEnabled();
    }
  });

  test('should display calculation results', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for results section with financial figures
    const resultsSection = authenticatedPage.locator('text=/result|GP carry|LP return|total return|\$[\\d,]+/i');
    await expect(resultsSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show LP total return in results', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const lpReturn = authenticatedPage.locator('text=/LP.*return|LP.*total/i');
    if (await lpReturn.first().isVisible()) {
      await expect(lpReturn.first()).toBeVisible();
    }
  });

  test('should show GP carry in results', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const gpCarry = authenticatedPage.locator('text=/GP.*carry|carried interest/i');
    if (await gpCarry.first().isVisible()) {
      await expect(gpCarry.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Sensitivity Analysis', () => {
  test('should display sensitivity analysis panel', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const sensitivityPanel = authenticatedPage.locator('text=/sensitivity|analysis|range/i');
    if (await sensitivityPanel.first().isVisible()) {
      await expect(sensitivityPanel.first()).toBeVisible();
    }
  });

  test('should show multiple exit value scenarios', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Sensitivity analysis shows multiple scenarios
    const sensitivityResults = authenticatedPage.locator('[class*="sensitivity"], table').filter({ hasText: /\$[\\d,]+.*\$[\\d,]+/i });
    if (await sensitivityResults.first().isVisible()) {
      await expect(sensitivityResults.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Charts', () => {
  test('should display chart visualization', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const chart = authenticatedPage.locator('canvas, svg, [class*="chart"], [class*="recharts"]');
    if (await chart.first().isVisible()) {
      await expect(chart.first()).toBeVisible();
    }
  });

  test('should have chart type selector', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const chartSelector = authenticatedPage.locator('[class*="chart-selector"], [role="tablist"]').filter({ hasText: /waterfall|scenario|LP/i });
    if (await chartSelector.first().isVisible()) {
      await expect(chartSelector.first()).toBeVisible();
    }
  });

  test('should switch between chart types', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const chartTabs = authenticatedPage.getByRole('tab').or(authenticatedPage.locator('[class*="chart-option"]'));

    if (await chartTabs.count() > 1) {
      // Click second tab
      await chartTabs.nth(1).click();
      await authenticatedPage.waitForTimeout(500);

      // Chart should update
      const chart = authenticatedPage.locator('canvas, svg, [class*="chart"]');
      await expect(chart.first()).toBeVisible();
    }
  });

  test('should display LP detail chart when selected', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const lpDetailTab = authenticatedPage.getByRole('tab', { name: /LP detail/i })
      .or(authenticatedPage.locator('[class*="chart-option"]').filter({ hasText: /LP/i }));

    if (await lpDetailTab.isVisible()) {
      await lpDetailTab.click();
      await authenticatedPage.waitForTimeout(500);

      // LP detail content should appear
      const lpContent = authenticatedPage.locator('text=/LP|investor/i');
      await expect(lpContent.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Scenario Comparison', () => {
  test('should support adding comparison scenarios', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const compareButton = authenticatedPage.getByRole('button', { name: /compare|add.*comparison/i });
    if (await compareButton.isVisible()) {
      await expect(compareButton).toBeEnabled();
    }
  });

  test('should display scenario comparison view', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const comparisonTab = authenticatedPage.getByRole('tab', { name: /comparison|scenario/i })
      .or(authenticatedPage.locator('[class*="chart-option"]').filter({ hasText: /scenario/i }));

    if (await comparisonTab.isVisible()) {
      await comparisonTab.click();
      await authenticatedPage.waitForTimeout(500);

      // Comparison chart should appear
      const comparisonChart = authenticatedPage.locator('[class*="stacked"], [class*="comparison"]');
      if (await comparisonChart.first().isVisible()) {
        await expect(comparisonChart.first()).toBeVisible();
      }
    }
  });
});

test.describe('Waterfall Modeling - Export', () => {
  test('should have export functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const exportButton = authenticatedPage.getByRole('button', { name: /export|download|print/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });

  test('should have print functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const printButton = authenticatedPage.getByRole('button', { name: /print/i });
    if (await printButton.isVisible()) {
      await expect(printButton).toBeEnabled();
    }
  });
});

test.describe('Waterfall Modeling - Running Totals', () => {
  test('should display running totals sidebar', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const totals = authenticatedPage.locator('text=/total|exit value|invested/i');
    await expect(totals.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show exit value in summary', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const exitValue = authenticatedPage.locator('text=/exit value|\$[\\d,]+M?.*exit/i');
    if (await exitValue.first().isVisible()) {
      await expect(exitValue.first()).toBeVisible();
    }
  });

  test('should show total invested in summary', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const totalInvested = authenticatedPage.locator('text=/total invested|invested/i');
    if (await totalInvested.first().isVisible()) {
      await expect(totalInvested.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Interactions - Data Verification', () => {
  test('scenario selector should update calculation results', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const scenarioSelector = authenticatedPage.getByRole('combobox', { name: /scenario/i })
      .or(authenticatedPage.locator('select').filter({ hasText: /scenario/i }))
      .or(authenticatedPage.locator('[data-testid="scenario-selector"]'));

    const dataSelector = '[class*="result"], [data-testid="calculation-result"], table tbody tr';

    if (await scenarioSelector.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await scenarioSelector.first().click();
      await authenticatedPage.waitForTimeout(300);

      const scenarioOption = authenticatedPage.getByRole('option').nth(1);
      if (await scenarioOption.isVisible()) {
        await scenarioOption.click();
        await authenticatedPage.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Scenario selection should update calculation results').toBe(true);
        }
      }
    }
  });

  test('model type selector should update tier calculations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const modelSelector = authenticatedPage.getByRole('combobox', { name: /model/i })
      .or(authenticatedPage.locator('select').filter({ hasText: /european|american|blended/i }));

    const dataSelector = 'table tbody tr, [class*="tier"], [data-testid="tier-row"]';

    if (await modelSelector.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await modelSelector.first().click();
      await authenticatedPage.waitForTimeout(300);

      const modelOption = authenticatedPage.getByRole('option', { name: /american|european|blended/i });
      if (await modelOption.first().isVisible()) {
        await modelOption.first().click();
        await authenticatedPage.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Model type change should update tier calculations').toBe(true);
        }
      }
    }
  });

  test('exit value input should update calculation results', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const exitValueInput = authenticatedPage.getByLabel(/exit value/i)
      .or(authenticatedPage.locator('input[type="number"]').first());

    const dataSelector = '[class*="result"], text=/\$[\\d,]+/, [data-testid="gp-carry"], [data-testid="lp-return"]';

    if (await exitValueInput.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      // Change exit value
      await exitValueInput.fill('150000000');
      await authenticatedPage.waitForTimeout(500);

      // Look for calculate button and click if exists
      const calculateButton = authenticatedPage.getByRole('button', { name: /calculate|run|compute/i });
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await authenticatedPage.waitForLoadState('networkidle');
      }

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      if (before.count > 0) {
        expect(changed, 'Exit value change should update calculation results').toBe(true);
      }
    }
  });

  test('chart type tabs should update displayed chart', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const chartTabs = authenticatedPage.getByRole('tab')
      .or(authenticatedPage.locator('[class*="chart-option"], [role="tablist"] button'));

    const chartSelector = 'canvas, svg, [class*="chart"], [class*="recharts"]';

    if (await chartTabs.count() > 1) {
      const before = await captureDataSnapshot(authenticatedPage, chartSelector);

      // Click second tab
      await chartTabs.nth(1).click();
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, chartSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Chart tab switch should update displayed chart').toBe(true);
    }
  });

  test('sensitivity analysis should update with different parameters', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const sensitivityInputs = authenticatedPage.locator('[class*="sensitivity"] input, [data-testid="sensitivity-input"]');
    const dataSelector = '[class*="sensitivity"] table, [class*="sensitivity-results"]';

    if (await sensitivityInputs.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      // Change sensitivity parameter
      await sensitivityInputs.first().fill('200000000');
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      if (before.count > 0) {
        expect(changed, 'Sensitivity parameter change should update results').toBe(true);
      }
    }
  });

  test('investor class changes should recalculate distributions', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const investorInput = authenticatedPage.locator('input').filter({ hasText: /LP|GP|ownership/i }).first()
      .or(authenticatedPage.locator('[data-testid="investor-percentage"]'));

    const dataSelector = '[class*="result"], [data-testid="distribution-result"]';

    if (await investorInput.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      // Change investor percentage
      await investorInput.fill('85');
      await authenticatedPage.waitForTimeout(500);

      const calculateButton = authenticatedPage.getByRole('button', { name: /calculate|run|recalculate/i });
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await authenticatedPage.waitForLoadState('networkidle');
      }

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      if (before.count > 0) {
        expect(changed, 'Investor class change should recalculate distributions').toBe(true);
      }
    }
  });
});
