import { test, expect } from '@playwright/test';

async function enter(page: import('@playwright/test').Page) {
  await page.goto('/#projects');
  await page.locator('.gallery-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('.gallery-stage')).toHaveAttribute('data-ready', 'true');
  await page.waitForTimeout(800);
}

test('project directory contains 17 repositories and opens correct bilingual details', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: '项目目录', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.directory-item')).toHaveCount(17);
  await dialog.getByRole('button', { name: /Zhiye/ }).click();
  await expect(dialog.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/PaperY0/Zhiye');
  await expect(dialog).toContainText('课堂复盘');
  await expect(dialog).toContainText('全栈负责');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'PROJECT DIRECTORY', exact: true }).click();
  await dialog.getByRole('button', { name: /Zhiye/ }).click();
  await expect(dialog).toContainText('classroom');
  await expect(dialog).toContainText('AI-assisted');
});

test('auto loop, pointer directions, idle return and modal suspension', async ({ page }) => {
  await enter(page);
  const stage = page.locator('.gallery-stage');
  const offset = async () => Number(await stage.getAttribute('data-offset'));
  const a = await offset(); await page.waitForTimeout(500); expect(await offset()).toBeGreaterThan(a);
  const box = (await stage.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2, { steps: 8 });
  await expect.poll(async () => Number(await stage.getAttribute('data-target'))).toBeLessThan(0);
  await page.mouse.move(box.x + box.width / 2 - 90, box.y + box.height / 2, { steps: 8 });
  await expect.poll(async () => Number(await stage.getAttribute('data-target'))).toBeGreaterThan(0);
  await page.waitForTimeout(1250); await expect(stage).toHaveAttribute('data-target', '0.12');
  await page.getByRole('button', { name: '项目目录', exact: true }).click();
  const stopped = await offset(); await page.waitForTimeout(450); expect(await offset()).toBeCloseTo(stopped, 3);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400); expect(await offset()).toBeGreaterThan(stopped);
});

test('dragging does not open a project; pause and previous/next stay usable', async ({ page }) => {
  await enter(page); const stage = page.locator('.gallery-stage'); const box = (await stage.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 - 110, box.y + box.height / 2, { steps: 10 }); await page.mouse.up();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: '暂停自动播放', exact: true }).click();
  const stopped = Number(await stage.getAttribute('data-offset')); await page.waitForTimeout(400);
  expect(Number(await stage.getAttribute('data-offset'))).toBeCloseTo(stopped, 3);
  await page.getByRole('button', { name: '下一件作品', exact: true }).click();
  expect(Number(await stage.getAttribute('data-offset'))).not.toBe(stopped);
  const loopStart = Number(await stage.getAttribute('data-offset'));
  for (let i = 0; i < 13; i++) await page.getByRole('button', { name: '下一件作品', exact: true }).click();
  expect(Number(await stage.getAttribute('data-offset'))).toBeCloseTo(loopStart, 3);
  await expect(stage.locator('.gallery-card')).toHaveCount(13);
});

test('fork collection and upstream attribution are distinct from owned projects', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: '学习 / FORK · 4', exact: true }).click();
  expect(await page.locator('.gallery-stage .gallery-card').evaluateAll(cards => new Set(cards.map(c => c.getAttribute('data-project'))).size)).toBe(4);
  await page.getByRole('button', { name: '项目目录', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /^eino ·/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Fork');
  await expect(page.getByRole('dialog').getByRole('link', { name: '上游仓库', exact: true })).toHaveAttribute('href', 'https://github.com/cloudwego/eino');
});

test('responsive arc, reduced motion and keyboard focus restoration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await enter(page);
  await expect(page.getByRole('button', { name: '开始自动播放', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const geometry = await page.locator('.gallery-card').evaluateAll(cards => cards.filter(c => c.getAttribute('aria-hidden') === 'false').map(c => c.getBoundingClientRect()).filter(r => r.right > 0 && r.left < innerWidth).map(r => ({ width: r.width, top: r.top, bottom: r.bottom, center: (r.left + r.right) / 2 })));
  expect(geometry.length).toBeGreaterThanOrEqual(4); expect(geometry.length).toBeLessThanOrEqual(5);
  const middle = geometry.reduce((a,b) => Math.abs(a.center-720)<Math.abs(b.center-720)?a:b);
  const edge = geometry.reduce((a,b) => Math.abs(a.center-720)>Math.abs(b.center-720)?a:b);
  expect(edge.width).toBeGreaterThan(middle.width); expect(edge.top).toBeLessThan(middle.top); expect(edge.bottom).toBeGreaterThan(middle.bottom);
  const directory = page.getByRole('button', { name: '项目目录', exact: true }); await directory.focus(); await page.keyboard.press('Enter');
  await page.keyboard.press('Escape'); await expect(directory).toBeFocused();
  await page.locator('.gallery-card[data-project="Zhiye"]').first().focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-hidden'))).toBe('false');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
