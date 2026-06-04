import { test } from '../../fixtures/baseFixture';
import testData from '../../data/testData.json';

test.describe('1. General section', () => {
  test.beforeEach(async ({ homePage, reportsPage, reportDetailPage }) => {
    await homePage.assertLandedOnHomePage();
    await homePage.navigateToReports();
    await reportsPage.waitForReportsPage();
    await reportsPage.searchReport(testData.reports.searchTerm);
    await reportsPage.clickFirstReportResult();
    await reportDetailPage.waitForReportToLoad();
    await reportDetailPage.expandGeneralSection();
  });

  test('Expand, fill, save and assert success message', async ({ reportDetailPage }) => {
    // Act
    await reportDetailPage.fillGeneralSection(
      testData.generalSection.reportingCurrency,
      testData.generalSection.totalRevenueDeclared
    );
    await reportDetailPage.saveGeneralSection();

    // Assert
    await reportDetailPage.assertGeneralSectionSaved();
  });

  test('Section status shows Completed when all fields are filled and saved', async ({ reportDetailPage }) => {
    // Act
    await reportDetailPage.fillGeneralSection(
      testData.generalSection.reportingCurrency,
      testData.generalSection.totalRevenueDeclared
    );
    await reportDetailPage.saveGeneralSection();

    // Assert
    await reportDetailPage.assertGeneralSectionStatusCompleted();
  });

  test('Section status shows In progress when a required field is empty and saved', async ({ reportDetailPage }) => {
    // Arrange — currency set, total revenue left blank
    await reportDetailPage.fillGeneralSection(
      testData.generalSectionPartial.reportingCurrency,
      testData.generalSectionPartial.totalRevenueDeclared
    );

    // Act
    await reportDetailPage.saveGeneralSection();

    // Assert
    await reportDetailPage.assertGeneralSectionStatusInProgress();
  });
});
