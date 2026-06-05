import { test, expect } from '../../fixtures/baseFixture';
import testData from '../../data/testData.json';

test.describe('3. Tax revenue section', () => {
  test.beforeEach(async ({ homePage, reportsPage, reportDetailPage }) => {
    await homePage.assertLandedOnHomePage();
    await homePage.navigateToReports();
    await reportsPage.waitForReportsPage();
    await reportsPage.searchReport(testData.reports.searchTerm);
    await reportsPage.clickFirstReportResult();
    await reportDetailPage.waitForReportToLoad();
    await reportDetailPage.expandTaxSection();
  });

  test('Fill all fields, save and assert success', async ({ reportDetailPage }) => {
    // Act
    await reportDetailPage.fillTaxSection(testData.taxSection);
    await reportDetailPage.saveTaxSection();

    // Assert
    await reportDetailPage.assertTaxSectionSaved();
  });

  test('3.11 Total equals sum of 3.1 through 3.10', async ({ reportDetailPage }) => {
    // Arrange — fill all inputs so 3.11 is populated
    await reportDetailPage.fillTaxSection(testData.taxSection);

    // Act — read the calculated total from the UI
    const displayedTotal = await reportDetailPage.getTaxTotal();

    // Assert — must match the known expected sum
    expect(displayedTotal).toBe(testData.taxSection.expectedTotal);
  });

  test('Section status shows Completed after all fields are filled and saved', async ({ reportDetailPage }) => {
    // Uses taxSectionAlt (different 14-digit values per field) so this test's
    // saved state always differs from test 1's taxSection — keeping Save enabled
    // regardless of run order.
    await reportDetailPage.fillTaxSection(testData.taxSectionAlt);
    await reportDetailPage.saveTaxSection();

    await reportDetailPage.assertTaxSectionStatusCompleted();
  });

  test('Section status shows In progress when a required field is empty and saved', async ({ reportDetailPage }) => {
    // Arrange — all fields filled except 3.5 Indirect tax (left blank)
    await reportDetailPage.fillTaxSection(testData.taxSectionPartial);

    // Act
    await reportDetailPage.saveTaxSection();

    // Assert — incomplete form must not show Completed
    await reportDetailPage.assertTaxSectionStatusInProgress();
  });

  test('Success message appears after saving the section', async ({ reportDetailPage }) => {
    // Arrange — taxSection differs from taxSectionPartial (last save) so Save is enabled
    await reportDetailPage.fillTaxSection(testData.taxSection);

    // Act
    await reportDetailPage.saveTaxSection();

    // Assert — toast must appear on the main page outside the canvas
    await reportDetailPage.assertTaxSavedSuccessMessage();
  });

  test('Each input accepts 14 digits and total correctly displays the large sum', async ({ reportDetailPage }) => {
    const d = testData.taxSectionMaxDigits;

    // Fill all ten inputs with distinct 14-digit values; fillTaxSection blurs the last
    // field via Tab so the PowerApps formula recalculates 3.11 Total client-side
    await reportDetailPage.fillTaxSection(d);

    // Poll until the total reflects the entered values (formula may update asynchronously)
    await expect.poll(() => reportDetailPage.getTaxTotal(), { timeout: 15000 })
      .toBe(d.expectedTotal);
  });
});
