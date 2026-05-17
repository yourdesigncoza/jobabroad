export interface CheckoutSession {
  /** Redirect the user here to complete payment. */
  checkoutUrl: string;
  /** Provider's transaction reference — store for webhook correlation. */
  externalRef: string;
}

export interface VerifiedWebhook {
  /** Matches CheckoutSession.externalRef. */
  externalRef: string;
  status: 'success' | 'failed' | 'pending';
  /** For sanity check against expected amount (R495 = 49500). */
  amountCents: number;
  /**
   * Normalised by the provider impl from its provider-specific carrier field
   * (Paystack: data.metadata.userId; PayFast: custom_str1; etc).
   * Callers consume this directly and never touch the raw metadata blob.
   */
  userId: string;
  /** Raw provider payload — debugging only; callers MUST NOT rely on it. */
  metadata?: Record<string, unknown>;
}

export interface InitiateCheckoutOptions {
  userId: string;
  email: string;
  /** R495 = 49500. */
  amountCents: number;
  /** Where to send the user after a successful payment redirect. */
  successUrl: string;
  /** Where to send the user if they cancel. */
  cancelUrl: string;
}

export interface PaymentProvider {
  initiateCheckout(opts: InitiateCheckoutOptions): Promise<CheckoutSession>;
  /** Throws on invalid signature; returns normalised event. */
  verifyWebhook(req: Request): Promise<VerifiedWebhook>;
  /**
   * Server-to-server transaction lookup — used as a webhook fallback on the
   * post-payment landing page. If the webhook hasn't fired/landed yet but the
   * user is back with a provider reference, we can confirm directly with the
   * provider that they actually paid before flipping tier.
   * Throws on lookup failure (network, 4xx, unknown reference).
   */
  verifyTransaction(externalRef: string): Promise<VerifiedWebhook>;
}
