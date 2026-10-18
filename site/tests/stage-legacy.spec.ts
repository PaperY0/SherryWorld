import { test, expect } from '@playwright/test';

test('Legacy grows into the center with reversible scroll and a pinned stage', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false', { timeout: 12000 });
  const section = page.locator('.stage-legacy');
  await expect(section).toHaveAttribute('data-motion-ready', 'true');
  const start = await section.evaluate(el => el.getBoundingClientRect().top + scrollY);
  const sample = async (progress: number) => {
    await page.evaluate(({ start, progress }) => {
      const host = document.querySelector('.stage-legacy')!;
      scrollTo({ top: start + (host.getBoundingClientRect().height - innerHeight) * progress, behavior: 'instant' });
    }, { start, progress });
    await expect.poll(async () => Number(await section.getAttribute('data-scroll-progress'))).toBeCloseTo(progress, 3);
    return page.locator('.stage-legacy-title').boundingBox();
  };
  const legacyRange = Number(await section.getAttribute('data-legacy-range'));
  const first = await sample(0);
  await sample(legacyRange * .45);
  const sizes = await page.locator('[data-legacy-char]').evaluateAll(els => els.map(el => parseFloat(getComputedStyle(el).fontSize)));
  expect(sizes[0]).toBeGreaterThan(sizes[5] + 70);
  expect(sizes.every((size, i) => i === 0 || size <= sizes[i - 1])).toBe(true);
  await page.screenshot({ path: '../work/stage-legacy-stagger.png' });
  const middle = await sample(legacyRange);
  expect(middle!.width).toBeGreaterThan(first!.width * 2);
  expect(Math.abs(middle!.x + middle!.width / 2 - 720)).toBeLessThan(5);
  await expect(page.locator('.stage-legacy-stage')).toHaveCSS('position', 'sticky');
  await expect(page.locator('html')).toHaveAttribute('data-stage-section', 'legacy');
  await page.screenshot({ path: '../work/stage-legacy-desktop.png' });
  await sample(0);
  await expect.poll(async () => Math.abs((await page.locator('.stage-legacy-title').boundingBox())!.width - first!.width)).toBeLessThan(2);
});

test('Legacy remains readable and fits mobile with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage');
  await page.locator('.stage-legacy').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'LEGACY', exact: true })).toBeVisible();
  await expect(page.locator('.stage-legacy-copy')).toBeVisible();
  const title = await page.locator('.stage-legacy-title').boundingBox();
  expect(title!.x).toBeGreaterThanOrEqual(0);
  expect(title!.x + title!.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../work/stage-legacy-mobile.png' });
});
