import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReportDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForReportToLoad(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    // Back button appearing signals the detail screen is fully rendered
    await canvas.getByRole('button', { name: /Back/ }).waitFor({ state: 'visible', timeout: 30000 });
  }

  async getReportTitle(): Promise<string> {
    const canvas = await this.getCanvasFrame();
    return canvas.getByText(/Statistics Report/).first().innerText();
  }

  async assertReportTitle(expectedTitle: string): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(canvas.getByText(expectedTitle)).toBeVisible();
  }

  async assertOnReportDetailPage(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(canvas.getByRole('button', { name: /Back/ })).toBeVisible();
  }
}
