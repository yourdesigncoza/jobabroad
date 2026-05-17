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

const BAND_UPSELL: Record<Band, { heading: string; intro: string[] }> = {
  strong_potential: {
    heading: "You've got a real shot. Want to move faster?",
    intro: [
      "The headline says you're application-ready, but ready doesn't mean automatic.",
      "The R495 upgrade saves you time. We talk through your situation on a 15-minute call, then write a personalised action plan: which country to target first, which documents to apostille this week, which recruiters to actually contact.",
      'Tailored to you, not just another auto-generated summary.',
    ],
  },
  needs_prep: {
    heading: "Don't spend money in the wrong order.",
    intro: [
      'Your score shows real potential, but one or two gaps could block your application if you deal with them too late.',
      'For R495, we review your situation on a 15-minute call and then write a personalised action plan showing what to fix first, which route looks most realistic, and what not to waste money on.',
    ],
  },
  high_blockers: {
    heading: 'Not the result you wanted? Not the end of the road either.',
    intro: [
      "The blockers above are real, but they're rarely permanent.",
      "The R495 upgrade gives you a clear next move. We talk through your situation on a 15-minute call, then write a personalised action plan: whether to close those gaps now or pivot to a different route, what NOT to spend money on, what's realistic in the next 12 months.",
      'Honest and specific to you, not just another auto-generated summary.',
    ],
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
      {BAND_UPSELL[band].intro.map((para, i) => (
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
            Includes a live call
          </p>
          <p className="font-body text-sm font-semibold" style={{ color: '#F8F5F0' }}>
            15-minute review call to talk through your plan
          </p>
          <p className="font-body text-xs" style={{ color: 'rgba(248,245,240,0.75)' }}>
            We use the call to understand your specific situation, then write your personalised report right after.
          </p>
        </div>
      </div>

      <ul
        className="font-body text-sm flex flex-col gap-1.5"
        style={{ color: 'rgba(248,245,240,0.85)' }}
      >
        <li>• Personalised PDF report with next steps</li>
        <li>• Recommended vetted partners for your category</li>
        <li>• 5 written follow-up questions</li>
      </ul>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={checkingOut}
        className="inline-flex self-start items-center justify-center px-6 py-3 rounded-xl font-display font-bold uppercase tracking-wide text-sm disabled:opacity-60"
        style={{ backgroundColor: '#ff751f', color: '#FFFFFF' }}
      >
        {checkingOut ? 'Loading checkout…' : 'Unlock for R495 →'}
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
