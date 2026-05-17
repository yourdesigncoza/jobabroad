'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Band } from '@/lib/scoring/types';

interface Props {
  categoryLabel: string;
  band: Band;
  strength: string;
  blocker: string;
  isPaid: boolean;
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

export default function ScoreResult({ categoryLabel, band, strength, blocker, isPaid }: Props) {
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

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-20 flex flex-col gap-8">
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

        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6 border-l-4"
          style={{ backgroundColor: '#FFFFFF', borderLeftColor: preset.accent }}
        >
          <div className="flex flex-col gap-2">
            <span
              className="inline-flex self-start items-center px-3 py-1 rounded-full font-display uppercase tracking-wider text-xs font-bold"
              style={{ backgroundColor: preset.badgeBg, color: preset.badgeText }}
            >
              {preset.label}
            </span>
            <p className="font-body text-base sm:text-lg" style={{ color: '#2C2C2C' }}>
              {preset.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p
                className="font-display uppercase tracking-wider text-xs font-bold"
                style={{ color: '#1B4D3E' }}
              >
                What&apos;s working
              </p>
              <p className="font-body text-sm sm:text-base" style={{ color: '#2C2C2C' }}>
                {strength}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="font-display uppercase tracking-wider text-xs font-bold"
                style={{ color: '#B53A2B' }}
              >
                Biggest blocker
              </p>
              <p className="font-body text-sm sm:text-base" style={{ color: '#2C2C2C' }}>
                {blocker}
              </p>
            </div>
          </div>
        </div>

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
              Download your detailed assessment, book your 15-minute review call,
              or send a follow-up question from your dashboard.
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
              Get your full report + 15-min call
            </h2>
            <ul
              className="font-body text-sm flex flex-col gap-1.5"
              style={{ color: 'rgba(248,245,240,0.85)' }}
            >
              <li>• Detailed score across every dimension</li>
              <li>• Personalised PDF report with next steps</li>
              <li>• 15-minute review call to talk through your plan</li>
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
    </main>
  );
}
