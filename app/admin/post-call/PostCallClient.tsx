'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface PaidUserRow {
  userId: string;
  name: string;
  email: string;
  categoryId: string;
  categoryLabel: string;
  bookingSlotAt: string | null;
  bookingConsentedAt: string | null;
  reportGeneratedAt: string | null;
  callNotes: string;
}

interface Props {
  rows: PaidUserRow[];
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PostCallClient({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p
        className="font-body text-sm rounded-2xl p-8 text-center"
        style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', color: '#6B6B6B' }}
      >
        No paid users yet. They&apos;ll appear here after their R495 payment lands.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <UserCard key={row.userId} row={row} />
      ))}
    </div>
  );
}

function UserCard({ row }: { row: PaidUserRow }) {
  const router = useRouter();
  const [notes, setNotes] = useState(row.callNotes);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'ok'; at: string }
    | { kind: 'err'; reason: string }
  >({ kind: 'idle' });

  const hasReport = Boolean(row.reportGeneratedAt);
  const hasBooking = Boolean(row.bookingSlotAt);

  async function onSend() {
    setBusy(true);
    setStatus({ kind: 'idle' });
    try {
      const r = await fetch('/api/admin/post-call/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: row.userId, callNotes: notes }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; generatedAt?: string };
      if (!r.ok) {
        setStatus({ kind: 'err', reason: j.error ?? `http_${r.status}` });
        return;
      }
      setStatus({ kind: 'ok', at: j.generatedAt ?? new Date().toISOString() });
      router.refresh();
    } catch {
      setStatus({ kind: 'err', reason: 'network_error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2
            className="font-display font-bold uppercase tracking-wide text-base"
            style={{ color: '#2C2C2C' }}
          >
            {row.name || '(no name)'} <span style={{ color: '#6B6B6B' }}>· {row.categoryLabel}</span>
          </h2>
          <p className="font-body text-xs" style={{ color: '#6B6B6B' }}>
            {row.email || '(no email)'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 font-body text-xs" style={{ color: '#6B6B6B' }}>
          <span>
            <strong style={{ color: '#2C2C2C' }}>Booking:</strong>{' '}
            {hasBooking ? formatDateTime(row.bookingSlotAt) : 'not booked yet'}
          </span>
          <span>
            <strong style={{ color: '#2C2C2C' }}>Report:</strong>{' '}
            {hasReport ? formatDateTime(row.reportGeneratedAt) : 'not generated'}
          </span>
        </div>
      </header>

      <label className="flex flex-col gap-2">
        <span
          className="font-display text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#2C2C2C' }}
        >
          Call notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={busy}
          rows={6}
          placeholder="Paste transcript or write up the call. This becomes the &ldquo;From your review call&rdquo; section of their PDF."
          className="font-body text-sm rounded-xl p-3 outline-none"
          style={{
            backgroundColor: '#F8F5F0',
            border: '1.5px solid #EDE8E0',
            color: '#2C2C2C',
            resize: 'vertical',
          }}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSend}
          disabled={busy}
          className="font-display font-bold uppercase tracking-wide text-xs px-5 py-2.5 rounded-xl"
          style={{
            backgroundColor: busy ? '#6B6B6B' : '#1B4D3E',
            color: '#F8F5F0',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Generating…' : hasReport ? 'Regenerate & resend' : 'Generate & send'}
        </button>

        {status.kind === 'ok' && (
          <span className="font-body text-xs" style={{ color: '#1B4D3E' }}>
            ✓ Sent at {formatDateTime(status.at)}
          </span>
        )}
        {status.kind === 'err' && (
          <span className="font-body text-xs" style={{ color: '#B53A2B' }}>
            Failed: {status.reason}
          </span>
        )}
      </div>
    </article>
  );
}
