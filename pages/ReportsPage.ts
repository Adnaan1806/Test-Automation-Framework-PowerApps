import { Page, Frame, expect } from '@playwright/test';

export class ReportsPage {
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

  async waitForReportsPage(): Promise<void> {
    const canvas = this.getCanvasFrame();
    await canvas.getByText(/All Reports/).waitFor({ state: 'visible', timeout: 60000 });
  }

  async assertOnReportsPage(): Promise<void> {
    const canvas = this.getCanvasFrame();
    await expect(canvas.getByText(/All Reports/)).toBeVisible();
  }

  async getReportCount(): Promise<number> {
    const canvas = this.getCanvasFrame();
    const galleryText = await canvas.getByText(/Number of items in Gallery: \d+/)
      .last()
      .innerText()
      .catch(() => '0');
    const match = galleryText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
