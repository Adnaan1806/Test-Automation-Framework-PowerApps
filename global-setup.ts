import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');
const APP_URL = 'https://apps.powerapps.com/play/e/88aafdc6-17fa-4c32-a5b5-35dbdbdf05c0/a/9d4e32af-d89c-4685-abc5-cdaa1913fd0c?tenantId=44f4e7a6-4821-44d7-b286-cd90436c6975&hint=a1f62549-ee5e-4ef6-a14c-97c22de63013&sourcetime=1779346434761&source=portal#';

async function globalSetup(config: FullConfig): Promise<void> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('[Auth Setup] Navigating to PowerApps...');
  await page.goto(APP_URL);

  const loginPage = new LoginPage(page);
  await loginPage.login(
    'bfr-dev.champion.user@bdoapoutlook.onmicrosoft.com',
    'dev@champ4'
  );

  // Wait until PowerApps canvas loads (iframe or app shell appears)
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  console.log('[Auth Setup] Login successful. Saving auth state...');

  await loginPage.saveAuthState(context, AUTH_FILE);
  console.log(`[Auth Setup] Auth state saved to ${AUTH_FILE}`);

  await browser.close();
}

export default globalSetup;
