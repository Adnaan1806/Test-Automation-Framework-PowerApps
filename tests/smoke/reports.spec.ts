import { test, expect } from '../../fixtures/baseFixture';

test('Reports — click Reports button and validate Reports page loads', async ({ homePage, reportsPage, page }) => {
  // Arrange
  await homePage.assertLandedOnHomePage();

  // Act
  const canvas = page.frames().find(f => f.url().includes('runtime-app.powerplatform.com'))!;
  await canvas.getByRole('button', { name: /Reports/ }).click();
  await reportsPage.waitForReportsPage();

  // Assert
  await reportsPage.assertOnReportsPage();
  expect(await page.title()).toBe('BFR - Power Apps');
  console.log(`[Reports] ${await reportsPage.getReportCount()} reports loaded`);
});
