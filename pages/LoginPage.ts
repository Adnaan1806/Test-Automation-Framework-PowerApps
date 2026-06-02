import { Page, BrowserContext } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.handleStaySignedIn();
  }

  private async enterEmail(email: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    const emailInput = this.page.getByPlaceholder('Email, phone, or Skype')
      .or(this.page.locator('input[type="email"]'))
      .or(this.page.locator('input[name="loginfmt"]'));

    await emailInput.first().waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.first().fill(email);
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  private async enterPassword(password: string): Promise<void> {
    const passwordInput = this.page.getByPlaceholder('Password')
      .or(this.page.locator('input[type="password"]'))
      .or(this.page.locator('input[name="passwd"]'));

    await passwordInput.first().waitFor({ state: 'visible', timeout: 15000 });
    await passwordInput.first().fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  private async handleStaySignedIn(): Promise<void> {
    try {
      const staySignedInButton = this.page.getByRole('button', { name: 'Yes' });
      await staySignedInButton.waitFor({ state: 'visible', timeout: 8000 });
      await staySignedInButton.click();
    } catch {
      // "Stay signed in" prompt did not appear — continue
    }
  }

  async saveAuthState(context: BrowserContext, path: string): Promise<void> {
    await context.storageState({ path });
  }
}
