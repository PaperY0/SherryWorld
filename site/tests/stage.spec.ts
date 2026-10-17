import { test, expect } from '@playwright/test';

test('stage keeps the selected character and signature, with working preferences and replay', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.getByRole('heading', { name: 'A WORLD OF MY OWN.' })).toBeVisible();
  await expect(page.getByAltText('Sherry')).toBeVisible();
  await page.getByRole('button', { name: 'DARK', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByText('AI · BACKEND · AGENT', { exact: true })).toBeVisible();
  await expect(page.locator('.stage-signature')).toHaveAttribute('data-state', 'complete', { timeout: 12000 });
  await page.getByRole('button', { name: 'Replay signature' }).click();
  await expect(page.locator('.stage-signature')).toHaveAttribute('data-state', 'writing');
  await expect(page.locator('.stage-signature')).toHaveAttribute('data-state', 'complete', { timeout: 12000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: '../work/stage-dark-desktop.png' });
  await page.getByRole('button', { name: 'LIGHT', exact: true }).click();
  await page.screenshot({ path: '../work/stage-light-desktop.png' });
});

test('mobile reduced-motion stage is complete and fits the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage');
  await expect(page.locator('.stage-signature')).toHaveAttribute('data-state', 'complete');
  await expect(page.getByAltText('Sherry')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: '../work/stage-mobile.png' });
});
