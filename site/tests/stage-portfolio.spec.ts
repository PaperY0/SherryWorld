import { test, expect } from '@playwright/test';

const works = [['lumi', 'Lumi'], ['zhiye', 'Zhiye'], ['shengxingo', 'ShengXinGO'], ['realm', 'Realm']] as const;

test('vertical portfolio visits the four requested works and reverses with correct repository links', async ({ page }) => {
  await page.goto('/stage');
  const host = page.locator('.stage-portfolio');
  await expect(host).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  const visit = async (index: number) => {
    await host.evaluate((el, index) => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * ((index + .4) / 4), behavior: 'instant' }), index);
    await expect(host).toHaveAttribute('data-active-work', works[index][0]);
    const item = page.locator(`.stage-work-item[data-work="${works[index][0]}"]`);
    await expect(item.locator('.stage-work-info')).toBeVisible();
    await expect(item.locator('.stage-work-github')).toHaveAttribute('href', `https://github.com/PaperY0/${works[index][1]}`);
    await expect.poll(() => item.locator('.stage-work-card').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 2);
    await expect(item.locator('.stage-work-card img').first()).toBeVisible();
    await expect.poll(() => item.locator('.stage-work-card img').first().evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    await item.locator('.stage-work-info').evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))));
    return item;
  };
  for (let index = 0; index < 4; index++) {
    await visit(index);
    await page.screenshot({ path: `../work/stage-portfolio-${works[index][0]}.png` });
  }
  await visit(1);
  await expect(page.locator('.stage-work-progress')).toHaveAttribute('aria-label', 'Project 2 of 4');
  await expect(page.locator('html')).toHaveAttribute('data-stage-section', 'portfolio');
});

test('project details open, link to GitHub and close with Escape while restoring focus and scroll', async ({ page }) => {
  await page.goto('/stage');
  const host = page.locator('.stage-portfolio');
  await expect(host).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  await host.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY + innerHeight * .4, behavior: 'instant' }));
  const card = page.getByRole('button', { name: 'View Lumi project', exact: true });
  await card.focus();
  const y = await page.evaluate(() => scrollY);
  await card.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Lumi', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'EXPLORE ON GITHUB' })).toHaveAttribute('href', 'https://github.com/PaperY0/Lumi');
  await dialog.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => {}))));
  await page.screenshot({ path: '../work/stage-portfolio-detail.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(card).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - y)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
});

test('mobile cover, right-copy replacement below and GitHub action fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stage');
  const host = page.locator('.stage-portfolio');
  await expect(host).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  await host.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * .6, behavior: 'instant' }));
  await expect(host).toHaveAttribute('data-active-work', 'shengxingo');
  const item = page.locator('.stage-work-item[data-work="shengxingo"]');
  await expect.poll(() => item.locator('.stage-work-card').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeCloseTo(1, 2);
  const cover = await item.locator('.stage-work-card').boundingBox();
  const link = await item.locator('.stage-work-github').boundingBox();
  expect(cover!.x).toBeGreaterThanOrEqual(0);
  expect(cover!.x + cover!.width).toBeLessThanOrEqual(390);
  expect(link!.y).toBeGreaterThan(cover!.y + cover!.height);
  expect(link!.y + link!.height).toBeLessThan(790);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../work/stage-portfolio-mobile.png' });
});

test('reduced motion keeps all four works readable in document order', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stage');
  for (const [slug, name] of works) {
    const item = page.locator(`.stage-work-item[data-work="${slug}"]`);
    await item.locator('.stage-work-github').scrollIntoViewIfNeeded();
    await expect(item.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(item.locator('.stage-work-github')).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
