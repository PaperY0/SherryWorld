import { test,expect,type APIRequestContext,type Page } from '@playwright/test';
import type { SiteContent } from '../src/content/site-content';
test.describe.configure({mode:'serial'});
let original:SiteContent;
const headers={'x-sherry-admin':'1'};
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=','base64');
async function current(request:APIRequestContext){return (await request.get('/api/admin/content')).json();}
async function reset(request:APIRequestContext){const snapshot=await current(request);const response=await request.put('/api/admin/content',{headers,data:{revision:snapshot.revision,content:original}});expect(response.ok()).toBe(true);}
test.beforeAll(async({request})=>{original=(await current(request)).content;});
test.afterEach(async({request})=>{await reset(request);});

async function dropImages(page:Page,label:string,names:string[],invalid=false){
  const data=await page.evaluateHandle(({names,bytes,invalid})=>{
    const transfer=new DataTransfer();
    for(const name of names)transfer.items.add(new File([invalid?'not an image':new Uint8Array(bytes)],name,{type:invalid?'text/plain':'image/png'}));
    return transfer;
  },{names,bytes:Array.from(png),invalid});
  const zone=page.getByRole('group',{name:label,exact:true});
  await zone.dispatchEvent('dragenter',{dataTransfer:data});
  await expect(zone).toHaveClass(/is-dragging/);
  await zone.dispatchEvent('drop',{dataTransfer:data});
  await expect(zone).not.toHaveClass(/is-dragging/);
  await data.dispose();
}

test('images can be dropped into project covers and multi-photo city and skill collections',async({page,request})=>{
  await page.goto('/admin');
  await dropImages(page,'项目封面拖拽区',['cover.png']);
  await expect(page.locator('.studio-cover img')).toHaveAttribute('src',/api\/media/);
  await expect(page.locator('.studio-editor')).toHaveAttribute('aria-busy','false');
  await page.getByRole('button',{name:/城市与生活/}).click();
  const originalCount=await page.locator('.studio-photo-row').count();
  await dropImages(page,'展览照片拖拽区',['city-one.png','city-two.png']);
  await expect(page.locator('.studio-photo-row')).toHaveCount(originalCount+2);
  await expect(page.locator('.studio-editor')).toHaveAttribute('aria-busy','false');
  await dropImages(page,'展览照片拖拽区',['notes.txt'],true);
  await expect(page.locator('.studio-messages').getByRole('alert')).toContainText('15MB以内');
  await expect(page.locator('.studio-photo-row')).toHaveCount(originalCount+2);
  await page.getByRole('button',{name:/技能与照片/}).click();
  const skillCount=await page.locator('.studio-photo-row').count();
  await dropImages(page,'展览照片拖拽区',['skill.png']);
  await expect(page.locator('.studio-photo-row')).toHaveCount(skillCount+1);
  await expect(page.locator('.studio-editor')).toHaveAttribute('aria-busy','false');
  await page.getByRole('button',{name:'保存全部修改',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('已保存');
  const saved=await current(request);expect(saved.content.cities[0].photos).toHaveLength(originalCount+2);
  await page.reload();await page.getByRole('button',{name:/城市与生活/}).click();
  await expect(page.locator('.studio-photo-row')).toHaveCount(originalCount+2);
  await page.setViewportSize({width:390,height:844});
  await expect(page.getByRole('group',{name:'展览照片拖拽区'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'../work/admin-drag-drop-mobile.png',fullPage:true});
});

test('studio saves an uploaded project and the live stage reads it without rebuilding',async({page,context,request})=>{
  await page.goto('/admin');await expect(page.getByRole('heading',{name:'项目',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'＋ 新增项目',exact:true}).click();
  await page.getByLabel('项目名称',{exact:true}).fill('Studio Test');await page.getByLabel('封面标题',{exact:true}).fill('STUDIO TEST');
  await page.getByLabel('上传项目封面').setInputFiles({name:'project.png',mimeType:'image/png',buffer:png});
  await expect(page.locator('.studio-cover img')).toHaveAttribute('src',/api\/media/);
  await page.getByRole('button',{name:'保存全部修改',exact:true}).click();await expect(page.getByRole('status')).toContainText('已保存');
  const data=await current(request);expect(data.content.projects).toHaveLength(original.projects.length+1);
  expect((await request.get(data.content.projects.at(-1).image)).status()).toBe(200);
  await page.reload();await expect(page.locator('.studio-entries')).toContainText('Studio Test');
  const front=await context.newPage();await front.emulateMedia({reducedMotion:'reduce'});await front.goto('/stage');
  await expect(front.locator('.preferences')).toHaveCount(0);await expect(front.locator('.stage-work-item')).toHaveCount(original.projects.length+1);
  await front.getByRole('button',{name:'View Studio Test project'}).scrollIntoViewIfNeeded();await front.getByRole('button',{name:'View Studio Test project'}).click();await expect(front.getByRole('dialog',{name:'Studio Test'})).toBeVisible();await front.close();
  await page.screenshot({path:'../work/admin-project-desktop.png',fullPage:true});
});

test('city and skill photos can be added, categorized, reordered and removed',async({page,context,request})=>{
  test.setTimeout(60000);
  await page.goto('/admin');await page.getByRole('button',{name:/城市与生活/}).click();await page.getByRole('button',{name:'＋ 新增城市'}).click();
  await page.getByLabel('展示标题',{exact:true}).fill('Osaka Test');await page.getByLabel('城市名称',{exact:true}).fill('Osaka Test');const citySlug=await page.getByLabel('英文标识').inputValue();
  await page.getByLabel('上传展览照片').setInputFiles([{name:'evening.png',mimeType:'image/png',buffer:png},{name:'lunch.png',mimeType:'image/png',buffer:png}]);
  await expect(page.locator('.studio-photo-row')).toHaveCount(2);await expect(page.locator('.studio-editor')).toHaveAttribute('aria-busy','false');
  await page.getByLabel('照片 1 · 描述',{exact:true}).fill('Evening food');await page.getByLabel('照片 1 分类',{exact:true}).selectOption('food');
  await page.getByRole('button',{name:'照片 1 下移',exact:true}).click();await expect(page.getByLabel('照片 2 · 描述',{exact:true})).toHaveValue('Evening food');
  await page.getByRole('button',{name:'保存全部修改'}).click();await expect(page.getByRole('status')).toContainText('已保存');
  const collection=await (await request.get(`/api/collections/cities/${citySlug}`)).json();expect(collection[1].category).toBe('food');
  const front=await context.newPage();await front.emulateMedia({reducedMotion:'reduce'});await front.goto('/stage');const city=front.getByRole('button',{name:'Osaka Test',exact:true});await city.scrollIntoViewIfNeeded();await expect(front.locator('.rose-garden-canvas')).toHaveAttribute('data-orbit-nodes',String(original.cities.length+1),{timeout:15000});await city.press('Enter');const album=front.getByRole('dialog',{name:/Osaka Test/});await expect(album).toBeVisible();await album.getByRole('button',{name:'FOOD',exact:true}).click();await expect(album.locator('.city-polaroid')).toHaveCount(1);await front.close();
  await page.getByRole('button',{name:/技能与照片/}).click();await page.getByRole('button',{name:'＋ 新增技能'}).click();await page.getByLabel('展示标题',{exact:true}).fill('Piano Notes');
  await page.getByLabel('上传展览照片').setInputFiles({name:'piano.png',mimeType:'image/png',buffer:png});await expect(page.locator('.studio-photo-row')).toHaveCount(1);await expect(page.locator('.studio-editor')).toHaveAttribute('aria-busy','false');await page.getByRole('button',{name:'保存全部修改'}).click();await expect(page.getByRole('status')).toContainText('已保存');
  const skillFront=await context.newPage();await skillFront.emulateMedia({reducedMotion:'reduce'});await skillFront.goto('/stage');const explore=skillFront.getByRole('button',{name:'Explore Piano Notes photos',exact:true});await explore.scrollIntoViewIfNeeded();await explore.click();await expect(skillFront.getByRole('dialog',{name:'Piano Notes',exact:true}).locator('.gallery-card')).toHaveCount(1);await skillFront.close();
  await page.getByRole('button',{name:'移除照片',exact:true}).click();await expect(page.locator('.studio-photo-row')).toHaveCount(0);
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'移除',exact:true}).click();await page.getByRole('button',{name:'保存全部修改'}).click();await expect(page.getByRole('status')).toContainText('已保存');expect((await current(request)).content.skills).toHaveLength(original.skills.length);
});

test('writes reject cross-origin requests, invalid data and stale versions; empty sections remain usable',async({request,page})=>{
  const snapshot=await current(request),body={revision:snapshot.revision,content:snapshot.content};
  expect((await request.put('/api/admin/content',{data:body})).status()).toBe(403);
  expect((await request.put('/api/admin/content',{headers:{...headers,Origin:'https://untrusted.example'},data:body})).status()).toBe(403);
  const invalid=structuredClone(body);invalid.content.projects[0].slug='../escape';expect((await request.put('/api/admin/content',{headers,data:invalid})).status()).toBe(400);
  expect((await request.post('/api/admin/upload',{headers,multipart:{file:{name:'unsafe.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')}}})).status()).toBe(400);
  const empty={projects:[],skills:[],cities:[]};const first=await request.put('/api/admin/content',{headers,data:{revision:snapshot.revision,content:empty}});expect(first.status()).toBe(200);
  expect((await request.put('/api/admin/content',{headers,data:body})).status()).toBe(409);
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/stage');await expect(page.getByRole('heading',{name:'New work is taking shape.'})).toBeVisible();await expect(page.getByText('New horizons await.',{exact:true})).toBeVisible();
});

test('studio adapts to a phone and preserves a draft when switching sections',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/admin');await page.getByRole('button',{name:'＋ 新增项目'}).click();await page.getByLabel('项目名称',{exact:true}).fill('Mobile Draft');await page.getByRole('button',{name:/城市与生活/}).click();await page.getByRole('button',{name:/01 \/ CRAFTER/}).click();await expect(page.locator('.studio-entries')).toContainText('Mobile Draft');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'../work/admin-mobile.png',fullPage:true});await page.getByRole('button',{name:'保存全部修改'}).click();await expect(page.getByRole('status')).toContainText('已保存');
});
