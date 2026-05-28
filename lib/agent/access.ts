import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

export const AGENT_WINDOW_DAYS = 90;
const WINDOW_MS = AGENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/** NULL window = eligible (a paid user who hasn't been touched yet); it gets
 *  rolled on first activity. Otherwise the window must not have lapsed. */
export function isWindowOpen(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export function windowExpiry(): string {
  return new Date(Date.now() + WINDOW_MS).toISOString();
}

/** Rolls the rolling-90-day window forward and stamps activity. Call on real
 *  user activity (chat message, coach-page mount) — never during render. */
export async function rollWindow(svc: SupabaseClient, userId: string): Promise<void> {
  const now = new Date().toISOString();
  await svc
    .from('profiles')
    .update({ agent_access_expires_at: windowExpiry(), agent_last_active_at: now })
    .eq('user_id', userId);
}
