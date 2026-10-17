import { test, expect } from '@playwright/test';

const copy = "I don't just build websites I create experiences that people enjoy exploring. From the first impression to the smallest interaction, I care about the details that make a website feel smooth, memorable, and worth coming back to.";

test('scrolling enters the reference-style About without replaying the loader', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false', { timeout: 12000 });
  await page.locator('#stage-about').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'THIS WILL FEEL DIFFERENT', exact: true })).toBeInViewport();
  await expect(page.locator('.stage-about-copy')).toHaveText(copy);
  await expect(page.locator('.stage-about-heading')).toHaveAttribute('data-revealed', 'true');
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await page.screenshot({ path: '../work/stage-about-desktop.png' });
  await page.locator('.stage-about-copy').scrollIntoViewIfNeeded();
  await expect(page.locator('.stage-about-copy')).toHaveAttribute('data-revealed', 'true');
  await page.screenshot({ path: '../work/stage-about-copy.png' });
});

test('mobile reduced-motion About keeps the exact copy readable without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage');
  await page.locator('#stage-about').scrollIntoViewIfNeeded();
  await expect(page.locator('.stage-about-copy')).toHaveText(copy);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../work/stage-about-mobile.png' });
});
