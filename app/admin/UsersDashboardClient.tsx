'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface MemberRow {
  userId: string;
  name: string;
  email: string;
  phone: string;
  categoryId: string;
  categoryLabel: string;
  registeredAt: string | null;
  assessmentSubmitted: boolean;
  /** Free-text "Tell us about yourself" answer; '' when left blank. */
  aboutSummary: string;
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

const PAGE_SIZE = 20;
// Primary-row columns (Member · Registered · Check · About you · Report · Chat).
// The wide Summary/activity + the action buttons live on a second row that
// spans all of these, so nothing clips off the right edge.
const COLS = 6;

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

type Notice = { kind: 'ok' | 'err'; text: string };

export default function UsersDashboardClient({ rows }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [deleting, setDeleting] = useState<MemberRow | null>(null);

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

  const pageCount = Math.ceil(rows.length / PAGE_SIZE);
  const clampedPage = Math.min(page, pageCount - 1);
  const start = clampedPage * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {notice && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 font-body text-sm"
          style={{
            backgroundColor: notice.kind === 'ok' ? '#DCEFE6' : '#F8D7D1',
            color: notice.kind === 'ok' ? '#1B4D3E' : '#B53A2B',
          }}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="font-display font-bold uppercase tracking-wide text-[0.65rem]"
            style={{ cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1.5px solid #EDE8E0' }}>
        <table
          className="w-full border-collapse font-body text-sm"
          style={{ backgroundColor: '#FFFFFF', minWidth: 720 }}
        >
          <thead>
            <tr style={{ backgroundColor: '#F8F5F0' }}>
              <Th>Member</Th>
              <Th>Registered</Th>
              <Th>Check</Th>
              <Th>About you</Th>
              <Th>Report</Th>
              <Th>Chat</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <UserRow
                key={row.userId}
                row={row}
                onEdit={() => setEditing(row)}
                onDelete={() => setDeleting(row)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between font-body text-sm" style={{ color: '#6B6B6B' }}>
          <span>
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}
          </span>
          <div className="flex items-center gap-2">
            <PagerButton disabled={clampedPage === 0} onClick={() => setPage(clampedPage - 1)}>
              ← Prev
            </PagerButton>
            <span className="font-display text-xs font-semibold" style={{ color: '#2C2C2C' }}>
              Page {clampedPage + 1} / {pageCount}
            </span>
            <PagerButton disabled={clampedPage >= pageCount - 1} onClick={() => setPage(clampedPage + 1)}>
              Next →
            </PagerButton>
          </div>
        </div>
      )}

      {editing && (
        <EditMemberModal
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            setNotice({ kind: 'ok', text });
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <DeleteMemberModal
          row={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(text) => {
            setDeleting(null);
            setNotice({ kind: 'ok', text });
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-display font-bold uppercase tracking-wide text-[0.65rem] px-3 py-1.5 rounded-lg disabled:opacity-40"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #1B4D3E',
        color: '#1B4D3E',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
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

function UserRow({
  row,
  onEdit,
  onDelete,
}: {
  row: MemberRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
      {/* Row A — identity + status columns */}
      <tr style={{ borderTop: '1px solid #EDE8E0' }}>
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
        <td className={CELL} style={{ color: '#2C2C2C', whiteSpace: 'nowrap' }}>
          {formatDateTime(row.registeredAt)}
        </td>
        <td className={CELL}>
          <Tag
            tone={row.assessmentSubmitted ? 'green' : 'grey'}
            label={row.assessmentSubmitted ? 'Complete' : 'No check'}
          />
        </td>
        <td className={CELL}>
          <AboutCell text={row.aboutSummary} />
        </td>
        <td className={CELL}>
          <ReportPill status={row.reportStatus} attempts={row.reportAttempts} />
        </td>
        <td className={CELL}>
          <Tag
            tone={hasChatted ? 'orange' : 'grey'}
            label={hasChatted ? `${row.chatTurns} chat${row.chatTurns === 1 ? '' : 's'}` : 'None'}
          />
        </td>
      </tr>

      {/* Row B — wide summary/activity + actions, spanning the full width so
          nothing clips. */}
      <tr>
        <td colSpan={COLS} className="px-4 pb-4 pt-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="text-sm" style={{ color: '#6B6B6B', minWidth: 0 }}>
              {summary.kind === 'done' ? (
                <span style={{ color: '#2C2C2C' }}>
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
                  No chatbot activity yet
                </span>
              )}
              {regenStatus.kind === 'queued' && (
                <span className="block font-body text-xs mt-1" style={{ color: '#1B4D3E' }}>
                  ✓ Regeneration queued (attempt {regenStatus.attempts})
                </span>
              )}
              {regenStatus.kind === 'err' && (
                <span className="block font-body text-xs mt-1" style={{ color: '#B53A2B' }}>
                  Regen failed: {regenStatus.reason}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end md:flex-shrink-0">
              <ActionButton tone="outline-green" onClick={onEdit}>
                Edit
              </ActionButton>
              <ActionButton tone="outline-red" onClick={onDelete}>
                Delete
              </ActionButton>
              {hasChatted && (
                <ActionButton tone="green" onClick={onSummarise} disabled={summary.kind === 'loading'}>
                  {summary.kind === 'loading' ? 'Summarising…' : 'Summarise chats'}
                </ActionButton>
              )}
              {hasReport && (
                <ActionButton tone="outline-gold" onClick={onForceRegen} disabled={regenStatus.kind === 'regenerating'}>
                  {regenStatus.kind === 'regenerating' ? 'Queuing…' : 'Force regenerate'}
                </ActionButton>
              )}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

type ButtonTone = 'green' | 'outline-green' | 'outline-gold' | 'outline-red';

function ActionButton({
  children,
  tone,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  tone: ButtonTone;
  onClick: () => void;
  disabled?: boolean;
}) {
  const tones: Record<ButtonTone, { bg: string; border: string; fg: string }> = {
    green: { bg: '#1B4D3E', border: '#1B4D3E', fg: '#F8F5F0' },
    'outline-green': { bg: '#FFFFFF', border: '#1B4D3E', fg: '#1B4D3E' },
    'outline-gold': { bg: '#FFFFFF', border: '#C9A84C', fg: '#8A6A1F' },
    'outline-red': { bg: '#FFFFFF', border: '#B53A2B', fg: '#B53A2B' },
  };
  const t = tones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-display font-bold uppercase tracking-wide text-[0.65rem] px-3 py-1.5 rounded-lg disabled:opacity-50 whitespace-nowrap"
      style={{
        backgroundColor: t.bg,
        border: `1.5px solid ${t.border}`,
        color: t.fg,
        cursor: disabled ? 'wait' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// =========================================================================
// Edit modal
// =========================================================================

function EditMemberModal({
  row,
  onClose,
  onSaved,
}: {
  row: MemberRow;
  onClose: () => void;
  onSaved: (text: string) => void;
}) {
  const [name, setName] = useState(row.name);
  const [email, setEmail] = useState(row.email);
  const [phone, setPhone] = useState(row.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setError(null);
    // Only send changed fields.
    const patch: Record<string, string> = { userId: row.userId };
    if (name.trim() !== row.name) patch.name = name.trim();
    if (email.trim() !== row.email) patch.email = email.trim();
    if (phone.trim() !== row.phone) patch.phone = phone.trim();
    if (Object.keys(patch).length === 1) {
      setError('Nothing changed.');
      setSaving(false);
      return;
    }
    try {
      const r = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setError(
          j.error === 'email_taken'
            ? 'That email is already in use.'
            : j.error === 'invalid_body'
              ? 'Check the email and phone format.'
              : `Update failed (${j.error ?? r.status}).`,
        );
        setSaving(false);
        return;
      }
      onSaved(`Updated ${name.trim() || row.email}.`);
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Edit member" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Phone" value={phone} onChange={setPhone} hint="SA number — e.g. 061 711 4715" />
        {error && (
          <p className="font-body text-xs" style={{ color: '#B53A2B' }}>
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <ActionButton tone="outline-green" onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton tone="green" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </ActionButton>
        </div>
      </div>
    </ModalShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: '#1B4D3E' }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-body text-sm px-3 py-2 rounded-lg"
        style={{ border: '1.5px solid #EDE8E0', color: '#2C2C2C', backgroundColor: '#FFFFFF' }}
      />
      {hint && (
        <span className="font-body text-[0.7rem]" style={{ color: '#9A958C' }}>
          {hint}
        </span>
      )}
    </label>
  );
}

// =========================================================================
// Delete confirm modal
// =========================================================================

function DeleteMemberModal({
  row,
  onClose,
  onDeleted,
}: {
  row: MemberRow;
  onClose: () => void;
  onDeleted: (text: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setDeleting(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: row.userId }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setError(
          j.error === 'cannot_delete_self'
            ? "You can't delete your own admin account."
            : `Delete failed (${j.error ?? r.status}).`,
        );
        setDeleting(false);
        return;
      }
      onDeleted(`Deleted ${row.name || row.email}.`);
    } catch {
      setError('Network error. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <ModalShell title="Delete member" onClose={onClose}>
      <p className="font-body text-sm" style={{ color: '#2C2C2C' }}>
        Permanently delete{' '}
        <strong>{row.name || '(no name)'}</strong> ({row.email || 'no email'})?
      </p>
      <p className="font-body text-xs mt-2" style={{ color: '#6B6B6B' }}>
        This removes their account, assessment, score, report, and chat history. It cannot be undone.
      </p>
      {error && (
        <p className="font-body text-xs mt-2" style={{ color: '#B53A2B' }}>
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 mt-4">
        <ActionButton tone="outline-green" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton tone="outline-red" onClick={onConfirm} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete permanently'}
        </ActionButton>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44, 44, 44, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="font-display font-bold uppercase tracking-wide text-lg mb-4"
          style={{ color: '#2C2C2C' }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function AboutCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = text.trim();
  if (!trimmed) {
    return (
      <span className="text-xs" style={{ color: '#9A958C' }}>
        —
      </span>
    );
  }
  const isLong = trimmed.length > 140;
  const shown = expanded || !isLong ? trimmed : `${trimmed.slice(0, 140).trimEnd()}…`;
  return (
    <div className="flex flex-col gap-1" style={{ minWidth: 200, maxWidth: 320 }}>
      <span className="text-xs whitespace-pre-wrap" style={{ color: '#2C2C2C' }}>
        {shown}
      </span>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="self-start font-display font-bold uppercase tracking-wide text-[0.6rem]"
          style={{ color: '#1B4D3E', cursor: 'pointer' }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
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
