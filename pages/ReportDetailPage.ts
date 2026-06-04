import { Page, Locator, expect } from '@playwright/test';
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

  async assertGeneralSectionStatus(expectedStatus: string): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(
      canvas.getByText(`1. General ${expectedStatus}`)
    ).toBeVisible({ timeout: TIMEOUTS.save });
  }

  async assertGeneralSectionStatusCompleted(): Promise<void> {
    await this.assertGeneralSectionStatus('Completed');
  }

  async assertGeneralSectionStatusInProgress(): Promise<void> {
    await this.assertGeneralSectionStatus('In progress');
  }

  // ---------------------------------------------------------------------------
  // Section 2 — Audit and assurance revenue
  // ---------------------------------------------------------------------------

  async expandAuditSection(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await canvas.getByText('2. Audit and assurance revenue').click();
    // Wait for the first input field to confirm the section opened
    await canvas.getByRole('textbox', { name: /Related service engagements/i })
      .waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillAuditSection(data: {
    relatedServiceEngagements: string;
    audits: string;
    pieAudits: string;
    reviews: string;
    otherAssurance: string;
    esgAssurance: string;
    isEEA: string;
    combinedTurnover?: string;
  }): Promise<void> {
    const canvas = await this.getCanvasFrame();

    // Some controls have aria-label "SAA" — use getByTitle() which reads the HTML
    // title attribute (set by PowerApps) and always contains the descriptive name.
    const fill = async (locator: Locator, value: string) => {
      await locator.clear();
      await locator.fill(value);
    };

    await fill(canvas.getByRole('textbox', { name: /Related service engagements/i }), data.relatedServiceEngagements);
    await fill(canvas.getByTitle('2.2 Audits'), data.audits);
    await fill(canvas.getByRole('textbox', { name: /2\.3 Of which audits at Public/i }), data.pieAudits);
    await fill(canvas.getByRole('textbox', { name: /Reviews/i }), data.reviews);
    await fill(canvas.getByRole('textbox', { name: /Other assurance engagements/i }), data.otherAssurance);
    await fill(canvas.getByRole('textbox', { name: /2\.6 Of which ESG assurance/i }), data.esgAssurance);

    // 2.8 EEA dropdown — button innerText() gives "Yes" or "No" directly.
    // PowerApps only enables Save when a field value actually changes from its saved state.
    // If the desired value is already selected we must toggle away first to mark the form dirty,
    // then restore to the desired value.
    const eeaBtn = canvas.getByRole('button', { name: /SAA|Yes|No/i });
    const currentEEA = (await eeaBtn.innerText()).trim();
    const oppositeEEA = data.isEEA === 'Yes' ? 'No' : 'Yes';

    if (currentEEA === data.isEEA) {
      // Already correct value — toggle away to make form dirty, then restore
      await eeaBtn.click();
      await canvas.getByRole('option', { name: oppositeEEA, exact: true }).click();
    }
    // Set to desired value (always runs — either as the first change, or as the restore)
    await canvas.getByRole('button', { name: /SAA|Yes|No/i }).click();
    await canvas.getByRole('option', { name: data.isEEA, exact: true }).click();

    // 2.8.1 — only rendered when EEA = Yes
    if (data.isEEA === 'Yes' && data.combinedTurnover) {
      const combinedField = canvas.getByRole('textbox', { name: /2\.8\.1 Combined turnover/i });
      await combinedField.waitFor({ state: 'visible', timeout: 10000 });
      await fill(combinedField, data.combinedTurnover);
    }
  }

  async getAuditTotal(): Promise<number> {
    const canvas = await this.getCanvasFrame();
    // 2.7 Total is readonly; title attribute holds the label even though aria-label is "SAA"
    const raw = await canvas.getByTitle('2.7 Total').inputValue();
    return parseFloat(raw.replace(/[^0-9.]/g, ''));
  }

  async saveAuditSection(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await canvas.getByRole('button', { name: /^Save$/ }).first().click();
  }

  async assertAuditSectionSaved(): Promise<void> {
    // Toast on the main page (outside canvas)
    await expect(
      this.page.getByText('Form saved: Audit and assurance revenue')
    ).toBeVisible({ timeout: TIMEOUTS.save });
    await this.assertAuditSectionStatusCompleted();
  }

  async assertAuditSectionStatus(expectedStatus: string): Promise<void> {
    // Section status badge is a generic element adjacent to the section name in the canvas
    const canvas = await this.getCanvasFrame();
    await expect(
      canvas.getByText(`Audit and assurance revenue ${expectedStatus}`)
    ).toBeVisible({ timeout: TIMEOUTS.save });
  }

  async assertAuditSectionStatusCompleted(): Promise<void> {
    await this.assertAuditSectionStatus('Completed');
  }

  async assertAuditSectionStatusInProgress(): Promise<void> {
    await this.assertAuditSectionStatus('In progress');
  }

  async assertAuditSectionStatusValidationError(): Promise<void> {
    await this.assertAuditSectionStatus('Validation error');
  }

  async assertCombinedTurnoverHidden(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(
      canvas.getByRole('textbox', { name: /Combined turnover from statutory audits/i })
    ).not.toBeVisible();
  }

  // Boundary assertions

  async assertAllAuditInputsRetainValue(expectedValue: string): Promise<void> {
    const canvas = await this.getCanvasFrame();
    const fields = [
      canvas.getByRole('textbox', { name: /Related service engagements/i }),
      canvas.getByTitle('2.2 Audits'),
      canvas.getByRole('textbox', { name: /2\.3 Of which audits at Public/i }),
      canvas.getByRole('textbox', { name: /Reviews/i }),
      canvas.getByRole('textbox', { name: /Other assurance engagements/i }),
      canvas.getByRole('textbox', { name: /2\.6 Of which ESG/i }),
    ];
    for (const field of fields) {
      await expect(field).toHaveValue(expectedValue);
    }
  }

  // Validation error assertions — messages render inside the canvas frame below each field

  async assertPIEValidationError(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(
      canvas.getByText('Value can not be greater than Audits value')
    ).toBeVisible();
  }

  async assertESGValidationError(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(
      canvas.getByText('Value can not be greater than Other assurance engagements')
    ).toBeVisible();
  }

  async assertCombinedTurnoverValidationError(): Promise<void> {
    const canvas = await this.getCanvasFrame();
    await expect(
      canvas.getByText('Value can not be greater than A&A revenue total')
    ).toBeVisible();
  }
}
