import { Page, Frame, expect } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async waitForCanvasFrame(timeout = 60000): Promise<Frame> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const frame = this.page.frames().find(f =>
        f.url().includes('runtime-app.powerplatform.com')
      );
      if (frame) return frame;
      await this.page.waitForTimeout(500);
    }
    throw new Error('PowerApps canvas iframe not found after timeout');
  }

  private getCanvasFrame(): Frame {
    const frame = this.page.frames().find(f =>
      f.url().includes('runtime-app.powerplatform.com')
    );
    if (!frame) throw new Error('PowerApps canvas iframe not found');
    return frame;
  }

  async waitForAppReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Wait for outer shell loading screen to clear
    await this.page.waitForFunction(
      () => !document.body.innerText.includes('Fetching your app'),
      { timeout: 60000 }
    );

    // Poll for canvas iframe — cross-origin so must use Playwright frame list
    const canvas = await this.waitForCanvasFrame(30000);

    // Wait for nav to render inside canvas
    await canvas.getByRole('button', { name: /Home/ }).waitFor({ state: 'visible', timeout: 60000 });
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async getGreetingText(): Promise<string> {
    const canvas = this.getCanvasFrame();
    return canvas.getByText(/Hello,/).innerText();
  }

  async getWelcomeHeading(): Promise<string> {
    const canvas = this.getCanvasFrame();
    return canvas.getByText(/Welcome to/).innerText();
  }

  async isNavigationVisible(): Promise<boolean> {
    const canvas = this.getCanvasFrame();
    return (
      (await canvas.getByRole('button', { name: /Home/ }).isVisible()) &&
      (await canvas.getByRole('button', { name: /Reports/ }).isVisible()) &&
      (await canvas.getByRole('button', { name: /Help/ }).isVisible())
    );
  }

  async getTaskCount(): Promise<number> {
    const canvas = this.getCanvasFrame();
    const allButtons = await canvas.getByRole('button').count();
    return Math.max(0, allButtons - 4);
  }

  async assertLandedOnHomePage(): Promise<void> {
    // Primary check: title confirms authenticated + correct app loaded
    await expect(this.page).toHaveTitle('BFR - Power Apps');
    await expect(this.page).not.toHaveURL(/login\.microsoftonline\.com/);
    await expect(this.page).not.toHaveURL(/login\.live\.com/);
  }

  async assertCanvasContentVisible(): Promise<void> {
    const canvas = this.getCanvasFrame();
    await expect(canvas.getByRole('button', { name: /Home/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Reports/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Help/ })).toBeVisible();
    await expect(canvas.getByText(/Hello,/)).toBeVisible();
    await expect(canvas.getByText(/Welcome to/)).toBeVisible();
    await expect(canvas.getByText(/Welcome to BDO Firm Reporting/).first()).toBeVisible();
    await expect(canvas.getByText(/My tasks/)).toBeVisible();
  }
}
