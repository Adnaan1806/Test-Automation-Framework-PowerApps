import { test } from '../../fixtures/baseFixture';

test('Inspect search and report detail', async ({ homePage, reportsPage, page }) => {
  await homePage.assertLandedOnHomePage();

  const canvas = page.frames().find(f => f.url().includes('runtime-app.powerplatform.com'))!;

  // Navigate to Reports
  await canvas.getByRole('button', { name: /Reports/ }).click();
  await reportsPage.waitForReportsPage();

  // Find search input
  const allInputs = await canvas.locator('input').all();
  for (const input of allInputs) {
    const placeholder = await input.getAttribute('placeholder').catch(() => '');
    const ariaLabel = await input.getAttribute('aria-label').catch(() => '');
    console.log('[Search] Input placeholder:', placeholder, '| aria-label:', ariaLabel);
  }

  // Try searching
  const searchInput = canvas.getByPlaceholder(/Search/i)
    .or(canvas.getByLabel(/Search/i))
    .or(canvas.locator('input[type="search"]'))
    .first();

  await searchInput.fill('fiji 2030');
  await page.waitForTimeout(2000);

  const bodyAfterSearch = await canvas.locator('body').innerText().catch(() => '');
  console.log('[Search] Results (first 600 chars):\n', bodyAfterSearch.slice(0, 600));

  const buttons = (await canvas.getByRole('button').allTextContents())
    .map(b => b.trim()).filter(b => b.length > 0);
  console.log('[Search] Buttons after search:', buttons.slice(0, 10));

  // Click first result
  const viewButtons = canvas.getByRole('button', { name: /View item details/ });
  const count = await viewButtons.count();
  console.log('[Search] View item buttons:', count);
  if (count > 0) {
    await viewButtons.first().click();
    await page.waitForTimeout(3000);

    const afterClick = await canvas.locator('body').innerText().catch(() => '');
    console.log('[Detail] Canvas body (first 800 chars):\n', afterClick.slice(0, 800));

    const detailButtons = (await canvas.getByRole('button').allTextContents())
      .map(b => b.trim()).filter(b => b.length > 0);
    console.log('[Detail] Buttons:', detailButtons.slice(0, 15));
  }

  await page.screenshot({ path: 'reports/search-result.png', fullPage: true });
});
