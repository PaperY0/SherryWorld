import { test, expect } from '@playwright/test';
const names = ['Mind & Laurels', 'Sonic Resonance', 'Kinetic Artistry', 'Athletic Vigor'];
const slugs = ['mind-laurels', 'sonic-resonance', 'kinetic-artistry', 'athletic-vigor'];
async function openSkill(page: import('@playwright/test').Page, index = 0) {
  const button = page.getByRole('button', { name: `Explore ${names[index]} photos`, exact: true });
  await button.scrollIntoViewIfNeeded();
  await button.click();
  const dialog = page.getByRole('dialog', { name: names[index], exact: true });
  await expect(dialog).toBeVisible();
  const frames = await dialog.evaluate(el => el.getAnimations().flatMap(a => (a.effect as KeyframeEffect).getKeyframes()));
  expect(frames.every(frame => !('clipPath' in frame) && !('transform' in frame))).toBe(true);
  await dialog.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished.catch(() => {}))));
  return { button, dialog };
}

test('each skill opens a working placeholder wall and restores focus and scroll on close', async ({ page }) => {
  await page.goto('/stage');
  for (let index = 0; index < 4; index++) {
    const { button, dialog } = await openSkill(page, index);
    await expect(dialog.locator('.skill-gallery-stage')).toHaveAttribute('data-ready', 'true');
    await expect(dialog.locator('.gallery-card')).toHaveCount(18);
    await expect(dialog.locator('.skill-gallery-hint')).toContainText('PREVIEW PLACEHOLDERS');
    await expect(dialog.locator('svg')).toHaveCount(0);
    if(index === 0) await page.screenshot({path:'../work/skill-placeholder-wall.png'});
    const y = await page.evaluate(() => scrollY);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(button).toBeFocused();
    expect(Math.abs(await page.evaluate(() => scrollY) - y)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  }
});

test('photo gallery reuses curved drag motion, steps, enlarges and returns', async ({ page }) => {
  // Verification fixtures only. These mood images are not published as skill photographs.
  await page.route('**/images/skills/mind-laurels/photos.json', route => route.fulfill({ json: [
    { src: '/images/stage/capability-mood/ribbon.png', alt: 'Fixture ribbon', caption: 'Test photo one' },
    { src: '/images/stage/capability-mood/butterflies.png', alt: 'Fixture butterflies', caption: 'Test photo two' },
    { src: '/images/stage/capability-mood/roses.png', alt: 'Fixture roses', caption: 'Test photo three' },
  ] }));
  await page.goto('/stage');
  const { dialog } = await openSkill(page);
  const stage = dialog.locator('.skill-gallery-stage');
  await expect(stage).toHaveAttribute('data-ready', 'true');
  await dialog.getByRole('button', { name: 'Pause photo gallery', exact: true }).click();
  const before = Number(await stage.getAttribute('data-offset'));
  await dialog.getByRole('button', { name: 'Next photo', exact: true }).click();
  expect(Number(await stage.getAttribute('data-offset'))).not.toBe(before);
  const box = await stage.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const start = Number(await stage.getAttribute('data-offset'));
  await page.mouse.down(); await page.mouse.move(box!.x + box!.width / 2 - 150, box!.y + box!.height / 2, { steps: 12 }); await page.mouse.up();
  expect(Math.abs(Number(await stage.getAttribute('data-offset')) - start)).toBeGreaterThan(.1);
  // Wait until the controller's entry reveal settles before selecting a visible card.
  await expect.poll(() => stage.locator('.skill-photo-card').evaluateAll(els => els.some(el => Number(getComputedStyle(el).opacity) > .99))).toBe(true);
  await page.screenshot({ path: '../work/skill-gallery-fixture-desktop.png' });
  const photo = stage.locator('.skill-photo-card[aria-hidden="false"]').nth(1);
  await photo.focus(); await page.keyboard.press('Enter');
  await expect(dialog.locator('.skill-photo-lightbox')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Return to skill photo gallery' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(dialog.locator('.skill-photo-lightbox')).toHaveCount(0);
  await expect(photo).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('mobile reduced motion collection and photo stay within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(`**/images/skills/${slugs[1]}/photos.json`, route => route.fulfill({ json: [{ src: '/images/stage/portfolio/zhiye-cover.png', alt: 'Fixture screenshot' }] }));
  await page.goto('/stage');
  const { dialog } = await openSkill(page, 1);
  const stage = dialog.locator('.skill-gallery-stage');
  await expect(stage).toHaveAttribute('data-ready', 'true');
  const photo = stage.locator('.skill-photo-card[aria-hidden="false"]').first();
  await photo.focus(); await page.keyboard.press('Enter');
  await expect(dialog.locator('.skill-photo-lightbox')).toBeVisible();
  const image = await dialog.locator('.skill-photo-lightbox img').boundingBox();
  expect(image!.x).toBeGreaterThanOrEqual(0);
  expect(image!.x + image!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: '../work/skill-gallery-fixture-mobile.png' });
});
