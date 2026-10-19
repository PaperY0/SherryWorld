import { test, expect } from '@playwright/test';

test('skill dialog holds its final transparent frame and preserves document geometry across repeated opens', async ({page})=>{
  await page.goto('/stage');
  const trigger=page.getByRole('button',{name:'Explore AI Exploration photos',exact:true});
  await trigger.scrollIntoViewIfNeeded();
  for(let i=0;i<2;i++){
    const before=await page.evaluate(()=>({width:document.documentElement.clientWidth,y:scrollY}));
    await trigger.click();
    const dialog=page.getByRole('dialog',{name:'AI Exploration',exact:true});
    await expect(dialog).toHaveAttribute('data-phase','open');
    await expect(dialog.locator('.skill-gallery-stage')).toHaveAttribute('data-ready','true');
    const fill=await dialog.evaluate(el=>el.getAnimations().filter(a=>(a.effect as KeyframeEffect).target===el).map(a=>(a.effect as KeyframeEffect).getTiming().fill));
    expect(fill).toContain('both');
    expect(await page.evaluate(()=>document.documentElement.clientWidth)).toBe(before.width);
    await dialog.getByRole('button',{name:'Close skill exhibition'}).click();
    const end=await dialog.evaluate(el=>{
      const animation=el.getAnimations().find(a=>(a.effect as KeyframeEffect).target===el)!;
      return {fill:animation.effect!.getTiming().fill,last:(animation.effect as KeyframeEffect).getKeyframes().at(-1)!.opacity};
    });
    expect(end).toEqual({fill:'both',last:'0'});
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(()=>document.documentElement.clientWidth)).toBe(before.width);
    expect(Math.abs(await page.evaluate(()=>scrollY)-before.y)).toBeLessThan(2);
  }
});

test('Weaver follows Explorer, reveals a centered journal window and opens life categories',async({page})=>{
  await page.goto('/stage');
  const host=page.locator('.stage-weaver');
  await expect(host).toHaveAttribute('data-motion-ready','true',{timeout:12000});
  await host.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.getBoundingClientRect().height-innerHeight)*.5,behavior:'instant'}));
  const window=page.getByRole('button',{name:'Open Weaver life journal'});
  await expect.poll(()=>window.evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(.99);
  const box=await window.boundingBox();
  expect(Math.abs(box!.x+box!.width/2-720)).toBeLessThan(2);
  await expect(page.locator('html')).toHaveAttribute('data-stage-section','weaver');
  await page.screenshot({path:'../work/weaver-stage-desktop.png'});
  await window.click();
  const journal=page.getByRole('dialog',{name:'Life, woven together.'});
  await expect(journal).toHaveAttribute('data-phase','open');
  await expect(journal.locator('.life-photo-tile')).toHaveCount(6);
  await journal.getByRole('button',{name:'TRAVEL',exact:true}).click();
  await expect(journal.locator('.life-photo-tile')).toHaveCount(2);
  await journal.locator('.life-photo-tile').first().click();
  await expect(journal.getByRole('region',{name:'Enlarged life photo'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(journal.getByRole('region',{name:'Enlarged life photo'})).toHaveCount(0);
  await journal.getByRole('button',{name:'ALL MOMENTS',exact:true}).click();
  await journal.evaluate(el=>el.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'../work/weaver-life-journal.png'});
  await page.keyboard.press('Escape');
  await expect(journal).not.toBeVisible();
  await expect(window).toBeFocused();
});

test('Weaver opens two clipped title doors from a narrow central slit and closes reversibly',async({page})=>{
  await page.goto('/stage');
  const host=page.locator('.stage-weaver');
  await expect(host).toHaveAttribute('data-motion-ready','true',{timeout:12000});
  const panels=host.locator('.weaver-door');
  await expect(panels).toHaveCount(2);
  const seek=async(progress:number)=>{
    await host.evaluate((el,p)=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.getBoundingClientRect().height-innerHeight)*p,behavior:'instant'}),progress);
    await expect.poll(()=>host.evaluate(el=>Math.abs(Number(el.getAttribute('data-door-progress'))-Number(el.getAttribute('data-scroll-progress'))))).toBeLessThan(.015);
  };
  const gap=async()=>{
    const left=await panels.nth(0).boundingBox(),right=await panels.nth(1).boundingBox();
    return right!.x-left!.x-left!.width;
  };
  await seek(0);expect(await gap()).toBeLessThan(2);
  await seek(.1);expect(await gap()).toBeGreaterThan(80);expect(await gap()).toBeLessThan(720);
  await page.screenshot({path:'../work/weaver-doors-slit.png'});
  await seek(.45);expect(await gap()).toBeGreaterThan(1435);
  await page.screenshot({path:'../work/weaver-doors-open.png'});
  await seek(.98);expect(await gap()).toBeLessThan(2);
  await seek(.1);expect(await gap()).toBeGreaterThan(80);expect(await gap()).toBeLessThan(720);
  await page.setViewportSize({width:390,height:844});
  await seek(.45);expect(await gap()).toBeGreaterThan(385);
  expect(await host.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:'../work/weaver-doors-mobile.png'});
});

test('Weaver life journal remains readable on mobile with reduced motion',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/stage');
  const button=page.getByRole('button',{name:'Open Weaver life journal'});
  await button.scrollIntoViewIfNeeded();await button.click();
  const journal=page.getByRole('dialog',{name:'Life, woven together.'});
  await expect(journal).toBeVisible();
  await journal.getByRole('button',{name:'EVERYDAY',exact:true}).click();
  await expect(journal.locator('.life-photo-tile')).toHaveCount(2);
  expect(await journal.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:'../work/weaver-life-mobile.png'});
  await page.keyboard.press('Escape');
  await expect(journal).not.toBeVisible();
});
