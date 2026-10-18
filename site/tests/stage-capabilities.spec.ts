import { test, expect } from '@playwright/test';

test('the two reference capability panels follow and reverse the same scrubbed timeline', async ({ page }) => {
  await page.goto('/stage');
  const host = page.locator('.stage-legacy');
  await expect(host).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  const sample = async (progress: number) => {
    await host.evaluate((el, p) => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * p, behavior: 'instant' }), progress);
    await expect.poll(async () => Number(await host.getAttribute('data-scroll-progress'))).toBeCloseTo(progress, 2);
  };
  const offset = async (key: string) => page.locator(`[data-panel="${key}"] [data-capability-char]`).first().evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);
  await sample(.49);
  expect(Math.abs(await offset('ai-master'))).toBeLessThan(2);
  expect(await offset('code-craft')).toBeGreaterThan(50);
  await expect(page.locator('[data-panel="ai-master"] .stage-capability-points')).toHaveText('Hyper-Efficiency WorkflowMind-to-Reality AI CodingInteractive AI IntegrationGenerative Visual Spectacle');
  await expect.poll(() => page.locator('.stage-capability-image img').first().evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: '../work/stage-capability-ai-master.png' });
  await sample(.87);
  expect(await offset('ai-master')).toBeLessThan(-50);
  expect(Math.abs(await offset('code-craft'))).toBeLessThan(2);
  for (const key of ['ai-master', 'code-craft']) {
    const title = await page.locator(`[data-panel="${key}"] h3`).boundingBox();
    const last = await page.locator(`[data-panel="${key}"] [data-capability-char]`).last().boundingBox();
    expect(last!.x + last!.width).toBeLessThanOrEqual(title!.x + title!.width);
  }
  await page.screenshot({ path: '../work/stage-capability-3d.png' });
  await page.mouse.move(900, 350);
  await expect.poll(() => page.locator('.stage-capability-pictures').evaluate(el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m41))).toBeGreaterThan(3);
  await sample(.49);
  expect(Math.abs(await offset('ai-master'))).toBeLessThan(2);
});

test('reduced motion displays both capability sets in a readable mobile flow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stage');
  for (const name of ['AI MASTER', 'CODE CRAFT']) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../work/stage-capability-mobile.png' });
});


test('mobile scrubbed capability title fits the stage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stage');
  const host = page.locator('.stage-legacy');
  await expect(host).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  await host.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * .87, behavior: 'instant' }));
  await expect.poll(async () => Number(await host.getAttribute('data-scroll-progress'))).toBeCloseTo(.87, 3);
  await expect(page.locator('.stage-capability-pictures')).toBeHidden();
  const legacy = await page.locator('.stage-legacy-title').boundingBox();
  const legacyLetter = await page.locator('[data-legacy-char]').last().boundingBox();
  await expect(page.locator('.stage-legacy-title')).toHaveCSS('overflow', 'hidden');
  expect(legacyLetter!.y + legacyLetter!.height).toBeLessThan(legacy!.y);
  const title = await page.locator('[data-panel="code-craft"] h3').boundingBox();
  expect(title!.x).toBeGreaterThanOrEqual(0);
  expect(title!.x + title!.width).toBeLessThanOrEqual(390);
  const last = await page.locator('[data-panel="code-craft"] [data-capability-char]').last().boundingBox();
  expect(last!.x + last!.width).toBeLessThanOrEqual(title!.x + title!.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../work/stage-capability-mobile-scroll.png' });
});
