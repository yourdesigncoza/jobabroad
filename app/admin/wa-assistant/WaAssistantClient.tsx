'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  DraftApiResponse,
  NewPatternSuggestion,
  RuleViolation,
  Thread,
} from '@/lib/wa-assistant/schema';

type Toast =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const COLORS = {
  bg: '#F8F5F0',
  card: '#FFFFFF',
  border: '#EDE8E0',
  heading: '#2C2C2C',
  muted: '#6B6B6B',
  primary: '#1B4D3E',
  accent: '#C9A84C',
  orange: '#ff751f',
  errorBg: '#FDEDEC',
  errorText: '#B22222',
  warnBg: '#FFF6E0',
  warnText: '#8A6D1A',
  successBg: '#E8F0EC',
  successText: '#1B4D3E',
  infoBg: '#EDE8E0',
  infoText: '#6B6B6B',
} as const;

const PHONE_REGEX = /^\d{10,15}$/;

interface ContactSummary {
  phone: string;
  turns: number;
  lastDate: string;
  status: string | null;
  categoryInterest: string | null;
}

export default function WaAssistantClient() {
  const [phone, setPhone] = useState('');
  const [inboundMessage, setInboundMessage] = useState('');

  const [thread, setThread] = useState<Thread | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);

  const [draftResult, setDraftResult] = useState<DraftApiResponse | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Editable copy of the drafted reply — the admin can tweak wording before
  // copying to WhatsApp. Re-seeded whenever a fresh draft arrives.
  const [editedReply, setEditedReply] = useState('');

  const [contacts, setContacts] = useState<ContactSummary[]>([]);

  const [logLoading, setLogLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Inputs changing invalidates any prior draft. Clear is done inline in each
  // onChange handler below (not in an effect) to avoid cascading renders.
  function clearStaleDraft() {
    if (draftResult || draftError) {
      setDraftResult(null);
      setDraftError(null);
    }
  }

  // Debounced thread auto-load when phone becomes a valid 10-15 digit string.
  // Re-runs whenever phone changes — clears thread when invalid.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!PHONE_REGEX.test(phone)) {
      setThread(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void fetchThread(phone);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  async function fetchThread(p: string) {
    setThreadLoading(true);
    try {
      const r = await fetch(`/api/admin/wa-assistant/thread/${p}`);
      const j = (await r.json().catch(() => null)) as Thread | { error?: string } | null;
      if (!r.ok || !j || 'error' in j) {
        setThread(null);
        return;
      }
      setThread(j as Thread);
    } catch {
      setThread(null);
    } finally {
      setThreadLoading(false);
    }
  }

  // Re-seed the editable reply whenever a fresh draft arrives (or is cleared).
  useEffect(() => {
    setEditedReply(draftResult?.draftReply ?? '');
  }, [draftResult]);

  // Load the recent-contacts list once on mount.
  const fetchContacts = async () => {
    try {
      const r = await fetch('/api/admin/wa-assistant/contacts');
      const j = (await r.json().catch(() => null)) as
        | { contacts?: ContactSummary[] }
        | null;
      if (r.ok && j?.contacts) setContacts(j.contacts);
    } catch {
      // Non-fatal — the dropdown just stays empty.
    }
  };
  useEffect(() => {
    void fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss toasts.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleDraft() {
    setDraftLoading(true);
    setDraftError(null);
    setDraftResult(null);
    try {
      const r = await fetch('/api/admin/wa-assistant/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          inboundMessage: inboundMessage.trim(),
        }),
      });
      const j = (await r.json().catch(() => ({}))) as
        | DraftApiResponse
        | { error?: string; detail?: string };
      if (!r.ok || !('draftReply' in j)) {
        const err = 'error' in j ? `${j.error ?? 'unknown'}${j.detail ? `: ${j.detail}` : ''}` : `http_${r.status}`;
        setDraftError(err);
        return;
      }
      setDraftResult(j);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'network_error');
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleCopy() {
    if (!editedReply.trim()) return;
    try {
      await navigator.clipboard.writeText(editedReply);
      setToast({ kind: 'success', message: 'Reply copied to clipboard' });
    } catch {
      setToast({ kind: 'error', message: 'Could not copy — select and copy manually' });
    }
  }

  // Clear the inbound + draft but keep the phone/thread loaded, ready for the
  // contact's next message in the same conversation.
  function handleNextMessage() {
    setInboundMessage('');
    setDraftResult(null);
    setDraftError(null);
  }

  async function handleLog() {
    if (!draftResult) return;
    setLogLoading(true);
    try {
      const r = await fetch('/api/admin/wa-assistant/log', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          inbound: inboundMessage.trim(),
          draftReply: editedReply.trim() || draftResult.draftReply,
          matchedPatternId: draftResult.matchedPatternId,
          matchedPatternName: draftResult.matchedPatternName,
          followUpQuestion: draftResult.followUpQuestion,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { threadRelative?: string; created?: boolean; turnNumber?: number; error?: string; detail?: string };
      if (!r.ok || !j.threadRelative) {
        const err = `${j.error ?? `http_${r.status}`}${j.detail ? `: ${j.detail}` : ''}`;
        setToast({ kind: 'error', message: `Log failed: ${err}` });
        return;
      }
      const verb = j.created ? 'created' : `appended (turn ${j.turnNumber})`;
      setToast({ kind: 'success', message: `Logged to ${j.threadRelative} — ${verb}` });
      // Refresh the thread panel + contacts list + clear inputs so the user
      // can start the next turn cleanly.
      await fetchThread(phone.trim());
      void fetchContacts();
      setInboundMessage('');
      setDraftResult(null);
    } catch (err) {
      setToast({ kind: 'error', message: err instanceof Error ? err.message : 'log_failed' });
    } finally {
      setLogLoading(false);
    }
  }

  const canDraft =
    /^\d{10,15}$/.test(phone.trim()) && inboundMessage.trim().length > 0 && !draftLoading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-6">
          <p
            className="font-display uppercase tracking-widest text-xs mb-2"
            style={{ color: COLORS.accent }}
          >
            Admin tools
          </p>
          <h1
            className="font-display text-3xl"
            style={{ color: COLORS.heading }}
          >
            Whats<span style={{ color: COLORS.orange }}>App</span> assistant
          </h1>
          <p
            className="font-body text-sm mt-2"
            style={{ color: COLORS.muted }}
          >
            Paste an inbound message, get a drafted reply matched to a{' '}
            <code>qa-library.md</code> pattern. Copy to WhatsApp Web, then log
            the turn so the corpus keeps growing.
          </p>
        </header>

        <section
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: COLORS.card, border: `1.5px solid ${COLORS.border}` }}
        >
          {contacts.length > 0 && (
            <>
              <FieldLabel>Recent contacts</FieldLabel>
              <select
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  clearStaleDraft();
                  setPhone(e.target.value);
                }}
                className="w-full rounded-lg px-3 py-2 font-body text-sm mb-4"
                style={{
                  border: `1.5px solid ${COLORS.border}`,
                  color: COLORS.heading,
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="">— Resume a logged conversation —</option>
                {contacts.map((c) => (
                  <option key={c.phone} value={c.phone}>
                    {c.phone}
                    {c.categoryInterest ? ` · ${c.categoryInterest}` : ''}
                    {` · ${c.turns} turn${c.turns === 1 ? '' : 's'}`}
                    {c.lastDate ? ` · ${c.lastDate}` : ''}
                    {c.status ? ` · ${c.status}` : ''}
                  </option>
                ))}
              </select>
            </>
          )}

          <FieldLabel>Sender phone (digits only, e.g. 27739480122)</FieldLabel>
          <input
            type="text"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              clearStaleDraft();
              setPhone(e.target.value.replace(/[^\d]/g, ''));
            }}
            placeholder="27739480122"
            className="w-full rounded-lg px-3 py-2 font-mono text-sm"
            style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.heading }}
          />
          <ThreadStatus thread={thread} loading={threadLoading} phoneValid={PHONE_REGEX.test(phone)} />

          <FieldLabel>Inbound WhatsApp message</FieldLabel>
          <textarea
            value={inboundMessage}
            onChange={(e) => {
              clearStaleDraft();
              setInboundMessage(e.target.value);
            }}
            rows={4}
            placeholder="How do I get jobs with only matric to work overseas"
            className="w-full rounded-lg px-3 py-2 font-body text-sm mb-4"
            style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.heading }}
          />

          <button
            type="button"
            onClick={handleDraft}
            disabled={!canDraft}
            className="rounded-full px-6 py-2 font-display uppercase tracking-wider text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: COLORS.primary, color: '#FFFFFF' }}
          >
            {draftLoading ? 'Drafting…' : 'Draft reply'}
          </button>

          {draftError && (
            <p
              className="mt-3 rounded-md px-3 py-2 text-xs font-mono"
              style={{ backgroundColor: COLORS.errorBg, color: COLORS.errorText }}
            >
              Draft failed: {draftError}
            </p>
          )}
        </section>

        {draftResult && (
          <ResultPanel
            result={draftResult}
            editedReply={editedReply}
            onEditReply={setEditedReply}
            onCopy={handleCopy}
            onLog={handleLog}
            logLoading={logLoading}
            onRegenerate={handleDraft}
            draftLoading={draftLoading}
            onNextMessage={handleNextMessage}
            onNewPatternAdded={(id) => {
              setToast({ kind: 'success', message: `Pattern added to qa-library.md as ${id}` });
            }}
          />
        )}

        {thread && thread.exists && thread.turns.length > 0 && (
          <ThreadHistoryPanel thread={thread} />
        )}

        {toast && <ToastBubble toast={toast} />}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block font-display uppercase tracking-wider text-xs mb-2"
      style={{ color: COLORS.heading }}
    >
      {children}
    </label>
  );
}

function ResultPanel({
  result,
  editedReply,
  onEditReply,
  onCopy,
  onLog,
  logLoading,
  onRegenerate,
  draftLoading,
  onNextMessage,
  onNewPatternAdded,
}: {
  result: DraftApiResponse;
  editedReply: string;
  onEditReply: (v: string) => void;
  onCopy: () => void;
  onLog: () => void;
  logLoading: boolean;
  onRegenerate: () => void;
  draftLoading: boolean;
  onNextMessage: () => void;
  onNewPatternAdded: (id: string) => void;
}) {
  const isNewPattern = result.matchedPatternId === 'new-pattern-needed';
  return (
    <section
      className="rounded-2xl p-6 mb-6"
      style={{ backgroundColor: COLORS.card, border: `1.5px solid ${COLORS.border}` }}
    >
      <div className="mb-4">
        <p
          className="font-display uppercase tracking-wider text-xs mb-1"
          style={{ color: COLORS.muted }}
        >
          Matched pattern
        </p>
        <p className="font-body text-sm" style={{ color: COLORS.heading }}>
          {isNewPattern ? (
            <span style={{ color: COLORS.orange }}>
              No existing pattern matched — see &quot;Add to library&quot; below.
            </span>
          ) : (
            <>
              <strong>{result.matchedPatternName}</strong>{' '}
              <code style={{ color: COLORS.muted }}>({result.matchedPatternId})</code>
            </>
          )}
        </p>
      </div>

      <ViolationsPanel violations={result.ruleViolations} />

      <div className="mb-4">
        <p
          className="font-display uppercase tracking-wider text-xs mb-2"
          style={{ color: COLORS.muted }}
        >
          Drafted reply — edit before copying if needed
        </p>
        <textarea
          value={editedReply}
          onChange={(e) => onEditReply(e.target.value)}
          rows={7}
          className="w-full font-body text-sm whitespace-pre-wrap rounded-lg px-3 py-3"
          style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.heading }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full px-5 py-2 font-display uppercase tracking-wider text-xs"
          style={{ backgroundColor: COLORS.primary, color: '#FFFFFF' }}
        >
          Copy reply
        </button>
        <button
          type="button"
          onClick={onLog}
          disabled={logLoading}
          className="rounded-full px-5 py-2 font-display uppercase tracking-wider text-xs disabled:opacity-40"
          style={{ backgroundColor: COLORS.accent, color: '#FFFFFF' }}
        >
          {logLoading ? 'Logging…' : 'Log this turn'}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={draftLoading}
          className="rounded-full px-5 py-2 font-display uppercase tracking-wider text-xs disabled:opacity-40"
          style={{ backgroundColor: '#FFFFFF', color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` }}
        >
          {draftLoading ? 'Drafting…' : 'Try another draft'}
        </button>
        <button
          type="button"
          onClick={onNextMessage}
          className="rounded-full px-5 py-2 font-display uppercase tracking-wider text-xs"
          style={{ backgroundColor: '#FFFFFF', color: COLORS.muted, border: `1.5px solid ${COLORS.border}` }}
        >
          Next message →
        </button>
      </div>
      <p className="font-body text-xs mt-1" style={{ color: COLORS.muted }}>
        <strong>Try another draft</strong> re-runs the AI on the same message ·{' '}
        <strong>Next message</strong> clears the box for the contact&apos;s reply (keeps the thread).
      </p>

      {isNewPattern && result.newPatternSuggestion && (
        <AddPatternForm
          suggestion={result.newPatternSuggestion}
          onAdded={onNewPatternAdded}
        />
      )}
    </section>
  );
}

function ViolationsPanel({ violations }: { violations: RuleViolation[] }) {
  // 'auto' entries are self-corrections the system already applied — neutral,
  // not something to fix. Everything else is a soft warning to review.
  const autoNotices = violations.filter((v) => v.source === 'auto');
  const realViolations = violations.filter((v) => v.source !== 'auto');

  return (
    <div className="mb-4 space-y-3">
      {realViolations.length === 0 ? (
        <p
          className="rounded-md px-3 py-2 font-mono text-xs"
          style={{ backgroundColor: COLORS.successBg, color: COLORS.successText }}
        >
          ✓ No rule violations detected.
        </p>
      ) : (
        <div>
          <p
            className="font-display uppercase tracking-wider text-xs mb-2"
            style={{ color: COLORS.errorText }}
          >
            ⚠ Possible rule violations (soft warning — review before sending)
          </p>
          <ul className="space-y-1">
            {realViolations.map((v, idx) => (
              <li
                key={idx}
                className="rounded-md px-3 py-2 font-mono text-xs"
                style={{
                  backgroundColor: v.source === 'regex' ? COLORS.errorBg : COLORS.warnBg,
                  color: v.source === 'regex' ? COLORS.errorText : COLORS.warnText,
                }}
              >
                <strong>[{v.source}]</strong> rule {v.rule}: {v.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {autoNotices.length > 0 && (
        <ul className="space-y-1">
          {autoNotices.map((v, idx) => (
            <li
              key={idx}
              className="rounded-md px-3 py-2 font-body text-xs"
              style={{ backgroundColor: COLORS.infoBg, color: COLORS.infoText }}
            >
              ℹ {v.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddPatternForm({
  suggestion,
  onAdded,
}: {
  suggestion: NewPatternSuggestion;
  onAdded: (id: string) => void;
}) {
  const [name, setName] = useState(suggestion.name);
  const [shapes, setShapes] = useState(suggestion.questionShapes.join('\n'));
  const [reply, setReply] = useState(suggestion.replyTemplate);
  const [followUp, setFollowUp] = useState(suggestion.followUp);
  const [categories, setCategories] = useState(suggestion.likelyCategories.join(', '));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch('/api/admin/wa-assistant/add-pattern', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          questionShapes: shapes.split('\n').map((s) => s.trim()).filter(Boolean),
          replyTemplate: reply.trim(),
          followUp: followUp.trim(),
          likelyCategories: categories.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { id?: string; error?: string; detail?: string };
      if (!r.ok || !j.id) {
        setErr(`${j.error ?? `http_${r.status}`}${j.detail ? `: ${j.detail}` : ''}`);
        return;
      }
      onAdded(j.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'add_failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="mt-4 rounded-xl p-4"
      style={{ backgroundColor: COLORS.bg, border: `1.5px dashed ${COLORS.accent}` }}
    >
      <p
        className="font-display uppercase tracking-wider text-xs mb-3"
        style={{ color: COLORS.heading }}
      >
        Add this pattern to qa-library.md
      </p>
      <FieldLabel>Pattern name</FieldLabel>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg px-3 py-2 font-body text-sm mb-3"
        style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.heading }}
      />
      <FieldLabel>Question shapes (one per line)</FieldLabel>
      <textarea
        value={shapes}
        onChange={(e) => setShapes(e.target.value)}
        rows={3}
        className="w-full rounded-lg px-3 py-2 font-body text-xs mb-3"
        style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.heading }}
      />
      <FieldLabel>Reply template</FieldLabel>
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={4}
        className="w-full rounded-lg px-3 py-2 font-body text-xs mb-3"
        style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.heading }}
      />
      <FieldLabel>Follow-up question</FieldLabel>
      <input
        type="text"
        value={followUp}
        onChange={(e) => setFollowUp(e.target.value)}
        className="w-full rounded-lg px-3 py-2 font-body text-sm mb-3"
        style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.heading }}
      />
      <FieldLabel>Likely categories (comma-separated slugs)</FieldLabel>
      <input
        type="text"
        value={categories}
        onChange={(e) => setCategories(e.target.value)}
        placeholder="hospitality, seasonal"
        className="w-full rounded-lg px-3 py-2 font-body text-sm mb-3"
        style={{ border: `1.5px solid ${COLORS.border}`, color: COLORS.heading }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="rounded-full px-5 py-2 font-display uppercase tracking-wider text-xs disabled:opacity-40"
        style={{ backgroundColor: COLORS.orange, color: '#FFFFFF' }}
      >
        {busy ? 'Adding…' : 'Add to library'}
      </button>
      {err && (
        <p
          className="mt-2 rounded-md px-3 py-2 font-mono text-xs"
          style={{ backgroundColor: COLORS.errorBg, color: COLORS.errorText }}
        >
          {err}
        </p>
      )}
    </div>
  );
}

function ThreadStatus({
  thread,
  loading,
  phoneValid,
}: {
  thread: Thread | null;
  loading: boolean;
  phoneValid: boolean;
}) {
  if (!phoneValid) {
    return (
      <p
        className="mt-1 mb-4 font-mono text-xs"
        style={{ color: COLORS.muted }}
      >
        Enter a valid phone (10-15 digits) to auto-load the conversation history.
      </p>
    );
  }
  if (loading) {
    return (
      <p
        className="mt-1 mb-4 font-mono text-xs"
        style={{ color: COLORS.muted }}
      >
        Loading thread…
      </p>
    );
  }
  if (!thread || !thread.exists) {
    return (
      <p
        className="mt-1 mb-4 font-mono text-xs"
        style={{ color: COLORS.accent }}
      >
        ✦ New contact — no prior turns. A new thread file will be created on Log.
      </p>
    );
  }
  return (
    <p
      className="mt-1 mb-4 font-mono text-xs"
      style={{ color: COLORS.successText }}
    >
      ✓ Thread loaded — {thread.turns.length} prior{' '}
      {thread.turns.length === 1 ? 'turn' : 'turns'}
      {thread.categoryInterest ? ` · category: ${thread.categoryInterest}` : ''}
      {thread.status ? ` · status: ${thread.status}` : ''}
    </p>
  );
}

function ThreadHistoryPanel({ thread }: { thread: Thread }) {
  return (
    <section
      className="rounded-2xl p-6 mb-6"
      style={{ backgroundColor: COLORS.card, border: `1.5px solid ${COLORS.border}` }}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2
          className="font-display uppercase tracking-wider text-sm"
          style={{ color: COLORS.heading }}
        >
          Thread history — {thread.phone}
        </h2>
        <span
          className="font-mono text-xs"
          style={{ color: COLORS.muted }}
        >
          {thread.turns.length} {thread.turns.length === 1 ? 'turn' : 'turns'}
        </span>
      </div>
      <ol className="space-y-4">
        {thread.turns.map((t) => (
          <li
            key={`${t.turnNumber}-${t.date}`}
            className="rounded-xl p-4"
            style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}` }}
          >
            <p
              className="font-display uppercase tracking-wider text-xs mb-2"
              style={{ color: COLORS.muted }}
            >
              Turn {t.turnNumber} · {t.date}
              {t.matchedPatternName ? ` · ${t.matchedPatternName}` : ''}
              {t.matchedPatternId ? ` (${t.matchedPatternId})` : ''}
            </p>
            <p
              className="font-body text-sm mb-2"
              style={{ color: COLORS.heading }}
            >
              <span style={{ color: COLORS.orange, fontWeight: 600 }}>Them: </span>
              {t.inbound}
            </p>
            {t.draftReply && (
              <p
                className="font-body text-sm whitespace-pre-wrap"
                style={{ color: COLORS.heading }}
              >
                <span style={{ color: COLORS.primary, fontWeight: 600 }}>Us: </span>
                {t.draftReply}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function ToastBubble({ toast }: { toast: Toast }) {
  const palette =
    toast.kind === 'success'
      ? { bg: COLORS.successBg, fg: COLORS.successText }
      : { bg: COLORS.errorBg, fg: COLORS.errorText };
  return (
    <div
      className="fixed bottom-6 right-6 rounded-xl px-4 py-3 shadow-lg font-body text-sm max-w-md"
      style={{ backgroundColor: palette.bg, color: palette.fg, border: `1.5px solid ${palette.fg}` }}
      role="status"
    >
      {toast.message}
    </div>
  );
}
