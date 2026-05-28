'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import JourneyTracker, { type JourneyState } from './JourneyTracker';

interface ChatMsg {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: number[];
  pending?: boolean;
}

const PENDING_ID = '__pending__';

export default function AgentChat({
  categoryLabel,
  initialMessages,
  initialJourney,
  consentGiven,
}: {
  categoryLabel: string;
  initialMessages: ChatMsg[];
  initialJourney: JourneyState;
  consentGiven: boolean;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [journey, setJourney] = useState<JourneyState>(initialJourney);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(consentGiven);
  const [consentBusy, setConsentBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reactivate the rolling window + persist the journey seed now that the user
  // is actively on the page (kept out of server render).
  useEffect(() => {
    fetch('/api/agent/touch', { method: 'POST' }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function dropPending() {
    setMessages((m) => m.filter((x) => x.id !== PENDING_ID));
  }

  async function onConsent() {
    setConsentBusy(true);
    try {
      const r = await fetch('/api/agent/consent', { method: 'POST' });
      if (r.ok) setConsent(true);
    } finally {
      setConsentBusy(false);
    }
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || sending) return;
    const requestId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { role: 'user', content: q },
      { id: PENDING_ID, role: 'assistant', content: '…', pending: true },
    ]);
    setInput('');
    setSending(true);
    setError(null);
    try {
      const r = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: q, requestId }),
      });
      const j = (await r.json()) as {
        error?: string;
        answer?: string;
        citations?: number[];
        journey?: JourneyState;
      };
      if (r.status === 429) {
        setLimitHit(true);
        dropPending();
        return;
      }
      if (r.status === 403 && j.error === 'on_hold') {
        setOnHold(true);
        dropPending();
        return;
      }
      if (!r.ok || !j.answer) {
        setError("We couldn't get a reply just then. Please try again.");
        dropPending();
        return;
      }
      setMessages((m) =>
        m.map((x) =>
          x.id === PENDING_ID
            ? { role: 'assistant', content: j.answer!, citations: j.citations ?? [] }
            : x,
        ),
      );
      if (j.journey) setJourney(j.journey);
    } catch {
      setError('Network error. Please try again.');
      dropPending();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Chat column */}
      <div className="flex flex-col gap-4 flex-1 min-w-0 w-full">
        <div
          ref={scrollRef}
          className="rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #EDE8E0',
            minHeight: 360,
            maxHeight: '60vh',
          }}
        >
          {messages.length === 0 && (
            <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
              Ask anything about your move abroad as a {categoryLabel.toLowerCase()} professional —
              visas, registration, documents, timelines, costs.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={m.id ?? i}
              className="flex flex-col gap-1"
              style={{ alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <div
                className="rounded-2xl px-4 py-2.5 font-body text-sm max-w-[85%] whitespace-pre-wrap"
                style={{
                  backgroundColor: m.role === 'user' ? '#1B4D3E' : '#EDE8E0',
                  color: m.role === 'user' ? '#F8F5F0' : '#2C2C2C',
                  opacity: m.pending ? 0.6 : 1,
                }}
              >
                {m.content}
              </div>
              {m.role === 'assistant' && m.citations && m.citations.length > 0 && (
                <span className="font-body text-[11px]" style={{ color: '#6B6B6B' }}>
                  Sources: {m.citations.map((n) => `[${n}]`).join(' ')}
                </span>
              )}
            </div>
          ))}
        </div>

        {limitHit && (
          <p className="font-body text-sm" style={{ color: '#B53A2B' }}>
            You&apos;ve reached today&apos;s message limit. Your coach will be ready again tomorrow.
          </p>
        )}
        {onHold && (
          <p className="font-body text-sm" style={{ color: '#B53A2B' }}>
            Your coaching access is on hold. Please refresh the page to reactivate it.
          </p>
        )}
        {error && (
          <p className="font-body text-sm" style={{ color: '#B53A2B' }}>
            {error}
          </p>
        )}

        <form onSubmit={send} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach…"
            maxLength={2000}
            disabled={sending || limitHit || onHold}
            className="flex-1 px-4 py-3 rounded-xl font-body text-sm outline-none disabled:opacity-50"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0', color: '#2C2C2C' }}
          />
          <button
            type="submit"
            disabled={sending || limitHit || onHold || !input.trim()}
            className="font-display uppercase text-xs font-semibold px-5 py-3 rounded-xl disabled:opacity-50"
            style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>

        {!consent && (
          <label
            className="flex items-start gap-2 rounded-xl px-4 py-3 cursor-pointer"
            style={{ backgroundColor: '#EDE8E0' }}
          >
            <input
              type="checkbox"
              checked={false}
              disabled={consentBusy}
              onChange={onConsent}
              className="mt-0.5"
            />
            <span className="font-body text-xs" style={{ color: '#2C2C2C' }}>
              Email me reminders about my next steps. We&apos;ll only nudge you while you&apos;re
              actively planning, and you can unsubscribe any time.
            </span>
          </label>
        )}
      </div>

      {/* Journey column */}
      <div className="w-full lg:w-72 lg:flex-shrink-0">
        <JourneyTracker milestones={journey.milestones} onJourney={setJourney} />
      </div>
    </div>
  );
}
