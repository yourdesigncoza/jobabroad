---
step: 09
title: Paid dashboard surfaces — report link, book link, follow-up form, credits
status: blocked
depends: [01, 08]
plan: r495-paid-tier
---

# Step 09: Paid dashboard surfaces

## Objective

When `profile.tier === 'paid'`, show three new sections on `/dashboard`:
(1) Download report (PDF), (2) Book your 15-min call, (3) Send a
follow-up message with credits remaining.

## Context

### Architecture

The existing dashboard at `app/dashboard/page.tsx` already loads the
profile via `requireSession`. Extend it to read `tier` and
`paid_email_credits`, then conditionally render the paid section.

Free users continue to see the existing 4-card grid (guide, assessment,
recruiters, scam-warnings). Paid users see those PLUS the paid section
inserted above them.

### Database

Just read `profiles.tier` + `profiles.paid_email_credits` (added in step 01).

### Existing Patterns

Dashboard is a server component (`'use server'` not needed; default).
Uses `dynamic = 'force-dynamic'` already so the tier is always fresh.

### Risk

- No race here — paid flag is server-rendered fresh.
- Show clear empty/low credits state ("0 of 5 follow-ups left — book a fresh call to chat again").

## Implementation

1. In `app/dashboard/page.tsx`:
   - Update profile select to include `tier, paid_email_credits`.
   - Above the existing 4-card grid, add (when `tier='paid'`):

```tsx
{profile.tier === 'paid' && (
  <section className="mb-10 p-6 rounded-2xl"
    style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}>
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-6 h-px" style={{ backgroundColor: '#1B4D3E' }} />
        <span className="font-display text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#1B4D3E' }}>
          Paid tier
        </span>
      </div>
      <h2 className="font-display font-bold uppercase text-xl" style={{ color: '#2C2C2C' }}>
        Your full report &amp; call
      </h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <Link href="/api/reports/download" className="...">
        Download your report (PDF)
      </Link>
      <Link href={`/members/${profile.category}/book`} className="...">
        Book your 15-min call →
      </Link>
    </div>

    <FollowUpForm credits={profile.paid_email_credits} />
  </section>
)}
```

2. Create `components/FollowUpForm.tsx` (`'use client'`):
```tsx
'use client';

import { useState } from 'react';

export default function FollowUpForm({ credits }: { credits: number }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(credits);

  if (remaining === 0) {
    return (
      <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
        Out of follow-ups. <a href="..." className="underline">Book a fresh call to chat again.</a>
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const r = await fetch('/api/follow-up/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subject, body }),
    });
    const j = await r.json();
    if (!r.ok) {
      setStatus('error');
      setError(j.error ?? 'send failed');
      return;
    }
    setStatus('sent');
    setRemaining(j.remaining);
    setSubject('');
    setBody('');
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold uppercase tracking-wide text-sm" style={{ color: '#2C2C2C' }}>
          Send a follow-up
        </h3>
        <span className="font-body text-xs" style={{ color: '#6B6B6B' }}>
          {remaining} of 5 left
        </span>
      </div>
      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Subject"
        required
        maxLength={120}
        className="px-3 py-2 rounded-md font-body text-sm"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Your question…"
        required
        rows={5}
        maxLength={2000}
        className="px-3 py-2 rounded-md font-body text-sm"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
      />
      <button type="submit" disabled={status === 'sending'}
        className="font-display uppercase text-xs font-semibold px-5 py-2 rounded-md self-start"
        style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </button>
      {status === 'sent' && <p style={{color:'#1B4D3E'}}>Sent. John will reply by email.</p>}
      {status === 'error' && <p style={{color:'#b00020'}}>Failed: {error}</p>}
    </form>
  );
}
```

3. Style the buttons consistently with existing dashboard cards (white bg, accent stripe).

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| modify | `app/dashboard/page.tsx` | Add paid section above the grid |
| create | `components/FollowUpForm.tsx` | Client form for follow-up emails |

## Done When

1. Free users see no change on `/dashboard`.
2. Paid users see a "Paid tier" section with: Download report button, Book your 15-min call button, follow-up form showing "N of 5 left".
3. Follow-up form is hidden (replaced with "Out of follow-ups" message) when `paid_email_credits=0`.
4. Build passes.

## Gotchas

- Keep the existing "Log out" + "Reset password" controls; just add
  above them.
- `FollowUpForm` is client; receives `credits` as prop. It also updates
  its own local `remaining` state on successful send (rather than
  re-fetching the dashboard).
