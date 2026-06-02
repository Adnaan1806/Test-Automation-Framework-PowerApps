import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120000,

  reporter: [
    ['html', { outputFolder: 'reports', open: 'never' }],
    ['list'],
  ],

  use: {
    storageState: AUTH_FILE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 30000,
    navigationTimeout: 60000,
    headless: false,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
    },
  ],
});
