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

  async searchReport(query: string): Promise<void> {
    const canvas = this.getCanvasFrame();
    const searchBox = canvas.getByPlaceholder('Search for a report');
    await searchBox.waitFor({ state: 'visible', timeout: 15000 });
    await searchBox.fill(query);
    // Wait for gallery to filter (debounce + render)
    await this.page.waitForTimeout(2000);
  }

  async clickFirstReportResult(): Promise<void> {
    const canvas = this.getCanvasFrame();
    // Two galleries exist: first is a header row, second is the data row — click data row button
    const viewButtons = canvas.getByRole('button', { name: /View item details/ });
    await viewButtons.last().waitFor({ state: 'visible', timeout: 15000 });
    await viewButtons.last().click();
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
