import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ReportsPage } from '../pages/ReportsPage';
import { ReportDetailPage } from '../pages/ReportDetailPage';

const APP_URL = 'https://apps.powerapps.com/play/e/88aafdc6-17fa-4c32-a5b5-35dbdbdf05c0/a/9d4e32af-d89c-4685-abc5-cdaa1913fd0c?tenantId=44f4e7a6-4821-44d7-b286-cd90436c6975&hint=a1f62549-ee5e-4ef6-a14c-97c22de63013&sourcetime=1779346434761&source=portal#';

type Fixtures = {
  loginPage: LoginPage;
  appPage: Page;
  homePage: HomePage;
  reportsPage: ReportsPage;
  reportDetailPage: ReportDetailPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  appPage: async ({ page }, use) => {
    await page.goto(APP_URL);
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await use(page);
  },

  homePage: async ({ page }, use) => {
    await page.goto(APP_URL);
    const home = new HomePage(page);
    await home.waitForAppReady();
    await use(home);
  },

  reportsPage: async ({ page }, use) => {
    await use(new ReportsPage(page));
  },

  reportDetailPage: async ({ page }, use) => {
    await use(new ReportDetailPage(page));
  },
});

export { expect } from '@playwright/test';
