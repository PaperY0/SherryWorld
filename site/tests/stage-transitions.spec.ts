import { test, expect } from '@playwright/test';

test('section boundaries fade in place and the drawing is brighter pink', async ({ page }) => {
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready','true',{timeout:12000});
  const seek = async (selector:string, offset:number) => {
    await page.locator(selector).evaluate((el,p)=>scrollTo({top:el.getBoundingClientRect().top+scrollY+innerHeight*p,behavior:'instant'}),offset);
  };
  for(const selector of ['.stage-portfolio','.stage-explorer']) {
    await seek(selector,-.2);
    await expect.poll(()=>page.locator(selector).evaluate(el=>Number(getComputedStyle(el).opacity))).toBeLessThan(.02);
    await seek(selector,.08);
    await expect.poll(()=>page.locator(selector).evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(.2);
    await seek(selector,.2);
    await expect.poll(()=>page.locator(selector).evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(.99);
  }
  await expect(page.locator('.stage-legacy-lines')).toHaveCSS('opacity','0.88');
  await expect(page.locator('.stage-legacy-lines')).toHaveCSS('color','rgb(255, 157, 206)');
  await page.locator('.stage-legacy').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.getBoundingClientRect().height-innerHeight)*.53,behavior:'instant'}));
  await expect.poll(async()=>Number(await page.locator('.stage-legacy').getAttribute('data-scroll-progress'))).toBeCloseTo(.53,2);
  await page.screenshot({path:'../work/stage-brighter-pink-lines.png'});
});
