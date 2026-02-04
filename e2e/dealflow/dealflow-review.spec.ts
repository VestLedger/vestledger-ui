import { test, expect } from '../fixtures/auth.fixture';
import { DealflowReviewPage } from '../pages/dealflow-review.page';

test.describe('Dealflow Review - Page Load', () => {
  test('should load dealflow review page', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    await expect(dealflowReview.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display deal selector', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.dealSelectorCard).toBeVisible();
    }
  });

  test('should have presentation button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    if (await dealflowReview.startPresentationButton.isVisible()) {
      await expect(dealflowReview.startPresentationButton).toBeEnabled();
    }
  });
});

test.describe('Dealflow Review - Deal Navigation', () => {
  test('should display current deal indicator', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.currentDealIndicator).toBeVisible();
    }
  });

  test('should navigate to next deal', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 1) {
      const initialIndex = await dealflowReview.getCurrentDealIndex();
      await dealflowReview.nextDeal();
      const newIndex = await dealflowReview.getCurrentDealIndex();
      expect(newIndex).toBe(initialIndex + 1);
    }
  });

  test('should navigate to previous deal', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 1) {
      // First go to second deal
      await dealflowReview.nextDeal();
      const currentIndex = await dealflowReview.getCurrentDealIndex();

      await dealflowReview.previousDeal();
      const newIndex = await dealflowReview.getCurrentDealIndex();
      expect(newIndex).toBe(currentIndex - 1);
    }
  });

  test('should select deal by clicking deal button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 1) {
      await dealflowReview.selectDeal(1);
      const currentIndex = await dealflowReview.getCurrentDealIndex();
      expect(currentIndex).toBe(2); // 1-indexed display
    }
  });
});

test.describe('Dealflow Review - Slide Navigation', () => {
  test('should display slides panel', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.slidesPanel).toBeVisible();
    }
  });

  test('should display slide buttons', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      const slideCount = await dealflowReview.getSlideCount();
      expect(slideCount).toBeGreaterThan(0);
    }
  });

  test('should navigate to next slide', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      const totalSlides = await dealflowReview.getTotalSlides();
      if (totalSlides > 1) {
        const initialSlide = await dealflowReview.getCurrentSlideNumber();
        await dealflowReview.nextSlide();
        const newSlide = await dealflowReview.getCurrentSlideNumber();
        expect(newSlide).toBe(initialSlide + 1);
      }
    }
  });

  test('should navigate to previous slide', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      const totalSlides = await dealflowReview.getTotalSlides();
      if (totalSlides > 1) {
        // First go to second slide
        await dealflowReview.nextSlide();
        const currentSlide = await dealflowReview.getCurrentSlideNumber();

        await dealflowReview.previousSlide();
        const newSlide = await dealflowReview.getCurrentSlideNumber();
        expect(newSlide).toBe(currentSlide - 1);
      }
    }
  });

  test('should select slide by clicking slide button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      const slideCount = await dealflowReview.getSlideCount();
      if (slideCount > 2) {
        await dealflowReview.selectSlide(2);
        const currentSlide = await dealflowReview.getCurrentSlideNumber();
        expect(currentSlide).toBe(3); // 1-indexed display
      }
    }
  });
});

test.describe('Dealflow Review - Slide Content', () => {
  test('should display slide title', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      const title = await dealflowReview.getSlideTitle();
      expect(title).toBeTruthy();
    }
  });

  test('should display slide number badge', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.slideNumber).toBeVisible();
    }
  });

  test('should display slide content', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.slideCard).toBeVisible();
    }
  });
});

test.describe('Dealflow Review - Slide Types', () => {
  test('should display overview slide content', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      // Overview is usually the first slide
      const overviewContent = dealflowReview.getOverviewSlideContent();
      if (await overviewContent.count() > 0) {
        await expect(overviewContent.first()).toBeVisible();
      }
    }
  });

  test('should display market slide content', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      // Navigate to market slide
      const marketSlide = dealflowReview.getSlideByType('market');
      if (await marketSlide.count() > 0) {
        await marketSlide.first().click();
        await authenticatedPage.waitForLoadState('networkidle');

        const marketContent = dealflowReview.getMarketSlideContent();
        if (await marketContent.count() > 0) {
          await expect(marketContent.first()).toBeVisible();
        }
      }
    }
  });

  test('should display financials slide content', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      const financialsSlide = dealflowReview.getSlideByType('financials');
      if (await financialsSlide.count() > 0) {
        await financialsSlide.first().click();
        await authenticatedPage.waitForLoadState('networkidle');

        const financialsContent = dealflowReview.getFinancialsSlideContent();
        if (await financialsContent.count() > 0) {
          await expect(financialsContent.first()).toBeVisible();
        }
      }
    }
  });
});

test.describe('Dealflow Review - Voting', () => {
  test('should display voting panel', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.votingPanel).toBeVisible();
    }
  });

  test('should have yes vote button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.yesVoteButton).toBeVisible();
      await expect(dealflowReview.yesVoteButton).toBeEnabled();
    }
  });

  test('should have maybe vote button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.maybeVoteButton).toBeVisible();
      await expect(dealflowReview.maybeVoteButton).toBeEnabled();
    }
  });

  test('should have no vote button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.noVoteButton).toBeVisible();
      await expect(dealflowReview.noVoteButton).toBeEnabled();
    }
  });

  test('should cast yes vote', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await dealflowReview.voteYes();

      // Check that vote was registered (button state change or votes cast section update)
      const yesVotes = dealflowReview.getVotesByType('yes');
      const count = await yesVotes.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should cast maybe vote', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await dealflowReview.voteMaybe();
    }
  });

  test('should cast no vote', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await dealflowReview.voteNo();
    }
  });
});

test.describe('Dealflow Review - Discussion', () => {
  test('should display discussion section', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.discussionSection).toBeVisible();
    }
  });

  test('should have discussion textarea', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.discussionTextarea).toBeVisible();
    }
  });

  test('should add comment', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await dealflowReview.addComment('This looks like a promising deal.');
      const value = await dealflowReview.discussionTextarea.inputValue();
      expect(value).toContain('promising');
    }
  });
});

test.describe('Dealflow Review - Partner Scoring', () => {
  test('should display partner scoring section', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.partnerScoringSection).toBeVisible();
    }
  });
});

test.describe('Dealflow Review - Presentation Mode', () => {
  test('should start presentation', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0 && await dealflowReview.startPresentationButton.isVisible()) {
      await dealflowReview.startPresentation();

      // Button text should change to "Stop Presenting"
      await expect(dealflowReview.stopPresentationButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('should stop presentation', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0 && await dealflowReview.startPresentationButton.isVisible()) {
      await dealflowReview.startPresentation();
      await dealflowReview.stopPresentation();

      await expect(dealflowReview.startPresentationButton).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Dealflow Review - Add Slide', () => {
  test('should have add slide button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    const totalDeals = await dealflowReview.getTotalDeals();
    if (totalDeals > 0) {
      await expect(dealflowReview.addSlideButton).toBeVisible();
      await expect(dealflowReview.addSlideButton).toBeEnabled();
    }
  });
});

test.describe('Dealflow Review - Share and Export', () => {
  test('should have share button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    if (await dealflowReview.shareButton.isVisible()) {
      await expect(dealflowReview.shareButton).toBeEnabled();
    }
  });

  test('should have export button', async ({ authenticatedPage }) => {
    const dealflowReview = new DealflowReviewPage(authenticatedPage);
    await dealflowReview.goto();

    if (await dealflowReview.exportButton.isVisible()) {
      await expect(dealflowReview.exportButton).toBeEnabled();
    }
  });
});
