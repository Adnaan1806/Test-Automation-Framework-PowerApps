import { test } from '../../fixtures/baseFixture';
import testData from '../../data/testData.json';

test('General section — expand, fill, save and assert success message', async ({
  homePage, reportsPage, reportDetailPage
}) => {
  // Arrange — navigate to the report
  await homePage.assertLandedOnHomePage();
  await homePage.navigateToReports();
  await reportsPage.waitForReportsPage();
  await reportsPage.searchReport(testData.reports.searchTerm);
  await reportsPage.clickFirstReportResult();
  await reportDetailPage.waitForReportToLoad();

  // Act — expand section, fill fields, save
  await reportDetailPage.expandGeneralSection();
  await reportDetailPage.fillGeneralSection(
    testData.generalSection.reportingCurrency,
    testData.generalSection.totalRevenueDeclared
  );
  await reportDetailPage.saveGeneralSection();

  // Assert — success notification visible
  await reportDetailPage.assertGeneralSectionSaved();
});
