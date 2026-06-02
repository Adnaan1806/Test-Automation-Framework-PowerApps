import { Page, Frame, expect } from '@playwright/test';

export class ReportDetailPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getCanvasFrame(): Frame {
    const frame = this.page.frames().find(f =>
      f.url().includes('runtime-app.powerplatform.com')
    );
    if (!frame) throw new Error('PowerApps canvas iframe not found');
    return frame;
  }

  async waitForReportToLoad(): Promise<void> {
    const canvas = this.getCanvasFrame();
    // Back button appearing signals the detail screen is fully rendered
    await canvas.getByRole('button', { name: /Back/ }).waitFor({ state: 'visible', timeout: 30000 });
  }

  async getReportTitle(): Promise<string> {
    const canvas = this.getCanvasFrame();
    return canvas.getByText(/Statistics Report/).first().innerText();
  }

  async assertReportTitle(expectedTitle: string): Promise<void> {
    const canvas = this.getCanvasFrame();
    await expect(canvas.getByText(expectedTitle)).toBeVisible();
  }

  async assertOnReportDetailPage(): Promise<void> {
    const canvas = this.getCanvasFrame();
    await expect(canvas.getByRole('button', { name: /Back/ })).toBeVisible();
  }
}
