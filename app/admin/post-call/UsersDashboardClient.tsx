'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface MemberRow {
  userId: string;
  name: string;
  email: string;
  categoryId: string;
  categoryLabel: string;
  registeredAt: string | null;
  assessmentSubmitted: boolean;
  reportStatus: 'pending' | 'completed' | 'failed' | null;
  reportGeneratedAt: string | null;
  reportAttempts: number;
  hasPdf: boolean;
  chatTurns: number;
  lastChatAt: string | null;
  lastTopic: string | null;
}

interface Props {
  rows: MemberRow[];
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

export default function UsersDashboardClient({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p
        className="font-body text-sm rounded-2xl p-8 text-center"
        style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', color: '#6B6B6B' }}
      >
        No registered members yet.
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

type SummaryState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; summary: string | null; empty: boolean }
  | { kind: 'err'; reason: string };

type RegenStatus =
  | { kind: 'idle' }
  | { kind: 'regenerating' }
  | { kind: 'queued'; attempts: number }
  | { kind: 'err'; reason: string };

function UserCard({ row }: { row: MemberRow }) {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryState>({ kind: 'idle' });
  const [regenStatus, setRegenStatus] = useState<RegenStatus>({ kind: 'idle' });

  const hasChatted = row.chatTurns > 0;
  const hasReport = Boolean(row.reportGeneratedAt);

  async function onSummarise() {
    setSummary({ kind: 'loading' });
    try {
      const r = await fetch('/api/admin/users/chat-summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: row.userId }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        summary?: string | null;
        empty?: boolean;
        error?: string;
      };
      if (!r.ok) {
        setSummary({ kind: 'err', reason: j.error ?? `http_${r.status}` });
        return;
      }
      setSummary({ kind: 'done', summary: j.summary ?? null, empty: Boolean(j.empty) });
    } catch {
      setSummary({ kind: 'err', reason: 'network_error' });
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
      setRegenStatus({ kind: 'queued', attempts: j.attempts ?? row.reportAttempts + 1 });
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
            {row.name || '(no name)'}{' '}
            <span style={{ color: '#6B6B6B' }}>· {row.categoryLabel}</span>
          </h2>
          <p className="font-body text-xs" style={{ color: '#6B6B6B' }}>
            {row.email || '(no email)'}
          </p>
          <p className="font-body text-xs" style={{ color: '#6B6B6B' }}>
            <strong style={{ color: '#2C2C2C' }}>Registered:</strong>{' '}
            {formatDateTime(row.registeredAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 font-body text-xs" style={{ color: '#6B6B6B' }}>
          <Tag
            tone={row.assessmentSubmitted ? 'green' : 'grey'}
            label={row.assessmentSubmitted ? 'Check complete' : 'No check yet'}
          />
          <ReportPill status={row.reportStatus} attempts={row.reportAttempts} />
          <Tag
            tone={hasChatted ? 'orange' : 'grey'}
            label={hasChatted ? `${row.chatTurns} chat${row.chatTurns === 1 ? '' : 's'}` : 'No chats'}
          />
        </div>
      </header>

      <div className="flex flex-col gap-1 font-body text-xs" style={{ color: '#6B6B6B' }}>
        {hasReport && (
          <span>
            <strong style={{ color: '#2C2C2C' }}>Report:</strong>{' '}
            {formatDateTime(row.reportGeneratedAt)}
          </span>
        )}
        {hasChatted && (
          <span>
            <strong style={{ color: '#2C2C2C' }}>Last chat:</strong>{' '}
            {formatDateTime(row.lastChatAt)}
            {row.lastTopic ? ` · ${row.lastTopic}` : ''}
          </span>
        )}
      </div>

      {/* Chat summary — generated on demand so the page load stays fast. */}
      {summary.kind === 'done' && (
        <p
          className="font-body text-sm rounded-xl p-3"
          style={{ backgroundColor: '#F8F5F0', border: '1px solid #EDE8E0', color: '#2C2C2C' }}
        >
          {summary.empty
            ? 'No chat messages to summarise.'
            : summary.summary ?? 'Summary unavailable (model returned nothing).'}
        </p>
      )}
      {summary.kind === 'err' && (
        <p className="font-body text-xs" style={{ color: '#B53A2B' }}>
          Summary failed: {summary.reason}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {hasChatted && (
          <button
            type="button"
            onClick={onSummarise}
            disabled={summary.kind === 'loading'}
            className="font-display font-bold uppercase tracking-wide text-xs px-5 py-2.5 rounded-xl disabled:opacity-50"
            style={{
              backgroundColor: '#1B4D3E',
              color: '#F8F5F0',
              cursor: summary.kind === 'loading' ? 'wait' : 'pointer',
            }}
          >
            {summary.kind === 'loading' ? 'Summarising…' : 'Summarise chats'}
          </button>
        )}
        {hasReport && (
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
        )}
        {regenStatus.kind === 'queued' && (
          <span className="font-body text-xs" style={{ color: '#1B4D3E' }}>
            ✓ Regeneration queued (attempt {regenStatus.attempts})
          </span>
        )}
        {regenStatus.kind === 'err' && (
          <span className="font-body text-xs" style={{ color: '#B53A2B' }}>
            Regen failed: {regenStatus.reason}
          </span>
        )}
      </div>
    </article>
  );
}

function Tag({ tone, label }: { tone: 'green' | 'orange' | 'grey'; label: string }) {
  const tones: Record<typeof tone, { bg: string; fg: string }> = {
    green: { bg: '#DCEFE6', fg: '#1B4D3E' },
    orange: { bg: '#FFE9D6', fg: '#B5531F' },
    grey: { bg: '#EDE8E0', fg: '#6B6B6B' },
  };
  const t = tones[tone];
  return (
    <span
      className="font-display font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {label}
    </span>
  );
}

function ReportPill({
  status,
  attempts,
}: {
  status: 'pending' | 'completed' | 'failed' | null;
  attempts: number;
}) {
  if (!status) {
    return <Tag tone="grey" label="No report" />;
  }
  const tones: Record<typeof status & string, { bg: string; fg: string; label: string }> = {
    pending: { bg: '#FFF3D6', fg: '#8A6A1F', label: 'Generating…' },
    completed: { bg: '#DCEFE6', fg: '#1B4D3E', label: 'Report ready' },
    failed: { bg: '#F8D7D1', fg: '#B53A2B', label: 'Report failed' },
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
