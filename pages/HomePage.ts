import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../constants/config';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForAppReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.domLoad });

    // Wait for outer shell loading screen to clear
    await this.page.waitForFunction(
      () => !document.body.innerText.includes('Fetching your app'),
      { timeout: TIMEOUTS.appReady }
    );

    // Poll for canvas iframe — cross-origin so must use Playwright frame list
    const canvas = await this.getCanvasFrame();

    // Wait for nav to render inside canvas
    await canvas.getByRole('button', { name: /Home/ }).waitFor({ state: 'visible', timeout: TIMEOUTS.appReady });
  }

  async navigateToReports(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await canvas.getByRole('button', { name: /Reports/ }).click();
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async getGreetingText(): Promise<string> {
    const canvas = await this.getCanvasFrame();
    return canvas.getByText(/Hello,/).innerText();
  }

  async getWelcomeHeading(): Promise<string> {
    const canvas = await this.getCanvasFrame();
    return canvas.getByText(/Welcome to/).innerText();
  }

  async isNavigationVisible(): Promise<boolean> {
    const canvas = await this.getCanvasFrame();
    return (
      (await canvas.getByRole('button', { name: /Home/ }).isVisible()) &&
      (await canvas.getByRole('button', { name: /Reports/ }).isVisible()) &&
      (await canvas.getByRole('button', { name: /Help/ }).isVisible())
    );
  }

  async getTaskCount(): Promise<number> {
    const canvas = await this.getCanvasFrame();
    const galleryText = await canvas.getByText(/Number of items in Gallery: \d+/)
      .first()
      .innerText()
      .catch(() => '0');
    const match = galleryText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async assertLandedOnHomePage(): Promise<void> {
    // Primary check: title confirms authenticated + correct app loaded
    await expect(this.page).toHaveTitle('BFR - Power Apps');
    await expect(this.page).not.toHaveURL(/login\.microsoftonline\.com/);
    await expect(this.page).not.toHaveURL(/login\.live\.com/);
  }

  async assertCanvasContentVisible(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(canvas.getByRole('button', { name: /Home/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Reports/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Help/ })).toBeVisible();
    await expect(canvas.getByText(/Hello,/)).toBeVisible();
    await expect(canvas.getByText(/Welcome to/)).toBeVisible();
    await expect(canvas.getByText(/Welcome to BDO Firm Reporting/).first()).toBeVisible();
    await expect(canvas.getByText(/My tasks/)).toBeVisible();
  }
}
