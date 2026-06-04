import 'dotenv/config';
import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { APP_URL } from './constants/config';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

async function globalSetup(config: FullConfig): Promise<void> {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'TEST_EMAIL and TEST_PASSWORD environment variables are required. Copy .env.example to .env and fill in the values.'
    );
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('[Auth Setup] Navigating to PowerApps...');
  await page.goto(APP_URL);

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);

  // Wait for canvas to load — PowerApps never reaches networkidle due to background polling
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  await page.waitForFunction(
    () => !document.body.innerText.includes('Fetching your app'),
    { timeout: 60000 }
  );
  console.log('[Auth Setup] Login successful. Saving auth state...');

  await loginPage.saveAuthState(context, AUTH_FILE);
  console.log(`[Auth Setup] Auth state saved to ${AUTH_FILE}`);

  await browser.close();
}

export default globalSetup;
