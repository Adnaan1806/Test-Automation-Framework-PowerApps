import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../constants/config';

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

  async expandGeneralSection(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    // Section headers are clickable rows, not buttons — click the text label
    await canvas.getByText('1. General').click();
    // Wait for an input inside the expanded section to confirm it opened
    await canvas.getByRole('textbox', { name: /Total revenue declared/i })
      .waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillGeneralSection(currency: string, totalRevenue: string): Promise<void> {
    const canvas = await this.getCanvasFrame();

    // 1.3 Reporting currency — button name differs based on selection state
    let currencyBtn = canvas.getByRole('button', { name: 'Reporting currency. Selected' });
    if ((await currencyBtn.count()) === 0) {
      currencyBtn = canvas.getByRole('button', { name: 'Reporting currency' });
    }
    await currencyBtn.click();

    // Detect what's currently selected — clicking an already-selected option deselects it (empty)
    const options = canvas.getByRole('option');
    let currentValue = '';
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      if ((await options.nth(i).getAttribute('aria-selected')) === 'true') {
        currentValue = ((await options.nth(i).textContent()) ?? '').trim();
        break;
      }
    }

    // If the target is already selected, pick any other option to avoid deselection
    const allText = (await options.allTextContents()).map(t => t.trim());
    const target = currentValue === currency
      ? (allText.find(t => t !== currency) ?? '')
      : currency;

    if (!target) throw new Error('No selectable currency option found');
    await canvas.getByRole('option', { name: target }).click();

    // 1.5 Total revenue declared — text input
    const revenueField = canvas.getByRole('textbox', { name: /Total revenue declared/i });
    await revenueField.clear();
    await revenueField.fill(totalRevenue);
  }

  async saveGeneralSection(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    // Section-level Save button — exclude "Save All" by matching exact "Save" only
    await canvas.getByRole('button', { name: /^Save$/ }).first().click();
  }

  async assertGeneralSectionSaved(): Promise<void> {
    // Success notification renders on the main page, outside the canvas iframe
    await expect(this.page.getByText('Form saved: General')).toBeVisible({ timeout: TIMEOUTS.save });
  }
}
