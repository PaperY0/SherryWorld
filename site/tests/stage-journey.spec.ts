import { test, expect } from '@playwright/test';

test('dawn long scroll alternates text and reverses its word reveal', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  const chapters = page.locator('.journey-chapter');
  await expect(chapters).toHaveCount(4);
  const positions = await chapters.locator('.journey-chapter-copy').evaluateAll(els => els.map(el => el.getBoundingClientRect().left));
  expect(positions[1]).toBeGreaterThan(positions[0] + 300);
  expect(positions[2]).toBeCloseTo(positions[0], 0);
  const heading = chapters.first().locator('h3');
  const word = heading.locator('[data-journey-word]').first();
  await heading.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .4, behavior: 'instant' }));
  await expect.poll(() => word.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.99);
  await page.screenshot({ path: '../work/stage-journey-desktop.png' });
  await heading.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight, behavior: 'instant' }));
  await expect.poll(() => word.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.01);
});

test('long composition is readable in reduced motion on desktop and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage');
  const journey = page.locator('.stage-journey');
  await journey.scrollIntoViewIfNeeded();
  await expect(journey.getByRole('heading', { name: 'Connected Creation' })).toBeVisible();
  await journey.screenshot({ path: '../work/stage-journey-long.png', style: '.site-header,.stage-ledger{visibility:hidden!important}' });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const heading of await journey.locator('h3').all()) {
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await journey.screenshot({ path: '../work/stage-journey-mobile-long.png', style: '.site-header,.stage-ledger{visibility:hidden!important}' });
});

test('one dawn background spans the screen-to-long-scroll boundary on desktop and mobile', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    const journey = page.locator('.stage-journey');
    await journey.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .45, behavior: 'instant' }));
    await expect.poll(() => page.locator('.explorer-frame').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.01);
    const seam = await journey.evaluate(el => el.getBoundingClientRect().top);
    const background = await page.locator('.explorer-continuous-light').boundingBox();
    expect(background!.y).toBeLessThan(seam - 100);
    expect(background!.y + background!.height).toBeGreaterThan(seam + 100);
    await expect(journey).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.explorer-dawn')).toHaveCSS('background-image', 'none');
    await page.screenshot({ path: `../work/dawn-junction-${width}.png`, style: '.site-header,.stage-ledger{visibility:hidden!important}' });
  }
});
