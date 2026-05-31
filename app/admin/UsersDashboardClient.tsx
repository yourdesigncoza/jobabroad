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

const COLS = 7;

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
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1.5px solid #EDE8E0' }}>
      <table
        className="w-full border-collapse font-body text-sm"
        style={{ backgroundColor: '#FFFFFF', minWidth: 880 }}
      >
        <thead>
          <tr style={{ backgroundColor: '#F8F5F0' }}>
            <Th>Member</Th>
            <Th>Registered</Th>
            <Th>Check</Th>
            <Th>Report</Th>
            <Th>Chat</Th>
            <Th>Summary / activity</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <UserRow key={row.userId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className="font-display text-[0.65rem] font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap"
      style={{ color: '#1B4D3E', textAlign: align }}
    >
      {children}
    </th>
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

const CELL = 'px-4 py-3 align-top';
const ROW_BORDER = { borderTop: '1px solid #EDE8E0' } as const;

function UserRow({ row }: { row: MemberRow }) {
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
      const r = await fetch('/api/admin/users/regenerate', {
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
    <>
      <tr style={ROW_BORDER}>
        {/* Member */}
        <td className={CELL}>
          <div
            className="font-display font-bold uppercase tracking-wide text-sm"
            style={{ color: '#2C2C2C' }}
          >
            {row.name || '(no name)'}
          </div>
          <div className="text-xs" style={{ color: '#6B6B6B' }}>
            {row.categoryLabel || '—'}
          </div>
          <div className="text-xs break-all" style={{ color: '#6B6B6B' }}>
            {row.email || '(no email)'}
          </div>
        </td>

        {/* Registered */}
        <td className={CELL} style={{ color: '#2C2C2C', whiteSpace: 'nowrap' }}>
          {formatDateTime(row.registeredAt)}
        </td>

        {/* Check */}
        <td className={CELL}>
          <Tag
            tone={row.assessmentSubmitted ? 'green' : 'grey'}
            label={row.assessmentSubmitted ? 'Complete' : 'No check'}
          />
        </td>

        {/* Report */}
        <td className={CELL}>
          <ReportPill status={row.reportStatus} attempts={row.reportAttempts} />
        </td>

        {/* Chat */}
        <td className={CELL}>
          <Tag
            tone={hasChatted ? 'orange' : 'grey'}
            label={hasChatted ? `${row.chatTurns} chat${row.chatTurns === 1 ? '' : 's'}` : 'None'}
          />
        </td>

        {/* Summary / activity */}
        <td className={CELL} style={{ minWidth: 220, color: '#6B6B6B' }}>
          {summary.kind === 'done' ? (
            <span className="text-sm" style={{ color: '#2C2C2C' }}>
              {summary.empty
                ? 'No chat messages to summarise.'
                : summary.summary ?? 'Summary unavailable (model returned nothing).'}
            </span>
          ) : summary.kind === 'err' ? (
            <span className="text-xs" style={{ color: '#B53A2B' }}>
              Summary failed: {summary.reason}
            </span>
          ) : hasChatted ? (
            <span className="text-xs">
              Last chat {formatDateTime(row.lastChatAt)}
              {row.lastTopic ? ` · ${row.lastTopic}` : ''}
            </span>
          ) : (
            <span className="text-xs" style={{ color: '#9A958C' }}>
              —
            </span>
          )}
        </td>

        {/* Actions */}
        <td className={CELL} style={{ textAlign: 'right' }}>
          <div className="flex flex-col items-end gap-2">
            {hasChatted && (
              <button
                type="button"
                onClick={onSummarise}
                disabled={summary.kind === 'loading'}
                className="font-display font-bold uppercase tracking-wide text-[0.65rem] px-3 py-1.5 rounded-lg disabled:opacity-50 whitespace-nowrap"
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
                className="font-display font-bold uppercase tracking-wide text-[0.65rem] px-3 py-1.5 rounded-lg whitespace-nowrap"
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
            {!hasChatted && !hasReport && (
              <span className="text-xs" style={{ color: '#9A958C' }}>
                —
              </span>
            )}
          </div>
        </td>
      </tr>

      {/* Regenerate feedback spans the row so it doesn't squeeze the cells. */}
      {(regenStatus.kind === 'queued' || regenStatus.kind === 'err') && (
        <tr>
          <td colSpan={COLS} className="px-4 pb-3 pt-0" style={{ backgroundColor: '#FFFFFF' }}>
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
          </td>
        </tr>
      )}
    </>
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
      className="inline-block font-display font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap"
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
    completed: { bg: '#DCEFE6', fg: '#1B4D3E', label: 'Ready' },
    failed: { bg: '#F8D7D1', fg: '#B53A2B', label: 'Failed' },
  };
  const t = tones[status];
  return (
    <span
      className="inline-block font-display font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {t.label}
      {status !== 'completed' && attempts > 0 ? ` · ${attempts}/5` : ''}
    </span>
  );
}
