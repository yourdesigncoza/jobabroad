'use client';

import { useState } from 'react';
import type { Band } from '@/lib/scoring/types';

interface Props {
  /** Drives heading + intro paragraphs. Use the user's actual band so the
   *  copy speaks to their situation rather than a generic pitch. */
  band: Band;
  /** When true, render with the #premium anchor + scroll-margin (used on
   *  /score so the sidebar "Go Premium" deep-link lands here). On the
   *  dashboard there's no need for either. */
  withAnchor?: boolean;
}

/** Shared R495 pitch — band-agnostic so the copy reads identically wherever
 *  the upsell appears (score page, dashboard). */
const PLAN_INTRO =
  "For R495, we'll review your profile and give you a clear, personalised action plan, emailed to you immediately and available inside your personal dashboard. You'll know what to fix first, which work-abroad routes look most realistic for you, what to avoid wasting money on, and which trusted partners may be worth speaking to.";
const CALL_INTRO =
  "When you're ready, you can also book a 15-minute call so we can walk through your situation properly and make sure your next steps are clear.";

/** Band-specific opener — speaks to the user's actual score before the
 *  shared R495 pitch. */
const BAND_UPSELL: Record<Band, { heading: string; opener: string }> = {
  strong_potential: {
    heading: "You've got a real shot. Want to move faster?",
    opener: "The headline says you're application-ready, but ready doesn't mean automatic.",
  },
  needs_prep: {
    heading: "Don't spend money in the wrong order.",
    opener:
      'Your score shows real potential, but one or two gaps could block your application if you deal with them too late.',
  },
  high_blockers: {
    heading: 'Not the result you wanted? Not the end of the road either.',
    opener: "The blockers above are real, but they're rarely permanent.",
  },
};

export default function PremiumUpsell({ band, withAnchor }: Props) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleUpgrade() {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const r = await fetch('/api/payments/checkout', { method: 'POST' });
      const j = (await r.json()) as { checkoutUrl?: string; error?: string; detail?: string };
      if (!r.ok || !j.checkoutUrl) {
        setCheckoutError(j.detail ?? j.error ?? "We couldn't start checkout. Please try again.");
        setCheckingOut(false);
        return;
      }
      window.location.href = j.checkoutUrl;
    } catch {
      setCheckoutError("Couldn't reach the payment provider. Check your connection and try again.");
      setCheckingOut(false);
    }
  }

  return (
    <div
      id={withAnchor ? 'premium' : undefined}
      className={`rounded-2xl p-6 sm:p-8 flex flex-col gap-4${withAnchor ? ' scroll-mt-24' : ''}`}
      style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
    >
      <h2 className="font-display font-bold uppercase tracking-wide text-lg">
        {BAND_UPSELL[band].heading}
      </h2>
      {[BAND_UPSELL[band].opener, PLAN_INTRO, CALL_INTRO].map((para, i) => (
        <p
          key={i}
          className="font-body text-sm leading-relaxed"
          style={{ color: 'rgba(248,245,240,0.85)' }}
        >
          {para}
        </p>
      ))}

      {/* Highlighted call panel — single biggest selling point. */}
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{
          backgroundColor: 'rgba(201,168,76,0.18)',
          border: '1.5px solid #C9A84C',
        }}
      >
        <span
          aria-hidden
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 36,
            height: 36,
            backgroundColor: '#C9A84C',
            color: '#1B4D3E',
            fontSize: 18,
          }}
        >
          ☎
        </span>
        <div className="flex flex-col gap-0.5">
          <p
            className="font-display uppercase tracking-wider text-[0.65rem] font-bold"
            style={{ color: '#C9A84C' }}
          >
            Optional
          </p>
          <p className="font-body text-sm font-semibold" style={{ color: '#F8F5F0' }}>
            Book a 15-minute call after reading your plan
          </p>
          <p className="font-body text-xs" style={{ color: 'rgba(248,245,240,0.75)' }}>
            Your personalised action plan is emailed to you immediately. When you&apos;re ready, book a short call and we&apos;ll walk through your next steps together.
          </p>
        </div>
      </div>

      <ul
        className="font-body text-sm flex flex-col gap-1.5"
        style={{ color: 'rgba(248,245,240,0.85)' }}
      >
        <li>• Personalised action plan</li>
        <li>• Immediate email delivery</li>
        <li>• Saved in your dashboard</li>
        <li>• Realistic work-abroad route suggestions</li>
        <li>• Trusted partner recommendations</li>
        <li>• 5 written follow-up questions</li>
        <li>• Optional 15-minute review call</li>
      </ul>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={checkingOut}
        className="inline-flex self-start items-center justify-center px-6 py-3 rounded-xl font-display font-bold uppercase tracking-wide text-sm disabled:opacity-60"
        style={{ backgroundColor: '#ff751f', color: '#FFFFFF' }}
      >
        {checkingOut ? 'Loading checkout…' : 'Get My Action Plan – R495'}
      </button>
      {checkoutError && (
        <p className="font-body text-xs" style={{ color: '#FFD1B8' }}>
          {checkoutError}
        </p>
      )}
      <p className="font-body text-xs" style={{ color: 'rgba(248,245,240,0.65)' }}>
        One-off payment. No subscription.
      </p>
    </div>
  );
}
