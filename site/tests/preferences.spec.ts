import { test, expect } from '@playwright/test';

test('Chinese and English content switch together and survive reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { name: '关于我', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'ABOUT ME', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'PROJECT DIRECTORY', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'ABOUT ME', exact: true })).toBeVisible();
});

test('theme and locale are independent and switching preserves position', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error' && /hydration|hydrated|server rendered/i.test(message.text())) errors.push(message.text()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'DARK', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#about').scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  expect(Math.abs(await page.evaluate(() => window.scrollY) - before)).toBeLessThan(10);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(errors).toEqual([]);
});

test('switching back to Chinese updates content, title and control labels', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Page language', exact: true })).toBeVisible();
  await expect(page).toHaveTitle('PaperY · A world of my own');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.getByRole('heading', { name: '关于我', exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: '页面语言', exact: true })).toBeVisible();
  await expect(page).toHaveTitle('PaperY · 文书颖的个人世界');
});

test('system changes apply until a visitor makes an explicit theme choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'LIGHT', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('first visit follows dark system preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'DARK', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('unavailable storage does not disable switching', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'DARK', exact: true }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('invalid saved settings fall back to safe defaults', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    localStorage.setItem('sherry-theme', 'broken'); localStorage.setItem('sherry-locale', 'broken');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
});

test('mobile controls, portrait and translated content fit the screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'DARK', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const image = page.locator('.portrait-image');
  await expect(image).toBeVisible();
  expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.getByRole('link', { name: 'EXPLORE', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ABOUT ME', exact: true })).toBeInViewport();
});
