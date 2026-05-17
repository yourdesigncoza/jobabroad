'use client';

import Link from 'next/link';
import type { Band, DimensionResult } from '@/lib/scoring/types';
import PremiumUpsell from './PremiumUpsell';

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

  // The wrapping <main> + SiteNav + SiteFooter come from the page server
  // component so server-only chrome (auth-aware nav) stays out of this
  // client component. Render as a plain section here.
  return (
    <section style={{ backgroundColor: '#F8F5F0' }}>
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16 flex flex-col gap-8">
        {/* Kicker + page title — matches the orange-dash pattern used across
            the site (dashboard, login, register, recruiters, scam-warnings). */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              {categoryLabel} eligibility
            </span>
          </div>
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
          <PremiumUpsell band={band} withAnchor />
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
