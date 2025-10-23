import { test, expect } from '@playwright/test';

test('homepage has expected title and screenshot', async ({ page }) => {
  await page.goto('https://cipc-agent.vercel.app/');

  // Take a screenshot of the page.
  await page.screenshot({ path: 'tests/live-site-screenshot.png' });

  // Print the title to the console.
  console.log('Page title:', await page.title());

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CIPC Agent/);
});