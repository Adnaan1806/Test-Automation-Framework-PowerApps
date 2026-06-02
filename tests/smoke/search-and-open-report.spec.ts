import { test } from '../../fixtures/baseFixture';

test('Search for "fiji 2030" and verify report title on detail page', async ({
  homePage, reportsPage, reportDetailPage, page
}) => {
  // Arrange — land on home, navigate to Reports
  await homePage.assertLandedOnHomePage();
  const canvas = page.frames().find(f => f.url().includes('runtime-app.powerplatform.com'))!;
  await canvas.getByRole('button', { name: /Reports/ }).click();
  await reportsPage.waitForReportsPage();

  // Act — search and open the report
  await reportsPage.searchReport('fiji 2030');
  await reportsPage.clickFirstReportResult();
  await reportDetailPage.waitForReportToLoad();

  // Assert — validate the report title heading
  await reportDetailPage.assertReportTitle('Fiji 2030 Statistics Report');

  // Stay on the report page for 5 seconds (visual confirmation)
  await page.waitForTimeout(5000);
});
