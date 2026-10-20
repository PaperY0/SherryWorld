'use client';
import { useEffect, useState, type ReactNode } from 'react';
const headers = { 'Content-Type': 'application/json', 'x-sherry-admin': '1' };

export async function adminFetch(url: string, init?: RequestInit) {
  let response = await fetch(url, init);
  if (response.status === 401) {
    const refresh = await fetch('/api/admin/session', { method: 'POST', headers, body: JSON.stringify({ refresh: true }) });
    if (refresh.ok) response = await fetch(url, init);
    else window.dispatchEvent(new Event('studio-session-expired'));
  }
  return response;
}

export function AdminSession({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ cloud: boolean; configured: boolean; authenticated: boolean } | null>(null);
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    void fetch('/api/admin/session', { cache: 'no-store' }).then(r => r.json()).then(async s => {
      if(s.cloud && s.configured && !s.authenticated){
        const refresh=await fetch('/api/admin/session',{method:'POST',headers,body:JSON.stringify({refresh:true})});
        if(refresh.ok)s={...s,authenticated:true};
      }
      setSession(s);if(s.authenticated)setOpened(true);
    }).catch(() => setError('无法连接登录服务，请刷新重试。'));
    const expired = () => setSession(s => s ? { ...s, authenticated: false } : s);
    window.addEventListener('studio-session-expired', expired);
    return () => window.removeEventListener('studio-session-expired', expired);
  }, []);
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/session', { method: 'POST', headers, body: JSON.stringify({ email, password }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setPassword(''); setSession(s => s ? { ...s, authenticated: true } : s); setOpened(true);
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  };
  return <>
    {opened && <div hidden={!session?.authenticated}>{children}</div>}
    {session?.authenticated && session.cloud && <button className="studio-logout" onClick={async () => {
      if (!window.confirm('退出前请确认修改已保存。确定退出？')) return;
      await fetch('/api/admin/session', { method: 'DELETE', headers }); window.location.reload();
    }}>Sign out ↗</button>}
    {!session?.authenticated && <main className="studio-login"><form onSubmit={login}><a href="/stage" className="studio-brand">SHERRY<span>CONTENT ATELIER</span></a>
      <p>PRIVATE STUDIO</p><h1>Sign in to your atelier</h1>
      {!session ? <p>{error || 'Connecting…'}</p> : !session.configured ? <p>云端配置尚未完成，请联系网站管理员。</p> : <>
        <label className="studio-field"><span>Email</span><input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label className="studio-field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        <button className="studio-save" disabled={busy}>{busy ? 'Signing in…' : 'Sign in ↗'}</button>
        {error && <p role="alert" className="studio-error">{error}</p>}<small>使用你在 Supabase Authentication 创建的后台账号登录。</small>
      </>}
    </form></main>}
  </>;
}
