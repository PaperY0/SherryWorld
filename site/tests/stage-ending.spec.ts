import { test, expect } from '@playwright/test';
test('ending fades after Weaver, provides working contact actions and returns to the top', async ({ page, context }) => {
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
  await expect(ending.getByRole('link', { name: /19511635329/ })).toHaveAttribute('href', 'mailto:19511635329@163.com');
  await expect(ending.getByRole('link', { name: /GITHUB/ })).toHaveAttribute('href', 'https://github.com/PaperY0');
  await ending.getByRole('button', { name: '复制邮箱 / COPY EMAIL' }).click();
  await expect(ending.getByRole('status')).toHaveText('邮箱已复制 / EMAIL COPIED');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('19511635329@163.com');
  await page.screenshot({ path: '../work/stage-ending-desktop.png' });
  await ending.getByRole('link', { name: 'BACK TO TOP' }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3);
  await expect(page.locator('#stage-heading')).toBeFocused();
});
test('ending stays readable on mobile and all chapter anchors resolve', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stage'); const ending = page.locator('#stage-ending'); await ending.scrollIntoViewIfNeeded();
  expect(await ending.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  for (const [name, id] of [['CRAFTER', 'stage-legacy'], ['EXPLORER', 'stage-explorer'], ['WEAVER', 'stage-weaver']]) {
    await expect(ending.getByRole('navigation').getByRole('link', { name, exact: true })).toHaveAttribute('href', `#${id}`);
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await page.screenshot({ path: '../work/stage-ending-mobile.png' });
  await ending.getByRole('navigation').getByRole('link', { name: 'WEAVER', exact: true }).click();
  await expect(page.locator('#weaver-title')).toBeFocused();
});
