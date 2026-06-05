import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getJourney } from './journey';

/**
 * Brings an assessment-completer into the proactive-nudge funnel the moment they
 * first see their score:
 *
 *   1. Persists their journey row (so the cron has milestones to nudge toward).
 *      Without this, completers who never open the coach have no user_journey
 *      row and are invisible to claim_nudge_candidates.
 *   2. Starts the 7-day idle clock by stamping agent_last_active_at — but only
 *      when it is still NULL. That makes it idempotent: re-viewing the score
 *      never resets the clock, and it never clobbers a newer timestamp written
 *      by real coach activity (rollWindow).
 *
 * Fire-and-forget from the score page via waitUntil — never block render on it.
 */
export async function seedFollowupOnScoreView(
  userId: string,
  category: string,
): Promise<void> {
  // Upserts the journey row from the latest submitted assessment if missing.
  await getJourney(userId, category);

  const svc = createSupabaseServiceClient();
  await svc
    .from('profiles')
    .update({ agent_last_active_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('agent_last_active_at', null);
}
