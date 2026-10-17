import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('initial count gates the signature until the loading transition finishes', async ({ page }) => {
  await page.goto('/stage');
  const loader = page.getByRole('progressbar');
  await expect(loader).toBeVisible();
  const initial = Number(await loader.getAttribute('aria-valuenow'));
  await expect.poll(async () => Number(await loader.getAttribute('aria-valuenow'))).toBeGreaterThan(initial);
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'true');
  await expect(page.locator('[data-pen="6"]')).toHaveJSProperty('tagName', 'path');
  await expect(loader).toHaveCount(0, { timeout: 12000 });
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false');
  await expect(page.locator('.stage-signature')).toHaveAttribute('data-state', 'writing');
  await expect(page.locator('.stage-signature')).toHaveAttribute('data-state', 'complete', { timeout: 7000 });
});

test('reduced motion does not wait for the count or dissolve', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage');
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false');
  await expect(page.getByRole('progressbar')).toHaveCount(0);
});

test('loading overlay reaches transparency before removal', async ({ page }) => {
  await page.goto('/stage');
  const lastOpacity = await page.evaluate(() => new Promise<number>(resolve => {
    let last = 1;
    const sample = () => {
      const loader = document.querySelector('.stage-loader');
      if (!loader) { resolve(last); return; }
      last = Number(getComputedStyle(loader).opacity);
      requestAnimationFrame(sample);
    };
    sample();
  }));
  expect(lastOpacity).toBeLessThan(.02);
});

test('the descending y does not expose its return stroke early', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-page')).toHaveAttribute('data-loading', 'false', { timeout: 12000 });
  const png = readFileSync('public/images/sherry-signature-selected.png').toString('base64');
  const pixels = await page.evaluate(async base64 => {
    const original = document.querySelector('.stage-signature svg') as SVGSVGElement;
    const svg = original.cloneNode(true) as SVGSVGElement;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', '0 0 1280 961');
    svg.setAttribute('width', '1280'); svg.setAttribute('height', '961');
    const image = svg.querySelector('image')!;
    image.setAttribute('href', `data:image/png;base64,${base64}`);
    svg.querySelectorAll<SVGPathElement>('[data-pen]').forEach((path, i) => {
      const length = (original.querySelector(`[data-pen="${i}"]`) as SVGPathElement).getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = i === 6 ? String(length) : '0';
    });
    const bitmap = new Image();
    bitmap.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    await bitmap.decode();
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 961;
    const context = canvas.getContext('2d')!; context.drawImage(bitmap, 0, 0);
    return { down: context.getImageData(903, 680, 1, 1).data[3], returning: context.getImageData(865, 680, 1, 1).data[3] };
  }, png);
  expect(pixels.down).toBeGreaterThan(200);
  expect(pixels.returning).toBe(0);
});
