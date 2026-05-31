/**
 * Access gating for the (currently shelved) paid tier.
 *
 * Payments are switched OFF by default. While off, every registered user who
 * completes the eligibility check gets the full personalised report + on-screen
 * evaluation for free — no Paystack step. The payment code (lib/payments/*,
 * /api/payments/*, /members/[category]/paid) is left dormant but intact; flip
 * NEXT_PUBLIC_PAYMENTS_ENABLED=true to bring the R495 tier back.
 *
 * Two distinct gates so the "free" launch can withhold some perks:
 *   - hasFullAccess  → report PDF + evaluation. Open to all when payments off.
 *   - hasCoachAccess → AI coach + booking call. Kept paid-only (hidden for now)
 *                      even while payments are off, so re-enabling payments
 *                      restores them without further changes.
 */

export const PAYMENTS_ENABLED =
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

/** Full report + evaluation. Everyone has it when payments are shelved. */
export function hasFullAccess(tier?: string | null): boolean {
  return !PAYMENTS_ENABLED || tier === 'paid';
}

/** Coach + booking call — deliberately paid-only, hidden while payments off. */
export function hasCoachAccess(tier?: string | null): boolean {
  return tier === 'paid';
}
