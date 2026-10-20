import { cookies } from 'next/headers';
import { adminAuthorized, sameOriginWrite } from '@/lib/studio-auth';
import { allowedEmail, cloudConfigured, cloudMode, supabaseAuth, supabaseServer } from '@/lib/studio-cloud';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const noCache = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  return Response.json({ cloud: cloudMode(), configured: !cloudMode() || cloudConfigured(), authenticated: await adminAuthorized(request) }, { headers: noCache });
}
export async function POST(request: Request) {
  if (!sameOriginWrite(request)) return Response.json({ error: '请求来源不允许' }, { status: 403 });
  if (!cloudMode() || !cloudConfigured()) return Response.json({ error: '云端登录尚未配置' }, { status: 503 });
  if (Number(request.headers.get('content-length')) > 4096) return Response.json({ error: '请求过大' }, { status: 413 });
  try {
    const body = await request.json();
    const jar = await cookies();
    const auth = supabaseAuth().auth;
    const result = body.refresh
      ? await auth.refreshSession({ refresh_token: jar.get('sherry-refresh')?.value || '' })
      : allowedEmail(body.email) && typeof body.password === 'string'
        ? await auth.signInWithPassword({ email: body.email.trim(), password: body.password })
        : null;
    if (!result || result.error || !result.data.session || !allowedEmail(result.data.user?.email)) return Response.json({ error: '登录失败，请检查邮箱和密码。' }, { status: 401, headers: noCache });
    const session = result.data.session;
    const options = { httpOnly: true, secure: !!process.env.VERCEL || new URL(request.url).protocol === 'https:', sameSite: 'lax' as const, path: '/' };
    jar.set('sherry-access', session.access_token, { ...options, maxAge: session.expires_in });
    jar.set('sherry-refresh', session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
    return Response.json({ authenticated: true }, { headers: noCache });
  } catch { return Response.json({ error: '登录服务暂时不可用，请稍后重试。' }, { status: 400, headers: noCache }); }
}
export async function DELETE(request: Request) {
  if (!sameOriginWrite(request)) return Response.json({ error: '请求来源不允许' }, { status: 403 });
  const jar = await cookies();
  const token = jar.get('sherry-access')?.value;
  if (token && cloudConfigured()) await supabaseServer().auth.admin.signOut(token).catch(() => {});
  jar.delete('sherry-access'); jar.delete('sherry-refresh');
  return Response.json({ authenticated: false }, { headers: noCache });
}
