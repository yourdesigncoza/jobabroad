import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { VerifiedWebhook } from './types';

export const PRICE_CENTS = 49500; // R495.00
export const FOLLOWUP_CREDITS = 5;

export type ApplyResult =
  | { ok: true; flipped: boolean; reason?: string }
  | { ok: false; status: number; reason: string };

/**
 * Idempotently flips the user's tier to 'paid' on a verified successful payment.
 * Used by both the webhook handler and the post-payment landing page (as a
 * fallback when the webhook hasn't fired/landed yet).
 *
 * `flipped: false` with a reason indicates a no-op (e.g. duplicate webhook,
 * not-success status). `ok: false` indicates a hard failure that should be
 * surfaced (amount mismatch, missing user, DB error).
 */
export async function applySuccessfulPayment(evt: VerifiedWebhook): Promise<ApplyResult> {
  if (evt.status !== 'success') {
    return { ok: true, flipped: false, reason: 'not_success' };
  }

  if (evt.amountCents !== PRICE_CENTS) {
    console.error('[applySuccessfulPayment] amount mismatch', evt.amountCents, 'expected', PRICE_CENTS);
    return { ok: false, status: 400, reason: 'amount_mismatch' };
  }

  if (!evt.userId) {
    return { ok: false, status: 400, reason: 'missing_user_id' };
  }

  const svc = createSupabaseServiceClient();

  const { data: profile, error: readErr } = await svc
    .from('profiles')
    .select('tier, last_payment_ref')
    .eq('user_id', evt.userId)
    .single();
  if (readErr || !profile) {
    console.error('[applySuccessfulPayment] profile not found', evt.userId, readErr);
    return { ok: false, status: 404, reason: 'profile_not_found' };
  }

  if (profile.last_payment_ref === evt.externalRef) {
    return { ok: true, flipped: false, reason: 'duplicate' };
  }

  const { error: updateErr } = await svc
    .from('profiles')
    .update({
      tier: 'paid',
      paid_email_credits: FOLLOWUP_CREDITS,
      last_payment_ref: evt.externalRef,
    })
    .eq('user_id', evt.userId);

  if (updateErr) {
    console.error('[applySuccessfulPayment] db update failed', updateErr);
    return { ok: false, status: 500, reason: 'db_error' };
  }

  return { ok: true, flipped: true };
}
