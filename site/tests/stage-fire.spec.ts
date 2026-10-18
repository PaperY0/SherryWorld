import { test, expect } from '@playwright/test';

test('pink fire chapter reveals the three selected directions', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false', { timeout: 12000 });
  await page.locator('.stage-facts').scrollIntoViewIfNeeded();
  await expect(page.locator('.stage-facts .stage-fire-image').first()).toBeVisible();
  for (const name of ['CRAFTER', 'EXPLORER', 'WEAVER']) {
    const row = page.locator('.stage-direction').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await row.scrollIntoViewIfNeeded();
    await expect(row).toHaveAttribute('data-revealed', 'true', { timeout: 7000 });
  }
  await expect(page.locator('.stage-direction p').first()).toHaveText('I wield AI and code to materialize every realm and concept imagined within my mind.');
  await page.screenshot({ path: '../work/stage-fire-directions.png' });
  await expect(page.locator('.stage-about-heading')).toHaveCSS('font-weight', '500');
});

test('reduced-motion mobile directions use a static transition without overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stage');
  await page.locator('.stage-facts').scrollIntoViewIfNeeded();
  await expect(page.locator('.stage-fire-image')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'EXPLORER', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../work/stage-fire-mobile.png' });
});


test('direction descriptions use the same word reveal timing as the upper paragraph', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false', { timeout: 12000 });
  const timings = await page.locator('.stage-direction p').first().evaluate(el => [...el.querySelectorAll('span')].map(piece => {
    const effect = piece.getAnimations()[0].effect as KeyframeEffect;
    return { duration: effect.getTiming().duration, delay: effect.getTiming().delay, frames: effect.getKeyframes() };
  }));
  expect(timings.length).toBeGreaterThan(10);
  expect(timings.every(t => t.duration === 3000)).toBe(true);
  expect(new Set(timings.map(t => t.delay)).size).toBe(timings.length);
  expect(timings[0].frames[0].filter).toBe('blur(4px)');
});
