import 'server-only';
import { cookies } from 'next/headers';
import { cloudMode, cloudConfigured, supabaseAuth, allowedEmail } from './studio-cloud';

export function sameOriginWrite(request: Request) {
  if (request.headers.get('x-sherry-admin') !== '1' || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === (request.headers.get('host') || new URL(request.url).host); } catch { return false; }
}
export function loopback(request: Request) {
  try { return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(`http://${request.headers.get('host') || new URL(request.url).host}`).hostname); } catch { return false; }
}
export async function adminAuthorized(request: Request, write = false) {
  if (write && !sameOriginWrite(request)) return false;
  if (!cloudMode()) return loopback(request);
  if (!cloudConfigured()) return false;
  const token = (await cookies()).get('sherry-access')?.value;
  if (!token) return false;
  const { data, error } = await supabaseAuth().auth.getUser(token);
  return !error && allowedEmail(data.user?.email);
}
