import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ReportsPage } from '../pages/ReportsPage';
import { ReportDetailPage } from '../pages/ReportDetailPage';
import { APP_URL } from '../constants/config';

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
