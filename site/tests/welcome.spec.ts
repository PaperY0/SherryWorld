import { test, expect } from '@playwright/test';

test('scroll plays the real gesture once, then reveals title and Explore', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const stage = page.locator('.welcome-stage');
  const clip = page.locator('video[data-clip="welcome"]');
  await expect(stage).toHaveAttribute('data-phase', 'idle', { timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'MY WORLD', exact: true })).not.toBeVisible();
  await page.mouse.wheel(0, 220);
  await expect(stage).toHaveAttribute('data-phase', 'gesture');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('#about')).toHaveCount(0);
  await expect.poll(() => clip.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  await expect(stage).toHaveAttribute('data-phase', 'ready', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.mouse.wheel(0, 900);
  await page.keyboard.press('PageDown');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: '../work/welcome-desktop-ready.png' });
  await page.getByRole('link', { name: 'EXPLORE', exact: true }).click();
  await expect(page.getByRole('heading', { name: '关于我', exact: true })).toBeInViewport();
});

test('reduced motion offers an immediate route into the world without playing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'EXPLORE', exact: true })).toBeVisible();
  await expect(page.locator('.welcome-stage')).toHaveAttribute('data-phase', 'ready');
  expect(await page.locator('video[data-clip="welcome"]').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('autoplay refusal keeps an Explore-only route into the world', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      return Promise.reject(new DOMException('Playback needs user activation', 'NotAllowedError'));
    };
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: '播放欢迎视频', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '跳过动画', exact: true }).click();
  await expect(page.locator('#about')).toHaveCount(0);
  await page.getByRole('link', { name: 'EXPLORE', exact: true }).click();
  await expect(page.getByRole('heading', { name: '关于我', exact: true })).toBeInViewport();
});

test('failed media keeps a usable poster and route instead of trapping visitors', async ({ page }) => {
  await page.route('**/videos/welcome/welcome-light.mp4', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'EXPLORE', exact: true })).toBeVisible();
  await expect(page.locator('.welcome-poster')).toBeVisible();
});

test('mobile touch alternative and language/theme controls remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'DARK', exact: true }).click();
  await page.getByRole('button', { name: 'Enter my world', exact: true }).click();
  await expect(page.getByRole('link', { name: 'EXPLORE', exact: true })).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '../work/welcome-mobile-dark-ready.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'EXPLORE', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ABOUT ME', exact: true })).toBeInViewport();
});

test('stable idle does not seek-loop and an early gesture request preserves the opening', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.welcome-stage')).toHaveAttribute('data-phase', 'opening');
  await page.getByRole('button', { name: '开启我的世界', exact: true }).click();
  await expect(page.locator('.welcome-stage')).toHaveAttribute('data-phase', 'opening');
  await expect(page.locator('.welcome-stage')).toHaveAttribute('data-phase', 'gesture', { timeout: 10000 });
  await expect(page.locator('.welcome-stage')).toHaveAttribute('data-phase', 'ready', { timeout: 10000 });
  await page.getByRole('link', { name: 'EXPLORE', exact: true }).click();
  await expect(page.locator('#about')).toBeVisible();
  await page.getByRole('link', { name: 'PERSONAL SPACE', exact: true }).click();
  await expect(page.locator('.welcome-stage')).toHaveAttribute('data-phase', 'idle', { timeout: 10000 });
  const before = await page.locator('.welcome-film').evaluate((el: HTMLVideoElement) => el.currentTime);
  await page.waitForTimeout(2600);
  await expect(page.locator('.welcome-stage')).toHaveAttribute('data-phase', 'idle');
  const time = await page.locator('.welcome-film').evaluate((el: HTMLVideoElement) => el.currentTime);
  expect(time).toBeCloseTo(before, 2);
  expect(await page.locator('.welcome-film').evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  expect(errors).toEqual([]);
});

test('welcome texture fills the viewport and no bypass link enters the hidden world', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#projects', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#projects')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /直接进入|SKIP INTRO/ })).toHaveCount(0);
  const bounds = await page.locator('.welcome-stage').boundingBox();
  expect(bounds?.width).toBe(1440); expect(bounds?.height).toBe(900);
  expect(await page.locator('.welcome-stage').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('background-texture.png');
  await page.mouse.wheel(0, 1500);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('link', { name: 'EXPLORE', exact: true }).click();
  await expect(page.locator('#about')).toBeVisible();
  await page.locator('#projects').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});
