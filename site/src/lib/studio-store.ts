import 'server-only';
import { cloudMode, supabaseServer } from './studio-cloud';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { stageWorks } from '@/components/stage/stage-portfolio';
import { cityAlbums } from '@/components/stage/city-albums';
import { defaultSkills } from '@/content/default-skills';
import { validateContent, type SiteContent, type ContentSnapshot } from '@/content/site-content';
export const studioDirectory = () => process.env.SHERRY_CONTENT_DIR || path.join(process.cwd(),'data','studio');
const contentPath=()=>path.join(studioDirectory(),'content.json');
const revision=(content:SiteContent)=>createHash('sha256').update(JSON.stringify(content)).digest('hex');
async function legacyPhotos(kind:string,slug:string){try{return JSON.parse(await fs.readFile(path.join(process.cwd(),'public','images',kind,slug,'photos.json'),'utf8'));}catch{return [];}}
async function readLocalStudio():Promise<ContentSnapshot>{
  let content:SiteContent;
  try{content=JSON.parse(await fs.readFile(contentPath(),'utf8'));validateContent(content);}
  catch(error){
    if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;
    content={projects:JSON.parse(JSON.stringify(stageWorks)),skills:await Promise.all(defaultSkills.map(async skill=>({...skill,photos:await legacyPhotos('skills',skill.slug)}))),cities:await Promise.all(cityAlbums.map(async city=>({...city,photos:await legacyPhotos('life',city.slug)})))};
  }
  return {content,revision:revision(content)};
}
export async function readStudio():Promise<ContentSnapshot>{
  if(!cloudMode())return readLocalStudio();
  const db=supabaseServer();
  const {data,error}=await db.from('sherry_site_content').select('content,revision').eq('id','main').maybeSingle();
  if(error)throw new Error('Cloud content could not be loaded. Check the Supabase migration.');
  if(data){validateContent(data.content);return data as ContentSnapshot;}
  const initial=await readLocalStudio();
  // Concurrent first requests must never overwrite an already seeded document.
  const {error:seedError}=await db.from('sherry_site_content').upsert({id:'main',...initial},{onConflict:'id',ignoreDuplicates:true});
  if(seedError)throw new Error('Cloud content could not be initialized');
  const {data:seed,error:readError}=await db.from('sherry_site_content').select('content,revision').eq('id','main').single();
  if(readError)throw new Error('Cloud content could not be loaded');
  validateContent(seed.content);return seed as ContentSnapshot;
}
const state=globalThis as typeof globalThis & {sherryStudioQueue?:Promise<unknown>};
export async function saveStudio(content:unknown,expected:string):Promise<ContentSnapshot>{
  validateContent(content);
  if(cloudMode()){
    const {data,error}=await supabaseServer().rpc('sherry_save_content',{expected_revision:expected,next_content:content,next_revision:revision(content)});
    if(error)throw new Error(error.message.includes('CONFLICT')?'CONFLICT':'Cloud save failed. Please try again.');
    return data as ContentSnapshot;
  }
  const operation=(state.sherryStudioQueue??Promise.resolve()).catch(()=>{}).then(async()=>{
    const current=await readStudio();if(current.revision!==expected)throw new Error('CONFLICT');
    const folder=studioDirectory();await fs.mkdir(path.join(folder,'backups'),{recursive:true});
    await fs.writeFile(path.join(folder,'backups',`${Date.now()}-${randomUUID()}.json`),JSON.stringify(current.content,null,2),'utf8');
    const temp=path.join(folder,`${randomUUID()}.tmp`);await fs.writeFile(temp,JSON.stringify(content,null,2),'utf8');
    try{await fs.rename(temp,contentPath());}catch(error){await fs.rm(temp,{force:true});throw error;}
    return {content,revision:revision(content)};
  });
  state.sherryStudioQueue=operation;return operation;
}
export function localRequest(request:Request,write=false){
  const url=new URL(request.url);
  const host=request.headers.get('host')||url.host;
  let hostname:string;try{hostname=new URL(`http://${host}`).hostname;}catch{return false;}
  if(!['localhost','127.0.0.1','[::1]'].includes(hostname))return false;
  if(write){
    if(request.headers.get('x-sherry-admin')!=='1'||request.headers.get('sec-fetch-site')==='cross-site')return false;
    const origin=request.headers.get('origin');if(origin){try{if(new URL(origin).host!==host||!['http:','https:'].includes(new URL(origin).protocol))return false;}catch{return false;}}
  }
  return true;
}
