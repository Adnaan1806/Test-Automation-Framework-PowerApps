import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../constants/config';

export class ReportsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async searchReport(query: string): Promise<void> {
    const canvas = await this.getCanvasFrame();
    const searchBox = canvas.getByPlaceholder('Search for a report');
    await searchBox.waitFor({ state: 'visible', timeout: 15000 });
    await searchBox.fill(query);
    // Wait for gallery to filter — wait for first result button to appear
    await canvas.getByRole('button', { name: /View item details/ }).first().waitFor({
      state: 'visible',
      timeout: TIMEOUTS.galleryUpdate,
    });
  }

  async clickFirstReportResult(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    // Two galleries exist: first is a header row, second is the data row — click data row button
    const viewButtons = canvas.getByRole('button', { name: /View item details/ });
    await viewButtons.last().waitFor({ state: 'visible', timeout: 15000 });
    await viewButtons.last().click();
  }

  async waitForReportsPage(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await canvas.getByText(/All Reports/).waitFor({ state: 'visible', timeout: 60000 });
  }

  async assertOnReportsPage(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(canvas.getByText(/All Reports/)).toBeVisible();
  }

  async getReportCount(): Promise<number> {
    const canvas = await this.getCanvasFrame();
    const galleryText = await canvas.getByText(/Number of items in Gallery: \d+/)
      .last()
      .innerText()
      .catch(() => '0');
    const match = galleryText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
