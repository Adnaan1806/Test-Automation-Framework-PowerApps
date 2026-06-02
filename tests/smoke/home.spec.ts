import { test, expect } from '../../fixtures/baseFixture';

test('Home Page — validates landing, title, greeting, navigation and tasks', async ({ homePage }) => {
  // 1. Authenticated session — title + URL
  await homePage.assertLandedOnHomePage();

  // 2. Exact page title
  expect(await homePage.getPageTitle()).toBe('BFR - Power Apps');

  // 3. Greeting with logged-in user name
  const greeting = await homePage.getGreetingText();
  expect(greeting).toContain('Hello,');
  expect(greeting).toContain('BFR DEV Champion User');

  // 4. Navigation bar + welcome content visible in canvas
  await homePage.assertCanvasContentVisible();

  // 5. My tasks gallery has items
  const taskCount = await homePage.getTaskCount();
  expect(taskCount).toBeGreaterThan(0);
  console.log(`[Home] My tasks: ${taskCount} items`);
});
