import { test, expect } from '@playwright/test';

const copy = 'Guided by an innate curiosity, I distill inspiration from the journeys and culinary textures of the physical world. This appetite for the unknown compels me to continually challenge the frontiers of my intellect and technical mastery. Wielding AI and code, I transmute abstract visions into tangible reality—and from this confluence of lived experience and digital creation, a multidimensional self emerges.';

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
  await page.locator('.stage-about-copy').evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const paragraph = await page.locator('.stage-about-copy').boundingBox();
  const ledger = await page.locator('.stage-ledger').boundingBox();
  expect(paragraph!.y + paragraph!.height).toBeLessThan(ledger!.y);
  await page.screenshot({ path: '../work/stage-about-copy.png' });
});

test('the bottom ledger stays in the same viewport position while scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage');
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false');
  const bar = page.locator('.stage-ledger');
  await expect(bar).toHaveCSS('position', 'fixed');
  const first = await bar.boundingBox();
  await page.locator('.stage-direction').last().scrollIntoViewIfNeeded();
  const second = await bar.boundingBox();
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);
  await expect(bar).toBeInViewport();
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
