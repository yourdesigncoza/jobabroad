// server-only guard lives in ./provider.ts (the public boundary).
import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  CheckoutSession,
  InitiateCheckoutOptions,
  PaymentProvider,
  VerifiedWebhook,
} from './types';

const PAYSTACK_API = 'https://api.paystack.co';

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
}

interface PaystackChargeEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: 'success' | 'failed' | 'abandoned' | 'pending';
    currency: string;
    metadata?: { userId?: string } & Record<string, unknown>;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    status: 'success' | 'failed' | 'abandoned' | 'pending';
    currency: string;
    metadata?: { userId?: string } & Record<string, unknown>;
  };
}

export class PaystackProvider implements PaymentProvider {
  private readonly secretKey: string;

  constructor(secretKey: string = process.env.PAYSTACK_SECRET_KEY ?? '') {
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
    this.secretKey = secretKey;
  }

  async initiateCheckout(opts: InitiateCheckoutOptions): Promise<CheckoutSession> {
    const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: opts.email,
        amount: opts.amountCents,
        currency: 'ZAR',
        callback_url: opts.successUrl,
        metadata: {
          userId: opts.userId,
          cancel_action: opts.cancelUrl,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`paystack_init_failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as PaystackInitResponse;
    if (!json.status || !json.data) {
      throw new Error(`paystack_init_rejected: ${json.message}`);
    }

    return {
      checkoutUrl: json.data.authorization_url,
      externalRef: json.data.reference,
    };
  }

  async verifyWebhook(req: Request): Promise<VerifiedWebhook> {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-paystack-signature') ?? '';
    if (!signatureHeader) {
      throw new Error('paystack_webhook_missing_signature');
    }

    const expected = createHmac('sha512', this.secretKey).update(rawBody).digest('hex');

    // Constant-time compare. Both are hex strings; same byte length when valid.
    const expectedBuf = Buffer.from(expected, 'utf8');
    const givenBuf = Buffer.from(signatureHeader, 'utf8');
    if (
      expectedBuf.length !== givenBuf.length ||
      !timingSafeEqual(expectedBuf, givenBuf)
    ) {
      throw new Error('paystack_webhook_bad_signature');
    }

    let event: PaystackChargeEvent;
    try {
      event = JSON.parse(rawBody) as PaystackChargeEvent;
    } catch {
      throw new Error('paystack_webhook_bad_json');
    }

    const userId = event.data?.metadata?.userId;
    if (typeof userId !== 'string' || !userId) {
      throw new Error('paystack_webhook_missing_user_id');
    }

    const status: VerifiedWebhook['status'] =
      event.data.status === 'success'
        ? 'success'
        : event.data.status === 'pending'
          ? 'pending'
          : 'failed';

    return {
      externalRef: event.data.reference,
      status,
      amountCents: event.data.amount,
      userId,
      metadata: event.data.metadata,
    };
  }

  async verifyTransaction(externalRef: string): Promise<VerifiedWebhook> {
    const res = await fetch(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(externalRef)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.secretKey}` },
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`paystack_verify_failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as PaystackVerifyResponse;
    if (!json.status || !json.data) {
      throw new Error(`paystack_verify_rejected: ${json.message}`);
    }

    const userId = json.data.metadata?.userId;
    if (typeof userId !== 'string' || !userId) {
      throw new Error('paystack_verify_missing_user_id');
    }

    const status: VerifiedWebhook['status'] =
      json.data.status === 'success'
        ? 'success'
        : json.data.status === 'pending'
          ? 'pending'
          : 'failed';

    return {
      externalRef: json.data.reference,
      status,
      amountCents: json.data.amount,
      userId,
      metadata: json.data.metadata,
    };
  }
}
