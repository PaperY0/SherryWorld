import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Explicit isolated local directories keep development and test writes off production.
export function cloudMode() {
  return !!process.env.VERCEL || (!process.env.SHERRY_CONTENT_DIR && !!process.env.SUPABASE_URL);
}
export function cloudConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.SHERRY_ADMIN_EMAIL);
}
export function supabaseServer() {
  if (!cloudConfigured()) throw new Error('Cloud storage is not configured');
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
export function supabaseAuth() {
  if (!cloudConfigured()) throw new Error('Cloud login is not configured');
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
export function allowedEmail(email?: string) {
  return !!email && email.toLowerCase() === process.env.SHERRY_ADMIN_EMAIL?.trim().toLowerCase();
}
export const mediaBucket = 'sherry-media';
