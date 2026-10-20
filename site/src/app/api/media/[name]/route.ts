import {cloudMode,supabaseServer,mediaBucket} from '@/lib/studio-cloud';
import { promises as fs } from 'node:fs';import path from 'node:path';import { studioDirectory } from '@/lib/studio-store';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){
  const {name}=await params;if(!/^[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(name))return new Response('Not found',{status:404});
  if(cloudMode()){
    const {data,error}=await supabaseServer().storage.from(mediaBucket).createSignedUrl(name,3600);
    if(error||!data)return new Response('Not found',{status:404});
    return new Response(null,{status:307,headers:{Location:data.signedUrl,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  try{const bytes=await fs.readFile(path.join(studioDirectory(),'media',name));return new Response(bytes,{headers:{'Content-Type':({'png':'image/png','jpg':'image/jpeg','webp':'image/webp','gif':'image/gif'} as Record<string,string>)[name.split('.').pop()!],'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Not found',{status:404});}
}
