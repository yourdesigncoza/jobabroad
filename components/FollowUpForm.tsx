'use client';

import { useState, type FormEvent } from 'react';

interface Props {
  credits: number;
  bookHref: string;
}

export default function FollowUpForm({ credits, bookHref }: Props) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(credits);

  if (remaining === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3
          className="font-display font-bold uppercase tracking-wide text-sm"
          style={{ color: '#2C2C2C' }}
        >
          Send a follow-up
        </h3>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          You&apos;ve used all 5 follow-ups.{' '}
          <a href={bookHref} className="underline" style={{ color: '#1B4D3E' }}>
            Book a fresh call to chat again.
          </a>
        </p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const r = await fetch('/api/follow-up/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const j = (await r.json()) as { error?: string; remaining?: number };
      if (!r.ok) {
        setStatus('error');
        setError(j.error ?? 'send failed');
        return;
      }
      setStatus('sent');
      if (typeof j.remaining === 'number') setRemaining(j.remaining);
      setSubject('');
      setBody('');
    } catch {
      setStatus('error');
      setError('network error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3
          className="font-display font-bold uppercase tracking-wide text-sm"
          style={{ color: '#2C2C2C' }}
        >
          Send a follow-up
        </h3>
        <span className="font-body text-xs" style={{ color: '#6B6B6B' }}>
          {remaining} of 5 left
        </span>
      </div>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        required
        maxLength={120}
        disabled={status === 'sending'}
        className="px-3 py-2 rounded-md font-body text-sm outline-none"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Your question or update…"
        required
        rows={5}
        maxLength={2000}
        disabled={status === 'sending'}
        className="px-3 py-2 rounded-md font-body text-sm outline-none resize-y"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
      />
      <button
        type="submit"
        disabled={status === 'sending' || !subject.trim() || !body.trim()}
        className="font-display uppercase text-xs font-semibold px-5 py-2 rounded-md self-start disabled:opacity-50"
        style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
      >
        {status === 'sending' ? 'Sending…' : 'Send follow-up'}
      </button>
      {status === 'sent' && (
        <p className="font-body text-sm" style={{ color: '#1B4D3E' }}>
          Sent. We&apos;ll reply by email.
        </p>
      )}
      {status === 'error' && (
        <p className="font-body text-sm" style={{ color: '#B53A2B' }}>
          Failed: {error}
        </p>
      )}
    </form>
  );
}
