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
  await expect(film).toHaveAttribute('src', '/videos/explorer/fall-awakening-v4.mp4');
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

test('mobile entrance remains square and plays the latest supplied film', async ({ page }) => {
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


test('film expands from a centered square to all four viewport edges, including reverse and resize', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  const frame = page.locator('.explorer-frame');
  const seek = async (progress: number) => {
    await page.locator('.explorer-film-track').evaluate((el, p) => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * p, behavior: 'instant' }), progress);
    await expect.poll(async () => Number(await page.locator('.stage-explorer').getAttribute('data-explorer-progress'))).toBeCloseTo(progress, 3);
  };
  for (const viewport of [{width:1958,height:891}, {width:390,height:844}]) {
    await page.setViewportSize(viewport);
    await seek(.13);
    await expect.poll(async () => {const b=await frame.boundingBox();return Math.abs(b!.x+b!.width/2-viewport.width/2);}).toBeLessThan(2);
    await seek(.25);
    await expect.poll(async () => {const b=await frame.boundingBox();return Math.abs(b!.x+b!.width/2-viewport.width/2);}).toBeLessThan(2);
    await page.screenshot({path:`../work/explorer-expanding-${viewport.width}.png`});
    await seek(.35);
    await expect.poll(async () => {
      const b=await frame.boundingBox();
      return Math.max(Math.abs(b!.x),Math.abs(b!.y),Math.abs(b!.width-viewport.width),Math.abs(b!.height-viewport.height));
    }).toBeLessThan(2);
    const image = await frame.locator('video').boundingBox();
    expect(Math.abs(image!.x)).toBeLessThan(2);
    expect(Math.abs(image!.y)).toBeLessThan(2);
    expect(Math.abs(image!.width-viewport.width)).toBeLessThan(2);
    await page.screenshot({path:`../work/explorer-fullscreen-${viewport.width}.png`});
    await seek(.13);
    await expect.poll(async () => { const b=await frame.boundingBox(); return Math.abs(b!.width-b!.height); }).toBeLessThan(2);
    const b=await frame.boundingBox();
    expect(Math.abs(b!.x+b!.width/2-viewport.width/2)).toBeLessThan(2);
  }
});
