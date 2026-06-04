import { test, expect } from '../../fixtures/baseFixture';
import testData from '../../data/testData.json';

test.describe('2. Audit and assurance revenue section', () => {
  test.beforeEach(async ({ homePage, reportsPage, reportDetailPage }) => {
    await homePage.assertLandedOnHomePage();
    await homePage.navigateToReports();
    await reportsPage.waitForReportsPage();
    await reportsPage.searchReport(testData.reports.searchTerm);
    await reportsPage.clickFirstReportResult();
    await reportDetailPage.waitForReportToLoad();
    await reportDetailPage.expandAuditSection();
  });

  test('Fill all fields with EEA = Yes, save and assert success', async ({ reportDetailPage }) => {
    // Act
    await reportDetailPage.fillAuditSection(testData.auditSection);
    await reportDetailPage.saveAuditSection();

    // Assert
    await reportDetailPage.assertAuditSectionSaved();
  });

  test('2.7 Total equals sum of 2.1 + 2.2 + 2.4 + 2.5', async ({ reportDetailPage }) => {
    // Arrange — fill inputs so 2.7 is populated
    await reportDetailPage.fillAuditSection(testData.auditSection);

    // Act — read the calculated total from the UI
    const displayedTotal = await reportDetailPage.getAuditTotal();

    // Assert — matches our known expected sum
    expect(displayedTotal).toBe(testData.auditSection.expectedTotal);
  });

  test('2.8.1 Combined turnover hidden when EEA = No', async ({ reportDetailPage }) => {
    // Act — fill section but override EEA to No (combinedTurnover omitted)
    await reportDetailPage.fillAuditSection({
      ...testData.auditSection,
      isEEA: 'No',
      combinedTurnover: undefined,
    });

    // Assert — conditional field must not be visible
    await reportDetailPage.assertCombinedTurnoverHidden();
  });

  test('Section status shows In progress when a required field is empty and saved', async ({ reportDetailPage }) => {
    // Arrange — all fields filled except 2.4 Reviews (left blank)
    await reportDetailPage.fillAuditSection(testData.auditSectionPartial);

    // Act
    await reportDetailPage.saveAuditSection();

    // Assert — incomplete form shows "In progress" not "Completed"
    await reportDetailPage.assertAuditSectionStatusInProgress();
  });

  test('Section status shows Validation error when invalid values are saved', async ({ reportDetailPage }) => {
    // Arrange — values that violate all three validation rules (2.3>2.2, 2.6>2.5, 2.8.1>2.7 Total)
    await reportDetailPage.fillAuditSection(testData.auditSectionInvalid);

    // Act — Save is still enabled because the EEA toggle guaranteed a dirty state
    await reportDetailPage.saveAuditSection();

    // Assert
    await reportDetailPage.assertAuditSectionStatusValidationError();
  });

  test('Section status shows Completed after all fields are filled and saved', async ({ reportDetailPage }) => {
    // Arrange & Act — fill all fields and save
    await reportDetailPage.fillAuditSection(testData.auditSection);
    await reportDetailPage.saveAuditSection();

    // Assert — section header badge in the canvas changes to "Completed"
    await reportDetailPage.assertAuditSectionStatusCompleted();
  });

  test('Each input field accepts 14 digits and total correctly displays the large sum', async ({ reportDetailPage }) => {
    const d = testData.auditSectionMaxDigits;

    // Act — fill all six inputs with the maximum 14-digit value (99999999999999)
    // Constraints satisfied: 2.3 = 2.2 and 2.6 = 2.5 (equal is allowed)
    await reportDetailPage.fillAuditSection(d);

    // Assert 1 — every editable input retained the full 14-digit value (no truncation)
    await reportDetailPage.assertAllAuditInputsRetainValue(d.audits);

    // Assert 2 — 2.7 Total shows the correct calculated sum
    // 4 inputs × 99999999999999 = 399999999999996 (15 digits, within the field's 16-digit capacity)
    const total = await reportDetailPage.getAuditTotal();
    expect(total).toBe(d.expectedTotal);
  });

  test('Validation errors appear when sub-fields exceed their parent field values', async ({ reportDetailPage }) => {
    // Arrange — values designed to trigger all three validation rules:
    //   2.3 PIE (7287) > 2.2 Audits (77)          → error under 2.3
    //   2.6 ESG (4525) > 2.5 Other assurance (528) → error under 2.6
    //   2.8.1 turnover (8938) > 2.7 Total (605)    → error under 2.8.1
    await reportDetailPage.fillAuditSection(testData.auditSectionInvalid);

    // Assert — all three validation messages visible simultaneously
    await reportDetailPage.assertPIEValidationError();
    await reportDetailPage.assertESGValidationError();
    await reportDetailPage.assertCombinedTurnoverValidationError();
  });
});
