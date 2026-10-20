import { readStudio,saveStudio,localRequest } from '@/lib/studio-store';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){if(!localRequest(request))return Response.json({error:'后台仅限本机访问'},{status:403});try{return Response.json(await readStudio(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'本地内容文件无法读取，请检查 data/studio/content.json'},{status:500});}}
export async function PUT(request:Request){
  if(!localRequest(request,true))return Response.json({error:'请求来源不允许'},{status:403});
  if(Number(request.headers.get('content-length'))>5_000_000)return Response.json({error:'内容过大'},{status:413});
  try{const body=await request.json();if(typeof body.revision!=='string')throw new Error('缺少版本号');return Response.json(await saveStudio(body.content,body.revision));}
  catch(error){const message=(error as Error).message;return Response.json({error:message==='CONFLICT'?'内容已在另一个窗口更新，请重新加载后再编辑':message},{status:message==='CONFLICT'?409:400});}
}
