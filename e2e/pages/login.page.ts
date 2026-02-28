import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly requestAccessLink: Locator;
  readonly brandLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use CSS selectors for NextUI inputs which have complex accessible names
    this.emailInput = page.locator('input[type="email"], input[type="text"]').first();
    this.passwordInput = page.locator('input[type="password"]');
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    const toastError = page.getByRole('alert').filter({
      hasText: /sign-in failed|failed to fetch|invalid|incorrect|unauthorized|unable to sign in/i,
    });
    const inlineError = page.locator('form').getByText(
      /incorrect email or password|failed to fetch|login failed|unable to sign in/i
    );
    this.errorMessage = toastError.or(inlineError);
    this.requestAccessLink = page.getByRole('link', { name: /request access/i });
    this.brandLogo = page.locator('.text-2xl').filter({ hasText: 'VestLedger' });
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForSelector('form');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async isLoginButtonLoading() {
    const button = this.signInButton;
    return button.getAttribute('data-loading').then((val) => val === 'true');
  }
}
