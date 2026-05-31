'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface PaidUserRow {
  userId: string;
  name: string;
  email: string;
  categoryId: string;
  categoryLabel: string;
  reportGeneratedAt: string | null;
  callNotes: string;
  generationStatus: 'pending' | 'completed' | 'failed' | null;
  generationAttempts: number;
  hasPdf: boolean;
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
        No completed eligibility checks yet. Members appear here once they submit
        their assessment and their report generates.
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

type SaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; emailed: boolean; at: string }
  | { kind: 'err'; reason: string };

type RegenStatus =
  | { kind: 'idle' }
  | { kind: 'regenerating' }
  | { kind: 'queued'; attempts: number }
  | { kind: 'err'; reason: string };

function UserCard({ row }: { row: PaidUserRow }) {
  const router = useRouter();
  const [notes, setNotes] = useState(row.callNotes);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [regenStatus, setRegenStatus] = useState<RegenStatus>({ kind: 'idle' });

  const hasReport = Boolean(row.reportGeneratedAt);

  async function onSaveNotes() {
    if (!notes.trim()) return;
    setSaveStatus({ kind: 'saving' });
    try {
      const r = await fetch('/api/admin/post-call/save-notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: row.userId, callNotes: notes }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        emailed?: boolean;
        error?: string;
        reason?: string;
      };
      if (!r.ok || !j.ok) {
        setSaveStatus({ kind: 'err', reason: j.error ?? j.reason ?? `http_${r.status}` });
        return;
      }
      setSaveStatus({
        kind: 'saved',
        emailed: Boolean(j.emailed),
        at: new Date().toISOString(),
      });
      router.refresh();
    } catch {
      setSaveStatus({ kind: 'err', reason: 'network_error' });
    }
  }

  async function onForceRegen() {
    const ok = window.confirm(
      `Force regenerate ${row.name || row.email}'s report?\n\nThis bumps the attempt counter and re-runs GPT + RAG + PDF rendering. Use when generation has failed past the user-facing 5-attempt cap, or after a template change.`,
    );
    if (!ok) return;
    setRegenStatus({ kind: 'regenerating' });
    try {
      const r = await fetch('/api/admin/post-call/regenerate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: row.userId }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        attempts?: number;
        error?: string;
      };
      if (!r.ok || !j.ok) {
        setRegenStatus({ kind: 'err', reason: j.error ?? `http_${r.status}` });
        return;
      }
      setRegenStatus({ kind: 'queued', attempts: j.attempts ?? row.generationAttempts + 1 });
      // Give the background job a head start before refreshing the list.
      setTimeout(() => router.refresh(), 1500);
    } catch {
      setRegenStatus({ kind: 'err', reason: 'network_error' });
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
            <strong style={{ color: '#2C2C2C' }}>Report:</strong>{' '}
            {hasReport ? formatDateTime(row.reportGeneratedAt) : 'not generated'}
          </span>
          <StatusPill status={row.generationStatus} attempts={row.generationAttempts} />
        </div>
      </header>

      <label className="flex flex-col gap-2">
        <span
          className="font-display text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#2C2C2C' }}
        >
          Notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={saveStatus.kind === 'saving'}
          rows={6}
          placeholder="Write up your notes for this member. Saving emails this to them and stores it on their dashboard."
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSaveNotes}
            disabled={saveStatus.kind === 'saving' || !notes.trim()}
            className="font-display font-bold uppercase tracking-wide text-xs px-5 py-2.5 rounded-xl disabled:opacity-50"
            style={{
              backgroundColor: saveStatus.kind === 'saving' ? '#6B6B6B' : '#1B4D3E',
              color: '#F8F5F0',
              cursor: saveStatus.kind === 'saving' ? 'wait' : 'pointer',
            }}
          >
            {saveStatus.kind === 'saving' ? 'Saving…' : 'Save notes & email'}
          </button>
          <button
            type="button"
            onClick={onForceRegen}
            disabled={regenStatus.kind === 'regenerating'}
            className="font-display font-bold uppercase tracking-wide text-xs px-5 py-2.5 rounded-xl"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #C9A84C',
              color: '#8A6A1F',
              cursor: regenStatus.kind === 'regenerating' ? 'wait' : 'pointer',
            }}
          >
            {regenStatus.kind === 'regenerating' ? 'Queuing…' : 'Force regenerate'}
          </button>
        </div>

        <div className="flex flex-col items-end gap-1 font-body text-xs">
          {saveStatus.kind === 'saved' && (
            <span style={{ color: '#1B4D3E' }}>
              ✓ Saved {formatDateTime(saveStatus.at)}
              {saveStatus.emailed ? ' · email sent' : ' · email failed (notes saved)'}
            </span>
          )}
          {saveStatus.kind === 'err' && (
            <span style={{ color: '#B53A2B' }}>Save failed: {saveStatus.reason}</span>
          )}
          {regenStatus.kind === 'queued' && (
            <span style={{ color: '#1B4D3E' }}>
              ✓ Regeneration queued (attempt {regenStatus.attempts})
            </span>
          )}
          {regenStatus.kind === 'err' && (
            <span style={{ color: '#B53A2B' }}>Regen failed: {regenStatus.reason}</span>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusPill({
  status,
  attempts,
}: {
  status: 'pending' | 'completed' | 'failed' | null;
  attempts: number;
}) {
  if (!status) {
    return (
      <span className="font-body text-[10px] uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
        no row yet
      </span>
    );
  }
  const tones: Record<typeof status & string, { bg: string; fg: string; label: string }> = {
    pending: { bg: '#FFF3D6', fg: '#8A6A1F', label: 'Generating…' },
    completed: { bg: '#DCEFE6', fg: '#1B4D3E', label: 'Completed' },
    failed: { bg: '#F8D7D1', fg: '#B53A2B', label: 'Failed' },
  };
  const t = tones[status];
  return (
    <span
      className="font-display font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {t.label}
      {status !== 'completed' && attempts > 0 ? ` · ${attempts}/5` : ''}
    </span>
  );
}
