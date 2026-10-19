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

test('Weaver opens a city book with filtered polaroid photographs',async({page})=>{
  await page.goto('/stage');
  const host=page.locator('.stage-weaver');
  await expect(host).toHaveAttribute('data-motion-ready','true',{timeout:12000});
  await host.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.getBoundingClientRect().height-innerHeight)*.5,behavior:'instant'}));
  const trigger=page.getByRole('button',{name:'Open Guangzhou city album'});
  await trigger.click();
  const album=page.getByRole('dialog',{name:/Guangzhou/});
  await expect(album).toHaveAttribute('data-phase','open');
  await expect(album.locator('.city-album-wall')).toHaveAttribute('data-ready','true');
  await expect(album.locator('.city-polaroid')).toHaveCount(18);
  await album.getByRole('button',{name:'个人照 / PORTRAITS',exact:true}).click();
  await expect(album.locator('.city-polaroid')).toHaveCount(6);
  await album.getByRole('button',{name:'Pause city gallery',exact:true}).click();
  await album.locator('.city-polaroid[aria-hidden=false]').first().click();
  await expect(album.getByRole('region',{name:'Enlarged city photo'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(album.getByRole('region',{name:'Enlarged city photo'})).toHaveCount(0);
  await album.getByRole('button',{name:'全部 / ALL',exact:true}).click();
  await expect.poll(()=>album.locator('.city-polaroid[aria-hidden=false]').evaluateAll(cards=>cards.length>1&&cards.every(card=>Number((card as HTMLElement).style.opacity)>.99))).toBe(true);
  await page.screenshot({path:'../work/weaver-city-album.png'});
  await page.keyboard.press('Escape');
  await expect(album).not.toBeVisible();
  await expect(trigger).toBeFocused();
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

test('city photo album fits mobile reduced motion',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/stage');
  const trigger=page.getByRole('button',{name:'Open Guangzhou city album'});
  await trigger.scrollIntoViewIfNeeded();await trigger.click();
  const album=page.getByRole('dialog',{name:/Guangzhou/});
  await expect(album).toBeVisible();
  await album.getByRole('button',{name:'美食照 / FOOD',exact:true}).click();
  await expect(album.locator('.city-polaroid')).toHaveCount(6);
  expect(await album.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:'../work/weaver-city-album-mobile.png'});
  await page.keyboard.press('Escape');await expect(album).not.toBeVisible();
});
