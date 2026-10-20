export type StudioPhoto = { src: string; alt: string; caption: string; category?: 'portrait' | 'scenery' | 'food' };
export type StudioProject = { slug: string; title: string; name: string; category: string; summary: string; detail: string; tags: string[]; image: string; github: string };
export type StudioSkill = { slug: string; title: string; label: string; text: string; tags: string; photos: StudioPhoto[] };
export type StudioCity = { slug: string; name: string; title: string; color: string; ink: string; motif: string; photos: StudioPhoto[] };
export type SiteContent = { projects: StudioProject[]; skills: StudioSkill[]; cities: StudioCity[] };
export type ContentSnapshot = { revision: string; content: SiteContent };

const asset = (value: unknown) => typeof value === 'string' && (/^\/images\/[a-zA-Z0-9_./% -]+$/.test(value) || /^\/api\/media\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(value)) && !value.includes('..');
export const isStudioAsset = asset;
export function validateContent(value: unknown): asserts value is SiteContent {
  const error = (message: string): never => { throw new Error(message); };
  const object = (item: unknown): Record<string,unknown> => item !== null && typeof item === 'object' && !Array.isArray(item) ? item as Record<string,unknown> : error('内容格式不正确');
  const text = (item: Record<string,unknown>, key: string, max=1000, required=true) => { const value=item[key]; if(typeof value!=='string'||value.length>max||(required&&!value.trim()))error(`字段 ${key} 不能为空或超出长度限制`); };
  const photos = (list: unknown, city: boolean) => {
    if(!Array.isArray(list)||list.length>1000)error('照片列表格式不正确（每组最多1000张）');
    for(const item of list as unknown[]){const p=object(item);if(!asset(p.src))error('图片路径不正确');text(p,'alt',500);text(p,'caption',500,false);if(city&&!['portrait','scenery','food'].includes(String(p.category)))error('请选择照片分类');}
  };
  const data=object(value);
  for(const key of ['projects','skills','cities']){
    const list=data[key];if(!Array.isArray(list)||list.length>100)error('每个板块最多100项');
    const slugs=new Set<string>();
    for(const entry of list as unknown[]){
      const item=object(entry);text(item,'slug',80);const slug=String(item.slug);
      if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slugs.has(slug))error('标识需为唯一的英文小写、数字或短横线');slugs.add(slug);
      text(item,'title',120);
      if(key==='projects'){
        for(const field of ['name','category'])text(item,field,150);for(const field of ['summary','detail'])text(item,field,10000);
        if(!asset(item.image))error('请选择项目封面');
        if(typeof item.github!=='string'||(item.github!==''&&!/^https:\/\/[^\s]+$/.test(item.github)))error('项目链接请使用 https:// 地址');
        if(!Array.isArray(item.tags)||item.tags.length>30||item.tags.some(tag=>typeof tag!=='string'||tag.length>100))error('项目标签格式不正确');
      } else if(key==='skills'){
        text(item,'label',200);text(item,'text',10000);text(item,'tags',1000,false);photos(item.photos,false);
      } else {
        text(item,'name',120);text(item,'motif',1000,false);for(const field of ['color','ink'])if(!/^#[0-9a-fA-F]{6}$/.test(String(item[field])))error('颜色请使用六位十六进制色值');photos(item.photos,true);
      }
    }
  }
}
