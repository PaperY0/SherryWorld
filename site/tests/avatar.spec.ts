import { test, expect } from '@playwright/test';

test('real model loads, turns, changes wardrobe and respects pause', async ({ page }) => {
  await page.goto('/avatar-lab');
  const stage = page.locator('.avatar-canvas');
  await expect(stage).toHaveAttribute('data-state', 'ready', { timeout: 20000 });
  await expect(stage.locator('canvas')).toBeVisible();
  expect(Number(await stage.getAttribute('data-meshes'))).toBeGreaterThan(10);
  const box = (await stage.boundingBox())!;
  await page.mouse.move(box.x + box.width * .95, box.y + box.height / 2);
  await expect.poll(async () => Number(await stage.getAttribute('data-head-yaw'))).toBeGreaterThan(.1);
  await page.getByRole('button', { name: '右侧面', exact: true }).click();
  await expect.poll(async () => Number(await stage.getAttribute('data-yaw'))).toBeGreaterThan(.4);
  await page.getByRole('button', { name: 'DARK', exact: true }).click();
  await expect(stage).toHaveAttribute('data-wardrobe', 'pearl');
  await page.getByRole('button', { name: '暂停动作', exact: true }).click();
  const y = await stage.getAttribute('data-breath');
  await page.waitForTimeout(450);
  await expect(stage).toHaveAttribute('data-breath', y!);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'CHARACTER STUDY', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('missing WebGL shows the fallback without trapping the page', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, ...args: Parameters<typeof getContext>) {
      if (String(args[0]).startsWith('webgl')) return null;
      return getContext.apply(this, args);
    } as typeof getContext;
  });
  await page.goto('/avatar-lab');
  await expect(page.locator('.avatar-canvas')).toHaveAttribute('data-state', 'error');
  await expect(page.getByRole('link', { name: '返回个人世界', exact: true })).toBeVisible();
});

test('context loss offers a retry that recreates the model scene', async ({ page }) => {
  await page.goto('/avatar-lab');
  const stage = page.locator('.avatar-canvas');
  await expect(stage).toHaveAttribute('data-state','ready');
  await stage.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', {cancelable:true})));
  await expect(stage).toHaveAttribute('data-state','error');
  await page.getByRole('button', { name:'重新加载',exact:true }).click();
  await expect(stage).toHaveAttribute('data-state','ready');
  await expect(stage.locator('canvas')).toHaveCount(1);
});

test('a late model response cannot hide context-loss fallback', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/models/sherry-avatar-blender-v2.glb', async route => {
    await pending; await route.continue();
  });
  try {
    await page.goto('/avatar-lab', { waitUntil: 'domcontentloaded' });
    const stage = page.locator('.avatar-canvas');
    await stage.locator('canvas').waitFor();
    await stage.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
    await expect(stage).toHaveAttribute('data-state','error');
    release(); await page.waitForTimeout(500);
    await expect(stage).toHaveAttribute('data-state','error');
    await expect(page.getByRole('button',{name:'重新加载',exact:true})).toBeVisible();
  } finally { release(); }
});

test('reduced motion starts paused and keyboard rotation stays available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/avatar-lab');
  const stage = page.locator('.avatar-canvas');
  await expect(stage).toHaveAttribute('data-state', 'ready', { timeout: 20000 });
  await expect(page.getByRole('button', { name: '播放动作', exact: true })).toBeVisible();
  await stage.focus();
  for (let i=0;i<5;i++) await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Number(await stage.getAttribute('data-yaw'))).toBeGreaterThan(.3);
  await page.keyboard.press('Home');
  await expect.poll(async () => Math.abs(Number(await stage.getAttribute('data-yaw')))).toBeLessThan(.01);
});

test('model load failure keeps a readable fallback and navigation', async ({ page }) => {
  await page.route('**/models/sherry-avatar-blender-v2.glb', route => route.abort());
  await page.goto('/avatar-lab');
  await expect(page.locator('.avatar-canvas')).toHaveAttribute('data-state', 'error', { timeout: 20000 });
  await expect(page.getByText('模型暂时无法加载，已显示造型参考。')).toBeVisible();
  await expect(page.getByRole('link', { name: '返回个人世界', exact: true })).toHaveAttribute('href', '/#top');
});
