import { readStudio } from '@/lib/studio-store';
export const dynamic='force-dynamic';export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{kind:string;slug:string}>}){
  const {kind,slug}=await params;if(!['skills','cities'].includes(kind))return Response.json([],{status:404});
  const {content}=await readStudio();const collection=(kind==='skills'?content.skills:content.cities).find(item=>item.slug===slug);return Response.json(collection?.photos??[],{status:collection?200:404,headers:{'Cache-Control':'no-store'}});
}
