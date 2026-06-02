import { test } from '../../fixtures/baseFixture';

test('Inspect home page after login', async ({ appPage }) => {
  await appPage.waitForLoadState('networkidle', { timeout: 60000 });

  await appPage.waitForFunction(
    () => !document.body.innerText.includes('Fetching your app'),
    { timeout: 60000 }
  );
  await appPage.waitForTimeout(3000);

  const title = await appPage.title();
  const url = appPage.url();
  console.log('[Inspect] Title:', title);
  console.log('[Inspect] URL:', url);

  const buttons = await appPage.getByRole('button').allTextContents();
  console.log('[Inspect] Shell buttons:', buttons);

  // Inspect the canvas iframe
  const canvasFrame = appPage.frames().find(f => f.url().includes('runtime-app.powerplatform.com'));
  if (canvasFrame) {
    console.log('[Canvas] Frame found:', canvasFrame.url().slice(0, 80));

    const canvasBody = await canvasFrame.locator('body').innerText().catch(() => '');
    console.log('[Canvas] Body text (first 800 chars):\n', canvasBody.slice(0, 800));

    const canvasButtons = await canvasFrame.getByRole('button').allTextContents().catch(() => []);
    console.log('[Canvas] Buttons:', canvasButtons);

    const canvasHeadings = await canvasFrame.getByRole('heading').allTextContents().catch(() => []);
    console.log('[Canvas] Headings:', canvasHeadings);

    const canvasImages = await canvasFrame.getByRole('img').allInnerTexts().catch(() => []);
    console.log('[Canvas] Images/Icons:', canvasImages.slice(0, 10));
  } else {
    console.log('[Canvas] iframe not found yet — frames:', appPage.frames().map(f => f.url().slice(0, 60)));
  }

  await appPage.screenshot({ path: 'reports/home-page.png', fullPage: true });
  console.log('[Inspect] Screenshot saved to reports/home-page.png');
});
