import { test } from '../../fixtures/baseFixture';
import testData from '../../data/testData.json';

test(`Search for "${testData.reports.searchTerm}" and verify report title on detail page`, async ({
  homePage, reportsPage, reportDetailPage
}) => {
  // Arrange — land on home, navigate to Reports
  await homePage.assertLandedOnHomePage();
  await homePage.navigateToReports();
  await reportsPage.waitForReportsPage();

  // Act — search and open the report
  await reportsPage.searchReport(testData.reports.searchTerm);
  await reportsPage.clickFirstReportResult();
  await reportDetailPage.waitForReportToLoad();

  // Assert — validate the report title heading
  await reportDetailPage.assertReportTitle(testData.reports.expectedReportTitle);
  await reportDetailPage.assertOnReportDetailPage();
});
