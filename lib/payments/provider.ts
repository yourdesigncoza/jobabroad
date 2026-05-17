import 'server-only';
import { PaystackProvider } from './paystack';
import type { PaymentProvider } from './types';

/**
 * Single source of truth for which payment provider is wired.
 *
 * To swap providers (e.g. PayFast):
 *   1. Add `lib/payments/payfast.ts` implementing `PaymentProvider`.
 *   2. Change the body below to `return new PayFastProvider();`.
 *   3. Update `.env.example` with the new env keys.
 * No caller-side change required.
 */
export function getPaymentProvider(): PaymentProvider {
  return new PaystackProvider();
}
