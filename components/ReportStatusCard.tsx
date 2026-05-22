'use client';

import { useEffect, useState } from 'react';
import type { ReportStatusResponse } from '@/app/api/reports/status/route';

interface Props {
  initial: ReportStatusResponse;
}

// Poll fast at first (the report usually lands within ~1 min), then settle to
// a steady 15s. We keep polling for as long as the tab is open, so the card
// flips to "ready" (or "failed") on its own — the buyer never has to refresh.
// After ~90s we show a softer "taking longer" message but DO NOT stop polling.
const POLL_INTERVALS_MS = [3_000, 5_000, 8_000, 13_000, 15_000];
const SLOW_NOTICE_AFTER_MS = 90_000;

function isPending(status: ReportStatusResponse['status']): boolean {
  return status === 'pending' || status === 'missing';
}

export default function ReportStatusCard({ initial }: Props) {
  const [state, setState] = useState<ReportStatusResponse>(initial);
  const [takingLong, setTakingLong] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Drive polling while the report is still being prepared. setState with an
  // unchanged status does NOT re-run this effect, so the loop self-continues
  // via the recursive `loop()` call; setState with a resolved status (ready /
  // failed) DOES re-run it, the cleanup tears the timer down, and the early
  // return stops polling.
  useEffect(() => {
    if (!isPending(state.status)) return;

    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let elapsed = 0;
    let tick = 0;

    const loop = () => {
      const delay = POLL_INTERVALS_MS[Math.min(tick, POLL_INTERVALS_MS.length - 1)];
      tick += 1;
      timer = setTimeout(async () => {
        elapsed += delay;
        if (elapsed >= SLOW_NOTICE_AFTER_MS && alive) setTakingLong(true);
        try {
          const res = await fetch('/api/reports/status', { cache: 'no-store' });
          if (!alive) return;
          if (res.ok) {
            const next = (await res.json()) as ReportStatusResponse;
            if (!alive) return;
            setState(next);
            if (isPending(next.status)) loop();
          } else {
            loop(); // transient error — retry next tick
          }
        } catch {
          if (alive) loop(); // transient network error — retry next tick
        }
      }, delay);
    };

    loop();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [state.status]);

  async function onRetry() {
    setRetrying(true);
    try {
      const res = await fetch('/api/reports/regenerate', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('[ReportStatusCard] regenerate failed', body);
        setRetrying(false);
        return;
      }
      // Back into pending mode — the effect restarts polling with a fresh
      // elapsed/tick counter, so the "taking longer" notice resets too.
      setTakingLong(false);
      setState((prev) => ({ ...prev, status: 'pending', error: null }));
    } catch (err) {
      console.error('[ReportStatusCard] regenerate threw', err);
    } finally {
      setRetrying(false);
    }
  }

  if (state.status === 'completed' && state.pdfUrl) {
    return (
      <CardShell tone="ready">
        <Kicker tone="ready">Your report</Kicker>
        <Title>Personalised report ready</Title>
        <Body>Your full personalised assessment, ready to download.</Body>
        <a
          href={state.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-display font-bold uppercase tracking-wide text-sm self-start mt-2"
          style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
        >
          Download report (PDF) &rarr;
        </a>
      </CardShell>
    );
  }

  if (state.status === 'failed' && state.canRetry) {
    return (
      <CardShell tone="error">
        <Kicker tone="error">Your report</Kicker>
        <Title>Something went wrong</Title>
        <Body>
          Generation didn&apos;t complete. {state.error ? `(${state.error.slice(0, 120)})` : null} Try
          again — most issues clear on a second attempt.
        </Body>
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-display font-bold uppercase tracking-wide text-sm self-start mt-2"
          style={{
            backgroundColor: retrying ? '#6B6B6B' : '#1B4D3E',
            color: '#F8F5F0',
            cursor: retrying ? 'wait' : 'pointer',
          }}
        >
          {retrying ? 'Trying again…' : 'Try again'}
        </button>
      </CardShell>
    );
  }

  if (state.status === 'failed') {
    return (
      <CardShell tone="error">
        <Kicker tone="error">Your report</Kicker>
        <Title>We need to fix this manually</Title>
        <Body>
          Generation failed multiple times. We&apos;ve been notified and will
          email you as soon as your report is ready.
        </Body>
      </CardShell>
    );
  }

  // pending or missing
  return (
    <CardShell tone="pending">
      <Kicker tone="pending">Your report</Kicker>
      <Title>Preparing your personalised report</Title>
      <Body aria-live="polite">
        {takingLong
          ? 'This is taking a little longer than usual — hang tight. This page updates automatically when your report is ready, and we’ll email you a copy too.'
          : 'Usually ready within a minute. We’ll email you a copy too.'}
      </Body>
      <div
        className="mt-3 inline-block w-4 h-4 rounded-full"
        style={{
          border: '2px solid #1B4D3E',
          borderTopColor: 'transparent',
          animation: 'reportSpin 0.9s linear infinite',
        }}
        aria-hidden
      />
      <style>{`@keyframes reportSpin { to { transform: rotate(360deg); } }`}</style>
    </CardShell>
  );
}

function CardShell({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'ready' | 'pending' | 'error';
}) {
  const border =
    tone === 'ready' ? '1.5px solid #1B4D3E' : tone === 'error' ? '1.5px solid #B53A2B' : '1.5px dashed #C9A84C';
  return (
    <section
      className="rounded-2xl p-6 flex flex-col gap-2"
      style={{ backgroundColor: '#FFFFFF', border }}
    >
      {children}
    </section>
  );
}

function Kicker({ children, tone }: { children: React.ReactNode; tone: 'ready' | 'pending' | 'error' }) {
  const colour = tone === 'error' ? '#B53A2B' : '#1B4D3E';
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-px" style={{ backgroundColor: colour }} />
      <span
        className="font-display text-xs font-semibold uppercase tracking-wider"
        style={{ color: colour }}
      >
        {children}
      </span>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-bold uppercase text-xl" style={{ color: '#2C2C2C' }}>
      {children}
    </h2>
  );
}

function Body({ children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className="font-body text-sm" style={{ color: '#6B6B6B' }} {...rest}>
      {children}
    </p>
  );
}
