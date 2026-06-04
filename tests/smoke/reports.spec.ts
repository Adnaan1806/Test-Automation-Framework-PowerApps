import { test, expect } from '../../fixtures/baseFixture';

test('Reports — click Reports button and validate Reports page loads', async ({ homePage, reportsPage, page }) => {
  // Arrange
  await homePage.assertLandedOnHomePage();

  // Act
  await homePage.navigateToReports();
  await reportsPage.waitForReportsPage();

  // Assert
  await reportsPage.assertOnReportsPage();
  expect(await page.title()).toBe('BFR - Power Apps');
  console.log(`[Reports] ${await reportsPage.getReportCount()} reports loaded`);
});
