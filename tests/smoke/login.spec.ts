import { test, expect } from '../../fixtures/baseFixture';

test.describe('PowerApps - Login & Home Page', () => {

  test('Should load PowerApps home page without re-authenticating', async ({ appPage }) => {
    // Assert the app loaded — not the Microsoft login screen
    await expect(appPage).not.toHaveURL(/login\.microsoftonline\.com/, { timeout: 10000 });
    await expect(appPage).not.toHaveURL(/login\.live\.com/, { timeout: 5000 });

    // App shell should be visible
    await expect(appPage.locator('body')).toBeVisible();

    console.log('[Smoke] Current URL:', appPage.url());
  });

  test('Should confirm authenticated session is active', async ({ appPage }) => {
    const currentUrl = appPage.url();

    expect(currentUrl).toContain('powerapps.com');
    console.log('[Smoke] Authenticated session confirmed at:', currentUrl);
  });

});
