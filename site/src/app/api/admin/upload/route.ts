import { promises as fs } from 'node:fs';
import path from 'node:path';import { randomUUID } from 'node:crypto';
import { localRequest,studioDirectory } from '@/lib/studio-store';
export const runtime='nodejs';
export async function POST(request:Request){
  if(!localRequest(request,true))return Response.json({error:'请求来源不允许'},{status:403});
  if(Number(request.headers.get('content-length'))>17_000_000)return Response.json({error:'图片不能超过15MB'},{status:413});
  try{
    const form=await request.formData(),file=form.get('file');if(!(file instanceof File)||file.size>15*1024*1024||file.size===0)throw new Error('请选择15MB以内的图片');
    const bytes=Buffer.from(await file.arrayBuffer());let ext='';
    if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';
    else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)ext='jpg';
    else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')ext='webp';
    else if(['GIF87a','GIF89a'].includes(bytes.toString('ascii',0,6)))ext='gif';
    if(!ext)throw new Error('仅支持 JPG、PNG、WebP、GIF 图片');
    const name=`${randomUUID()}.${ext}`,folder=path.join(studioDirectory(),'media');await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,name),bytes,{flag:'wx'});
    return Response.json({src:`/api/media/${name}`,name:file.name});
  }catch(error){return Response.json({error:(error as Error).message},{status:400});}
}
