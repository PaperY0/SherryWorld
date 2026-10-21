import { test, expect, type Page } from '@playwright/test';

async function enter(page:Page){
  await page.goto('/stage');
  await expect(page.locator('.stage-portfolio')).toHaveAttribute('data-motion-ready','true',{timeout:15000});
  await page.locator('.explorer-film-track').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.getBoundingClientRect().height-innerHeight)*.13,behavior:'instant'}));
  const film=page.locator('.explorer-frame video');
  await expect.poll(()=>film.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(.15);
  return film;
}
async function seek(page:Page,time:number){
  await page.locator('.explorer-frame video').evaluate(async(el:HTMLVideoElement,t)=>{
    el.pause();el.currentTime=t;
    await new Promise<void>(resolve=>el.addEventListener('seeked',()=>resolve(),{once:true}));
  },time);
}
const opacity=(page:Page,selector:string)=>page.locator(selector).evaluate(el=>Number(getComputedStyle(el).opacity));

test('turn remains square regardless of extra scrolling; actual fall opens the full viewport',async({page})=>{
  await enter(page);
  await expect(page.locator('.stage-explorer')).toHaveAttribute('data-film-sync','media');
  await seek(page,4.8);
  const initialY=await page.evaluate(()=>scrollY);
  await page.mouse.wheel(0,1800);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(initialY,0);
  const square=await page.locator('.explorer-frame').boundingBox();
  expect(Math.abs(square!.width-square!.height)).toBeLessThan(2);
  expect(square!.width).toBeLessThan(600);
  await page.screenshot({path:'../work/explorer-turn-square.png'});
  await seek(page,5.7);
  await expect.poll(async()=>{const b=await page.locator('.explorer-frame').boundingBox();return Math.max(Math.abs(b!.x),Math.abs(b!.y),Math.abs(b!.width-1440),Math.abs(b!.height-900));}).toBeLessThan(2);
  await expect.poll(()=>opacity(page,'.explorer-fall-copy')).toBeLessThan(.01);
  await page.screenshot({path:'../work/explorer-fall-full.png'});
});

test('abyss darkens and first copy lights up before the bright return automatically reveals the second',async({page})=>{
  await enter(page);
  await seek(page,8);
  const earlyShade=await opacity(page,'.explorer-shade');
  await seek(page,11.4);
  await expect.poll(()=>opacity(page,'.explorer-shade')).toBeGreaterThan(earlyShade+.4);
  await expect.poll(()=>opacity(page,'.explorer-fall-copy')).toBeGreaterThan(.99);
  expect(await opacity(page,'.explorer-rise-copy')).toBeLessThan(.01);
  await page.screenshot({path:'../work/explorer-abyss-copy.png'});
  const y=await page.evaluate(()=>scrollY);
  await seek(page,12.4);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(y+300);
  await expect.poll(()=>opacity(page,'.explorer-rise-copy')).toBeGreaterThan(.99);
  expect(await opacity(page,'.explorer-fall-copy')).toBeLessThan(.01);
  expect(await opacity(page,'.explorer-frame')).toBeLessThan(.01);
  await expect(page.locator('.stage-explorer')).toHaveAttribute('data-film-phase','complete');
  await expect.poll(()=>opacity(page,'.explorer-continuous-light')).toBeGreaterThan(.60);
  await page.screenshot({path:'../work/explorer-auto-dawn.png'});
});

test('real playback reaches every cue in sequence without additional scrolling',async({page})=>{
  test.setTimeout(45000);
  const film=await enter(page);
  await expect(page.locator('.stage-explorer')).toHaveAttribute('data-film-phase','turn');
  await expect(page.locator('.stage-explorer')).toHaveAttribute('data-film-phase','fall',{timeout:10000});
  await expect(page.locator('.stage-explorer')).toHaveAttribute('data-film-phase','abyss',{timeout:10000});
  await expect(page.locator('.stage-explorer')).toHaveAttribute('data-film-phase','complete',{timeout:12000});
  await expect.poll(()=>film.evaluate((el:HTMLVideoElement)=>el.paused)).toBe(true);
  expect(await film.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(12.3);
});

test('phone keeps the turn square, expands on the fall and can cancel/reenter without a scroll trap',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await enter(page);await seek(page,4.8);
  const frame=page.locator('.explorer-frame'),b=await frame.boundingBox();
  expect(Math.abs(b!.width-b!.height)).toBeLessThan(2);expect(b!.x).toBeGreaterThanOrEqual(0);
  await seek(page,5.7);
  await expect.poll(async()=>{const box=await frame.boundingBox();return Math.max(Math.abs(box!.x),Math.abs(box!.y),Math.abs(box!.width-390),Math.abs(box!.height-844));}).toBeLessThan(2);
  await page.screenshot({path:'../work/explorer-fall-mobile.png'});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await expect.poll(()=>page.locator('.explorer-frame video').evaluate((el:HTMLVideoElement)=>el.paused)).toBe(true);
  await page.locator('.explorer-film-track').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.getBoundingClientRect().height-innerHeight)*.13,behavior:'instant'}));
  await expect.poll(()=>page.locator('.explorer-frame video').evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeLessThan(3);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('reduced motion keeps both passages readable and never starts a forced camera move',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/stage');
  const film=page.locator('.explorer-frame video');
  await page.getByRole('heading',{name:'The abyss is the prelude to ascension.'}).scrollIntoViewIfNeeded();
  await expect(page.locator('.explorer-fall-copy')).toBeVisible();
  await expect(page.locator('.explorer-rise-copy')).toHaveCSS('opacity','1');
  expect(await film.evaluate((el:HTMLVideoElement)=>el.paused)).toBe(true);
});
