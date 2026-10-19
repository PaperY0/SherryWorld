import { test, expect } from '@playwright/test';

test('Explorer expands, darkens and reveals dawn with reversible scroll', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  const section = page.locator('.stage-explorer');
  await expect(section).toHaveAttribute('data-film', 'connected');
  const seek = async (progress: number) => {
    await page.locator('.explorer-film-track').evaluate((el, value) => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * value, behavior: 'instant' }), progress);
  };
  const film = page.locator('.explorer-frame video');
  await expect(film).toHaveAttribute('src', '/videos/explorer/fall-awakening-v2.mp4');
  await seek(0);
  await expect.poll(() => page.locator('.explorer-frame').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.01);
  await seek(.13);
  const frame = page.locator('.explorer-frame');
  await expect.poll(async () => { const box = await frame.boundingBox(); return Math.abs(box!.width - box!.height); }).toBeLessThan(1);
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(.2);
  const time = await film.evaluate((el: HTMLVideoElement) => el.currentTime);
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(time + .2);
  await page.screenshot({ path: '../work/explorer-video-square.png' });
  await seek(.6);
  await expect.poll(() => page.locator('.explorer-shade').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.7);
  await page.screenshot({ path: '../work/stage-explorer-dark.png' });
  // Background reaches its settled brightness while the subtitle is still hidden.
  await seek(9.5 / 11.6);
  await expect.poll(() => page.locator('.explorer-continuous-light').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.60);
  await expect.poll(() => page.locator('.explorer-rise-copy').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.01);
  await page.screenshot({ path: '../work/stage-explorer-background-first.png' });
  await seek(.94);
  await expect.poll(() => page.locator('.explorer-rise-copy').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.8);
  await page.screenshot({ path: '../work/stage-explorer-dawn.png' });
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await seek(.65);
  await expect.poll(() => page.locator('.explorer-continuous-light').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.01);
  await expect.poll(() => page.locator('.explorer-rise-copy').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.01);
  await seek(.1);
  await expect.poll(() => page.locator('.explorer-heading').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.9);
  await expect.poll(() => page.locator('.explorer-frame').evaluate(el => el.getBoundingClientRect().width)).toBeLessThan(600);
  await page.screenshot({ path: '../work/stage-explorer-start.png' });
});

test('mobile entrance remains square and plays the supplied second film', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  await page.locator('.explorer-film-track').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * .13, behavior: 'instant' }));
  const frame = page.locator('.explorer-frame');
  await expect.poll(() => frame.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.99);
  const box = await frame.boundingBox();
  expect(Math.abs(box!.width - box!.height)).toBeLessThan(1);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  const film = frame.locator('video');
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(.2);
  expect(await film.evaluate((el: HTMLVideoElement) => el.muted && el.playsInline && !el.loop)).toBe(true);
  await page.screenshot({ path: '../work/explorer-video-square-mobile.png' });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
});
