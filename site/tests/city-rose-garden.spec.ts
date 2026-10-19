import { test, expect } from '@playwright/test';
async function enter(page: import('@playwright/test').Page) {
  await page.goto('/stage'); const root = page.locator('.stage-weaver');
  await expect(root).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  await root.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * .45, behavior: 'instant' }));
  await expect.poll(() => root.evaluate(el => Number(el.getAttribute('data-door-progress')))).toBeGreaterThan(.43);
  return page.locator('.rose-garden-canvas');
}
test('real rose scene pans, zooms and physically picks a city book', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const canvas = await enter(page);
  await expect(canvas).toHaveAttribute('data-engine', 'three', { timeout: 15000 });
  await expect(canvas).toHaveAttribute('data-roses', '425');
  await page.mouse.move(720, 460);
  await expect(canvas).toHaveAttribute('data-active-city', 'qingdao');
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(450, 0); // Horizontal wheel does not zoom or trap the page.
  await page.mouse.wheel(0, 450);
  await expect.poll(() => canvas.getAttribute('data-zoom').then(Number)).toBeGreaterThan(.6);
  expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(2);
  await page.getByRole('button', { name: '北京 Beijing', exact: true }).click();
  await expect.poll(() => canvas.getAttribute('data-camera-x').then(Number)).toBeGreaterThan(3);
  await page.getByRole('button', { name: '青岛 Qingdao', exact: true }).click();
  await expect.poll(() => canvas.getAttribute('data-camera-x').then(Number)).toBeLessThan(.05);
  await page.screenshot({ path: '../work/rose-garden-close.png' });
  await page.mouse.click(720, 460);
  const album = page.getByRole('dialog', { name: /Qingdao/ }); await expect(album).toBeVisible();
  await page.keyboard.press('Escape'); await expect(album).not.toBeVisible();
  await page.mouse.move(720, 460); await page.mouse.wheel(0, 1000);
  await expect.poll(() => canvas.getAttribute('data-zoom').then(Number)).toBeGreaterThan(.98);
  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
  expect(errors).toEqual([]);
});
test('all five city books have independent albums and three photo categories', async ({ page }) => {
  await enter(page);
  for (const [name, title] of [['广州', 'Guangzhou'], ['深圳', 'Shenzhen'], ['青岛', 'Qingdao'], ['上海', 'Shanghai'], ['北京', 'Beijing']]) {
    await page.getByRole('button', { name: `${name} ${title}`, exact: true }).click();
    await page.getByRole('button', { name: `Open ${title} city album`, exact: true }).click();
    const album = page.getByRole('dialog', { name: new RegExp(title) });
    await expect(album).toHaveAttribute('data-phase', 'open');
    for (const category of ['个人照 / PORTRAITS', '风景照 / SCENERY', '美食照 / FOOD']) {
      await album.getByRole('button', { name: category, exact: true }).click();
      await expect(album.locator('.city-polaroid')).toHaveCount(6);
    }
    await page.keyboard.press('Escape'); await expect(album).not.toBeVisible();
  }
});
test('without WebGL the five books remain usable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2') return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await enter(page);
  await expect(page.locator('.city-rose-garden')).toHaveAttribute('data-status', 'fallback');
  await expect(page.locator('.city-books-fallback button')).toHaveCount(5);
  await page.locator('.city-books-fallback button').first().click();
  await expect(page.getByRole('dialog', { name: /Guangzhou/ })).toBeVisible();
});
