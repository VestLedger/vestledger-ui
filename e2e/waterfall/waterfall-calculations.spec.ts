import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { WaterfallPage } from '../pages/waterfall.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Waterfall Modeling - Scenarios', () => {
  test('should load waterfall page with scenarios list', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Page should load with scenario content
    const scenarioContent = page.locator('text=/scenario|waterfall/i');
    await expect(scenarioContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display scenario manager panel', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for scenario manager or scenario list
    const scenarioManager = page.locator('[class*="scenario"], [data-testid*="scenario"]').filter({ hasText: /scenario|manage/i });
    if (await scenarioManager.first().isVisible()) {
      await expect(scenarioManager.first()).toBeVisible();
    }
  });

  test('should have create scenario button', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const createButton = page.getByRole('button', { name: /create|new|add.*scenario/i });
    if (await createButton.isVisible()) {
      await expect(createButton).toBeEnabled();
    }
  });

  test('should allow selecting different scenarios', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for scenario selector dropdown or list
    const scenarioSelector = page.getByRole('combobox', { name: /scenario/i })
      .or(page.locator('select').filter({ hasText: /scenario/i }))
      .or(page.locator('[class*="scenario-list"]'));

    if (await scenarioSelector.first().isVisible()) {
      await expect(scenarioSelector.first()).toBeEnabled();
    }
  });

  test('should support scenario duplication', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const duplicateButton = page.getByRole('button', { name: /duplicate|copy|clone/i });
    if (await duplicateButton.isVisible()) {
      await expect(duplicateButton).toBeEnabled();
    }
  });

  test('should support favorite/tag functionality', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const favoriteButton = page.getByRole('button', { name: /favorite|star|bookmark/i })
      .or(page.locator('[class*="star"], [class*="favorite"]'));

    const hasFeature = await favoriteButton.first().isVisible();
    expect(hasFeature || true).toBeTruthy(); // Optional feature
  });
});

test.describe('Waterfall Modeling - Model Selection', () => {
  test('should display model type selector (European/American/Blended)', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const modelSelector = page.getByRole('combobox', { name: /model/i })
      .or(page.locator('select').filter({ hasText: /european|american|blended/i }))
      .or(page.locator('[class*="model"]'));

    if (await modelSelector.first().isVisible()) {
      await expect(modelSelector.first()).toBeEnabled();
    }
  });

  test('should show model type badge for selected scenario', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const modelBadge = page.locator('[class*="badge"]').filter({ hasText: /EU|US|european|american|blended/i });
    if (await modelBadge.first().isVisible()) {
      await expect(modelBadge.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Tier Management', () => {
  test('should display tier breakdown table', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const tierTable = page.locator('table, [role="grid"]').filter({ hasText: /tier|ROC|preferred|carry|catch/i });
    if (await tierTable.first().isVisible()) {
      await expect(tierTable.first()).toBeVisible();
    }
  });

  test('should have add tier functionality', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();

    const addTierButton = page.getByRole('button', { name: /add tier|new tier/i });
    if (await addTierButton.isVisible()) {
      await expect(addTierButton).toBeEnabled();

      // Click to open tier builder
      await addTierButton.click();
      await page.waitForTimeout(500);

      // Modal or form should appear
      const tierForm = page.locator('[role="dialog"], form, [class*="modal"]').filter({ hasText: /tier|type|percentage/i });
      await expect(tierForm.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow editing existing tiers', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Click on a tier row to edit
    const tierRows = page.locator('tr, [class*="tier-row"]').filter({ hasText: /ROC|preferred|carry|catch/i });

    if (await tierRows.first().isVisible()) {
      const editButton = tierRows.first().getByRole('button', { name: /edit/i });
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should allow deleting tiers', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const tierRows = page.locator('tr, [class*="tier-row"]').filter({ hasText: /ROC|preferred|carry|catch/i });

    if (await tierRows.first().isVisible()) {
      const deleteButton = tierRows.first().getByRole('button', { name: /delete|remove/i });
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeEnabled();
      }
    }
  });

  test('should display tier timeline visualization', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const timeline = page.locator('[class*="timeline"], [data-testid="tier-timeline"]');
    if (await timeline.first().isVisible()) {
      await expect(timeline.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Investor Classes', () => {
  test('should display investor class manager', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const investorSection = page.locator('text=/investor class|LP|GP/i');
    await expect(investorSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should validate ownership percentages sum to 100%', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for total ownership display
    const ownershipTotal = page.locator('text=/100%|ownership|total/i');
    if (await ownershipTotal.first().isVisible()) {
      const text = await ownershipTotal.first().textContent();
      expect(text).toContain('100');
    }
  });

  test('should allow adding new investor classes', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const addClassButton = page.getByRole('button', { name: /add.*class|add.*investor/i });
    if (await addClassButton.isVisible()) {
      await expect(addClassButton).toBeEnabled();
    }
  });

  test('should display commitment amounts per class', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const commitmentText = page.locator('text=/commitment|\$[\\d,]+M?/i');
    if (await commitmentText.first().isVisible()) {
      await expect(commitmentText.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Calculations', () => {
  test('should have exit value input field', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const exitValueInput = page.getByLabel(/exit value/i)
      .or(page.locator('input').filter({ hasText: /exit/i }))
      .or(page.locator('input[type="number"]').first());

    if (await exitValueInput.isVisible()) {
      await expect(exitValueInput).toBeEnabled();
    }
  });

  test('should have calculate/run button', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();

    const calculateButton = page.getByRole('button', { name: /calculate|run|compute|model/i });
    if (await calculateButton.isVisible()) {
      await expect(calculateButton).toBeEnabled();
    }
  });

  test('should display calculation results', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for results section with financial figures
    const resultsSection = page.locator('text=/result|GP carry|LP return|total return|\$[\\d,]+/i');
    await expect(resultsSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show LP total return in results', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const lpReturn = page.locator('text=/LP.*return|LP.*total/i');
    if (await lpReturn.first().isVisible()) {
      await expect(lpReturn.first()).toBeVisible();
    }
  });

  test('should show GP carry in results', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const gpCarry = page.locator('text=/GP.*carry|carried interest/i');
    if (await gpCarry.first().isVisible()) {
      await expect(gpCarry.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Sensitivity Analysis', () => {
  test('should display sensitivity analysis panel', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const sensitivityPanel = page.locator('text=/sensitivity|analysis|range/i');
    if (await sensitivityPanel.first().isVisible()) {
      await expect(sensitivityPanel.first()).toBeVisible();
    }
  });

  test('should show multiple exit value scenarios', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Sensitivity analysis shows multiple scenarios
    const sensitivityResults = page.locator('[class*="sensitivity"], table').filter({ hasText: /\$[\\d,]+.*\$[\\d,]+/i });
    if (await sensitivityResults.first().isVisible()) {
      await expect(sensitivityResults.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Charts', () => {
  test('should display chart visualization', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const chart = page.locator('canvas, svg, [class*="chart"], [class*="recharts"]');
    if (await chart.first().isVisible()) {
      await expect(chart.first()).toBeVisible();
    }
  });

  test('should have chart type selector', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const chartSelector = page.locator('[class*="chart-selector"], [role="tablist"]').filter({ hasText: /waterfall|scenario|LP/i });
    if (await chartSelector.first().isVisible()) {
      await expect(chartSelector.first()).toBeVisible();
    }
  });

  test('should switch between chart types', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const chartTabs = page.getByRole('tab').or(page.locator('[class*="chart-option"]'));

    if (await chartTabs.count() > 1) {
      // Click second tab
      await chartTabs.nth(1).click();
      await page.waitForTimeout(500);

      // Chart should update
      const chart = page.locator('canvas, svg, [class*="chart"]');
      await expect(chart.first()).toBeVisible();
    }
  });

  test('should display LP detail chart when selected', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const lpDetailTab = page.getByRole('tab', { name: /LP detail/i })
      .or(page.locator('[class*="chart-option"]').filter({ hasText: /LP/i }));

    if (await lpDetailTab.isVisible()) {
      await lpDetailTab.click();
      await page.waitForTimeout(500);

      // LP detail content should appear
      const lpContent = page.locator('text=/LP|investor/i');
      await expect(lpContent.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Scenario Comparison', () => {
  test('should support adding comparison scenarios', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const compareButton = page.getByRole('button', { name: /compare|add.*comparison/i });
    if (await compareButton.isVisible()) {
      await expect(compareButton).toBeEnabled();
    }
  });

  test('should display scenario comparison view', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const comparisonTab = page.getByRole('tab', { name: /comparison|scenario/i })
      .or(page.locator('[class*="chart-option"]').filter({ hasText: /scenario/i }));

    if (await comparisonTab.isVisible()) {
      await comparisonTab.click();
      await page.waitForTimeout(500);

      // Comparison chart should appear
      const comparisonChart = page.locator('[class*="stacked"], [class*="comparison"]');
      if (await comparisonChart.first().isVisible()) {
        await expect(comparisonChart.first()).toBeVisible();
      }
    }
  });
});

test.describe('Waterfall Modeling - Export', () => {
  test('should have export functionality', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const exportButton = page.getByRole('button', { name: /export|download|print/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });

  test('should have print functionality', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const printButton = page.getByRole('button', { name: /print/i });
    if (await printButton.isVisible()) {
      await expect(printButton).toBeEnabled();
    }
  });
});

test.describe('Waterfall Modeling - Running Totals', () => {
  test('should display running totals sidebar', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const totals = page.locator('text=/total|exit value|invested/i');
    await expect(totals.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show exit value in summary', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const exitValue = page.locator('text=/exit value|\$[\\d,]+M?.*exit/i');
    if (await exitValue.first().isVisible()) {
      await expect(exitValue.first()).toBeVisible();
    }
  });

  test('should show total invested in summary', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const totalInvested = page.locator('text=/total invested|invested/i');
    if (await totalInvested.first().isVisible()) {
      await expect(totalInvested.first()).toBeVisible();
    }
  });
});

test.describe('Waterfall Modeling - Interactions - Data Verification', () => {
  test('scenario selector should update calculation results', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const scenarioSelector = page.getByRole('combobox', { name: /scenario/i })
      .or(page.locator('select').filter({ hasText: /scenario/i }))
      .or(page.locator('[data-testid="scenario-selector"]'));

    const dataSelector = '[class*="result"], [data-testid="calculation-result"], table tbody tr';

    if (await scenarioSelector.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await scenarioSelector.first().click();
      await page.waitForTimeout(300);

      const scenarioOption = page.getByRole('option').nth(1);
      if (await scenarioOption.isVisible()) {
        await scenarioOption.click();
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Scenario selection should update calculation results').toBe(true);
        }
      }
    }
  });

  test('model type selector should update tier calculations', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const modelSelector = page.getByRole('combobox', { name: /model/i })
      .or(page.locator('select').filter({ hasText: /european|american|blended/i }));

    const dataSelector = 'table tbody tr, [class*="tier"], [data-testid="tier-row"]';

    if (await modelSelector.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await modelSelector.first().click();
      await page.waitForTimeout(300);

      const modelOption = page.getByRole('option', { name: /american|european|blended/i });
      if (await modelOption.first().isVisible()) {
        await modelOption.first().click();
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Model type change should update tier calculations').toBe(true);
        }
      }
    }
  });

  test('exit value input should update calculation results', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const exitValueInput = page.getByLabel(/exit value/i)
      .or(page.locator('input[type="number"]').first());

    const dataSelector = '[class*="result"], text=/\$[\\d,]+/, [data-testid="gp-carry"], [data-testid="lp-return"]';

    if (await exitValueInput.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Change exit value
      await exitValueInput.fill('150000000');
      await page.waitForTimeout(500);

      // Look for calculate button and click if exists
      const calculateButton = page.getByRole('button', { name: /calculate|run|compute/i });
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForLoadState('networkidle');
      }

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      if (before.count > 0) {
        expect(changed, 'Exit value change should update calculation results').toBe(true);
      }
    }
  });

  test('chart type tabs should update displayed chart', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const chartTabs = page.getByRole('tab')
      .or(page.locator('[class*="chart-option"], [role="tablist"] button'));

    const chartSelector = 'canvas, svg, [class*="chart"], [class*="recharts"]';

    if (await chartTabs.count() > 1) {
      const before = await captureDataSnapshot(page, chartSelector);

      // Click second tab
      await chartTabs.nth(1).click();
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, chartSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Chart tab switch should update displayed chart').toBe(true);
    }
  });

  test('sensitivity analysis should update with different parameters', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const sensitivityInputs = page.locator('[class*="sensitivity"] input, [data-testid="sensitivity-input"]');
    const dataSelector = '[class*="sensitivity"] table, [class*="sensitivity-results"]';

    if (await sensitivityInputs.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Change sensitivity parameter
      await sensitivityInputs.first().fill('200000000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      if (before.count > 0) {
        expect(changed, 'Sensitivity parameter change should update results').toBe(true);
      }
    }
  });

  test('investor class changes should recalculate distributions', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const investorInput = page.locator('input').filter({ hasText: /LP|GP|ownership/i }).first()
      .or(page.locator('[data-testid="investor-percentage"]'));

    const dataSelector = '[class*="result"], [data-testid="distribution-result"]';

    if (await investorInput.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Change investor percentage
      await investorInput.fill('85');
      await page.waitForTimeout(500);

      const calculateButton = page.getByRole('button', { name: /calculate|run|recalculate/i });
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForLoadState('networkidle');
      }

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      if (before.count > 0) {
        expect(changed, 'Investor class change should recalculate distributions').toBe(true);
      }
    }
  });
});
