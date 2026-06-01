/**
 * Access gating for the (currently shelved) paid tier.
 *
 * Payments are switched OFF by default. While off, every registered user who
 * completes the eligibility check gets the full personalised report + on-screen
 * evaluation for free — no Paystack step. The payment code (lib/payments/*,
 * /api/payments/*, /members/[category]/paid) is left dormant but intact; flip
 * NEXT_PUBLIC_PAYMENTS_ENABLED=true to bring the R495 tier back.
 *
 * Two gates that now move together while payments are shelved:
 *   - hasFullAccess  → report PDF + evaluation. Open to all when payments off.
 *   - hasCoachAccess → the Abroad assistant + journey tracker. Also open to all
 *                      when payments off (so much now feeds it that withholding
 *                      it left the work dormant); paid-only once payments are on,
 *                      so re-enabling payments restores the upsell unchanged.
 *
 * Paid users additionally carry a rolling-90-day window (lib/agent/access.ts);
 * free users have no window to enforce. The 30/day chat cap applies to everyone
 * as a cost/abuse fuse, regardless of tier.
 */

export const PAYMENTS_ENABLED =
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

/** Full report + evaluation. Everyone has it when payments are shelved. */
export function hasFullAccess(tier?: string | null): boolean {
  return !PAYMENTS_ENABLED || tier === 'paid';
}

/** Coach + journey tracker. Open to all when payments off; paid-only when on. */
export function hasCoachAccess(tier?: string | null): boolean {
  return !PAYMENTS_ENABLED || tier === 'paid';
}
