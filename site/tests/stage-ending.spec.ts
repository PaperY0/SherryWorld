import { test, expect } from '@playwright/test';
test('ending fades after Weaver and places contacts beside its quieter invitation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/stage');
  const ending = page.locator('#stage-ending');
  await expect(ending).toHaveAttribute('data-motion-ready', 'true', { timeout: 12000 });
  await ending.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .2, behavior: 'instant' }));
  await expect.poll(() => ending.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.02);
  await ending.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.getBoundingClientRect().height - innerHeight) * .8, behavior: 'instant' }));
  await expect.poll(() => ending.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.98);
  await expect.poll(() => ending.locator('.ending-connect').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.98);
  await expect(page.locator('html')).toHaveAttribute('data-stage-section', 'ending');
  const headline=ending.getByRole('heading',{name:'EVERY TEXTURED LIFE IS AN UNFINISHED MASTERPIECE.',exact:true});
  await expect(headline).toBeVisible();
  const center=await headline.boundingBox();expect(Math.abs(center!.x+center!.width/2-720)).toBeLessThan(2);
  await expect(ending.getByRole('link',{name:'WEAVE WITH ME',exact:true})).toHaveAttribute('href','mailto:19511635329@163.com');
  const email=ending.locator('.ending-email');
  expect(await email.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeLessThan(13);
  const emailBox=await email.boundingBox(),cta=await ending.locator('.ending-weave').boundingBox(),github=await ending.locator('.ending-github').boundingBox();
  expect(emailBox!.x).toBeGreaterThan(cta!.x+cta!.width);expect(emailBox!.y).toBeLessThan(github!.y);
  expect(center!.y+center!.height/2).toBeGreaterThan(350);
  await expect(ending.locator('.ending-footer')).toHaveCount(0);
  await expect(page.locator('.stage-ledger')).toHaveCSS('opacity','0');
  await expect(ending.locator('.ending-invitation')).toHaveText('Let’s craft the unseen, explore the unknown, and weave new stories together.');
  await expect(ending.getByRole('link', { name: /19511635329/ })).toHaveAttribute('href', 'mailto:19511635329@163.com');
  await expect(ending.getByRole('link', { name: /GITHUB/ })).toHaveAttribute('href', 'https://github.com/PaperY0');
  await page.screenshot({ path: '../work/stage-ending-desktop.png' });

});
test('ending keeps its headline and contact invitation inside the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage'); const ending = page.locator('#stage-ending'); await ending.scrollIntoViewIfNeeded();
  expect(await ending.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(await ending.locator('.ending-heading').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  const row=await ending.locator('.ending-contact-row').boundingBox();expect(row!.x).toBeGreaterThanOrEqual(0);expect(row!.x+row!.width).toBeLessThanOrEqual(390);
  await expect(ending.locator('.ending-footer')).toHaveCount(0);
  await expect(page.locator('.stage-ledger')).toHaveCSS('opacity','0');
  await page.screenshot({ path: '../work/stage-ending-mobile.png' });

});
