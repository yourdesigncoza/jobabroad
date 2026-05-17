'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Band, DimensionResult } from '@/lib/scoring/types';

interface Props {
  categoryLabel: string;
  overall: number;
  band: Band;
  dimensions: DimensionResult[];
  whatsWorking: string;
  whatsBlocking: string;
  isPaid: boolean;
  /** When true, the page shows a small "we've emailed you a copy" line. */
  emailedCopy: boolean;
}

interface BandPreset {
  label: string;
  tagline: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
}

const BAND_PRESETS: Record<Band, BandPreset> = {
  high_blockers: {
    label: 'High blockers',
    tagline: 'Significant gaps to close before applying.',
    accent: '#B53A2B',
    badgeBg: 'rgba(181,58,43,0.10)',
    badgeText: '#8A2A1F',
  },
  needs_prep: {
    label: 'Needs prep',
    tagline: 'Real potential, with clear gaps to address.',
    accent: '#C9A84C',
    badgeBg: 'rgba(201,168,76,0.18)',
    badgeText: '#7A6428',
  },
  strong_potential: {
    label: 'Strong potential',
    tagline: "You're application-ready in most respects.",
    accent: '#1B4D3E',
    badgeBg: 'rgba(27,77,62,0.10)',
    badgeText: '#1B4D3E',
  },
};

// Band-aware upsell copy. Each variant acknowledges the result honestly, then
// positions R495 as the specific answer to THAT situation rather than a one-
// size pitch. Keep the closing "not just another auto-generated summary"
// phrase across all three for consistency with the differentiator we've used
// elsewhere.
const BAND_UPSELL: Record<Band, { heading: string; intro: string }> = {
  strong_potential: {
    heading: "You've got a real shot. Want to move faster?",
    intro:
      "The headline says you're application-ready, but ready doesn't mean automatic. The R495 upgrade saves you time. We talk through your situation on a 15-minute call, then write a personalised action plan: which country to target first, which documents to apostille this week, which recruiters to actually contact. Tailored to you, not just another auto-generated summary.",
  },
  needs_prep: {
    heading: "Don't spend money in the wrong order.",
    intro:
      "Your score shows real potential, but one or two gaps could block your application if you deal with them too late. For R495, we review your situation on a 15-minute call and then write a personalised action plan showing what to fix first, which route looks most realistic, and what not to waste money on.",
  },
  high_blockers: {
    heading: 'Not the result you wanted? Not the end of the road either.',
    intro:
      "The blockers above are real, but they're rarely permanent. The R495 upgrade gives you a clear next move. We talk through your situation on a 15-minute call, then write a personalised action plan: whether to close those gaps now or pivot to a different route, what NOT to spend money on, what's realistic in the next 12 months. Honest and specific to you, not just another auto-generated summary.",
  },
};

function dimBarColour(score: number): string {
  if (score < 40) return '#B53A2B';
  if (score < 70) return '#C9A84C';
  return '#1B4D3E';
}

export default function ScoreResult({
  categoryLabel,
  overall,
  band,
  dimensions,
  whatsWorking,
  whatsBlocking,
  isPaid,
  emailedCopy,
}: Props) {
  const preset = BAND_PRESETS[band];
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleUpgrade() {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const r = await fetch('/api/payments/checkout', { method: 'POST' });
      const j = (await r.json()) as { checkoutUrl?: string; error?: string };
      if (!r.ok || !j.checkoutUrl) {
        setCheckoutError(j.error ?? 'checkout_failed');
        setCheckingOut(false);
        return;
      }
      window.location.href = j.checkoutUrl;
    } catch {
      setCheckoutError('network_error');
      setCheckingOut(false);
    }
  }

  // The wrapping <main> + SiteNav + SiteFooter come from the page server
  // component so server-only chrome (auth-aware nav) stays out of this
  // client component. Render as a plain section here.
  return (
    <section style={{ backgroundColor: '#F8F5F0' }}>
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16 flex flex-col gap-8">
        {/* Kicker + page title */}
        <div className="flex flex-col gap-2">
          <p
            className="font-display uppercase tracking-[0.2em] text-xs"
            style={{ color: '#C9A84C' }}
          >
            {categoryLabel} eligibility
          </p>
          <h1
            className="font-display font-bold uppercase tracking-wide text-3xl sm:text-4xl"
            style={{ color: '#2C2C2C' }}
          >
            Your score
          </h1>
        </div>

        {/* Numeric score + band — the anchor. Big number, orange accent like
            the PDF cover so on-screen and on-PDF read as one product. */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5 border-l-4"
          style={{ backgroundColor: '#FFFFFF', borderLeftColor: preset.accent }}
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span
              className="font-display font-bold"
              style={{ color: '#ff751f', fontSize: '4rem', lineHeight: 1 }}
            >
              {overall}
            </span>
            <span
              className="font-display font-bold"
              style={{ color: '#2C2C2C', fontSize: '1.75rem', lineHeight: 1 }}
            >
              / 100
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full font-display uppercase tracking-wider text-xs font-bold"
              style={{ backgroundColor: preset.badgeBg, color: preset.badgeText }}
            >
              {preset.label}
            </span>
          </div>
          <p className="font-body text-base sm:text-lg" style={{ color: '#2C2C2C' }}>
            {preset.tagline}
          </p>

          {/* Dimension breakdown bars — same layout the PDF uses, so users see
              WHERE they're strong vs weak (not just the overall band). */}
          <div className="flex flex-col gap-3 pt-2">
            <p
              className="font-display uppercase tracking-wider text-xs font-bold"
              style={{ color: '#6B6B6B' }}
            >
              Your score breakdown
            </p>
            {dimensions.map((d) => (
              <div key={d.key} className="flex flex-col gap-1">
                <div className="flex justify-between gap-3">
                  <span
                    className="font-body text-sm font-semibold"
                    style={{ color: '#2C2C2C' }}
                  >
                    {d.label}
                  </span>
                  <span className="font-body text-xs" style={{ color: '#6B6B6B' }}>
                    {d.score} / 100 · weight {Math.round(d.weight * 100)}%
                  </span>
                </div>
                <div
                  className="rounded-full"
                  style={{ height: 6, backgroundColor: '#EDE8E0' }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: `${d.score}%`,
                      height: 6,
                      backgroundColor: dimBarColour(d.score),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's working + Biggest blocker — full paragraphs, same LLM
            output the PDF uses. The page now earns trust BEFORE pitching. */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex flex-col gap-2">
            <p
              className="font-display uppercase tracking-wider text-xs font-bold"
              style={{ color: '#1B4D3E' }}
            >
              What&apos;s working
            </p>
            <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: '#2C2C2C' }}>
              {whatsWorking}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p
              className="font-display uppercase tracking-wider text-xs font-bold"
              style={{ color: '#B53A2B' }}
            >
              Biggest blocker
            </p>
            <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: '#2C2C2C' }}>
              {whatsBlocking}
            </p>
          </div>

          {emailedCopy && (
            <p
              className="font-body text-xs italic mt-1"
              style={{ color: '#6B6B6B' }}
            >
              We&apos;ve emailed you a copy of this summary so you have it for reference.
            </p>
          )}
        </div>

        {/* Premium upsell — deliberately AFTER the substantive content so the
            page doesn't read as a paywall ambush. */}
        {isPaid ? (
          <div
            className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
            style={{ backgroundColor: '#EDE8E0' }}
          >
            <h2
              className="font-display font-bold uppercase tracking-wide text-lg"
              style={{ color: '#2C2C2C' }}
            >
              Your full report is ready
            </h2>
            <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
              Book your 15-minute review call from the dashboard. Your personalised
              PDF report lands in your inbox right after we speak.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex self-start items-center justify-center px-6 py-3 rounded-xl font-display font-bold uppercase tracking-wide text-sm"
              style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
            >
              Open dashboard →
            </Link>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
            style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
          >
            <h2 className="font-display font-bold uppercase tracking-wide text-lg">
              {BAND_UPSELL[band].heading}
            </h2>
            <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(248,245,240,0.85)' }}>
              {BAND_UPSELL[band].intro}
            </p>

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
                <p
                  className="font-body text-xs"
                  style={{ color: 'rgba(248,245,240,0.75)' }}
                >
                  We use the call to understand your specific situation, then
                  write your personalised report right after.
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
                Couldn&apos;t start checkout: {checkoutError}. Please try again.
              </p>
            )}
            <p className="font-body text-xs" style={{ color: 'rgba(248,245,240,0.65)' }}>
              One-off payment. No subscription.
            </p>
          </div>
        )}

        <Link
          href="/dashboard"
          className="font-body text-sm underline self-start"
          style={{ color: '#1B4D3E' }}
        >
          ← Back to dashboard
        </Link>
      </div>
    </section>
  );
}
