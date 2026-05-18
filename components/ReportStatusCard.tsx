'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReportStatusResponse } from '@/app/api/reports/status/route';

interface Props {
  initial: ReportStatusResponse;
}

// Backoff schedule: 3s, 5s, 8s, 13s, then capped at 15s. Total elapsed cap is
// ~90s before we stop polling and tell the user to come back later. The buyer
// receives an email when the PDF lands regardless of whether they keep this
// page open, so giving up here is safe.
const POLL_INTERVALS_MS = [3_000, 5_000, 8_000, 13_000, 15_000];
const MAX_ELAPSED_MS = 90_000;

export default function ReportStatusCard({ initial }: Props) {
  const [state, setState] = useState<ReportStatusResponse>(initial);
  const [exhausted, setExhausted] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const elapsedRef = useRef(0);
  const pollIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(true);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/reports/status', { cache: 'no-store' });
      if (!res.ok) return;
      const next = (await res.json()) as ReportStatusResponse;
      if (!aliveRef.current) return;
      setState(next);
    } catch {
      // Transient — let the next tick retry.
    }
  }, []);

  const scheduleNextPoll = useCallback(() => {
    clearTimer();
    if (!aliveRef.current) return;
    if (elapsedRef.current >= MAX_ELAPSED_MS) {
      setExhausted(true);
      return;
    }
    const idx = Math.min(pollIndexRef.current, POLL_INTERVALS_MS.length - 1);
    const delay = POLL_INTERVALS_MS[idx];
    pollIndexRef.current += 1;
    timeoutRef.current = setTimeout(async () => {
      elapsedRef.current += delay;
      await fetchStatus();
    }, delay);
  }, [clearTimer, fetchStatus]);

  // Drive polling: schedule next tick whenever we observe a pending/missing state.
  useEffect(() => {
    aliveRef.current = true;
    if (state.status === 'pending' || state.status === 'missing') {
      scheduleNextPoll();
    } else {
      clearTimer();
    }
    return () => {
      aliveRef.current = false;
      clearTimer();
    };
  }, [state.status, scheduleNextPoll, clearTimer]);

  const onRetry = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await fetch('/api/reports/regenerate', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('[ReportStatusCard] regenerate failed', body);
        setRetrying(false);
        return;
      }
      // Reset polling state and put us back into pending mode.
      elapsedRef.current = 0;
      pollIndexRef.current = 0;
      setExhausted(false);
      setState((prev) => ({ ...prev, status: 'pending', error: null }));
    } catch (err) {
      console.error('[ReportStatusCard] regenerate threw', err);
    } finally {
      setRetrying(false);
    }
  }, []);

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
        {exhausted
          ? 'Still working — we’ll email you when it’s ready. You can close this page.'
          : 'Usually ready within a minute. We’ll email you a copy too.'}
      </Body>
      {!exhausted && (
        <div
          className="mt-3 inline-block w-4 h-4 rounded-full"
          style={{
            border: '2px solid #1B4D3E',
            borderTopColor: 'transparent',
            animation: 'reportSpin 0.9s linear infinite',
          }}
          aria-hidden
        />
      )}
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
