import { test, expect } from '@playwright/test';

test('Explorer expands, darkens and reveals dawn with reversible scroll', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  const section = page.locator('.stage-explorer');
  await expect(section).toHaveAttribute('data-film', 'awaiting-film');
  const seek = async (progress: number) => {
    await page.locator('.explorer-film-track').evaluate((el, value) => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * value, behavior: 'instant' }), progress);
  };
  await seek(.6);
  await expect.poll(() => page.locator('.explorer-shade').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.7);
  await page.screenshot({ path: '../work/stage-explorer-dark.png' });
  await seek(.9);
  await expect.poll(() => page.locator('.explorer-rise-copy').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.8);
  await page.screenshot({ path: '../work/stage-explorer-dawn.png' });
  await seek(.1);
  await expect.poll(() => page.locator('.explorer-heading').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.9);
  await expect.poll(() => page.locator('.explorer-frame').evaluate(el => el.getBoundingClientRect().width)).toBeLessThan(600);
  await page.screenshot({ path: '../work/stage-explorer-start.png' });
});
