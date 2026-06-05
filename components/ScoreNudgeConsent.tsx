'use client';

import { useState } from 'react';

/**
 * Opt-in for proactive follow-up nudges, shown on the score page where
 * assessment-completers land. Posts to the same /api/agent/consent the coach
 * uses (which mints the unsubscribe token), so consent captured here flows into
 * the daily nudge cron. Hides itself once consent is given.
 */
export default function ScoreNudgeConsent({ initialConsent }: { initialConsent: boolean }) {
  const [consent, setConsent] = useState(initialConsent);
  const [busy, setBusy] = useState(false);

  if (consent) return null;

  async function onConsent() {
    setBusy(true);
    try {
      const r = await fetch('/api/agent/consent', { method: 'POST' });
      if (r.ok) setConsent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10">
      <label
        className="flex items-start gap-2 rounded-xl px-4 py-3 cursor-pointer"
        style={{ backgroundColor: '#EDE8E0' }}
      >
        <input
          type="checkbox"
          checked={false}
          disabled={busy}
          onChange={onConsent}
          className="mt-0.5"
        />
        <span className="font-body text-sm" style={{ color: '#2C2C2C' }}>
          Email me reminders about my next steps. We&apos;ll only nudge you while
          you&apos;re actively planning, and you can unsubscribe any time.
        </span>
      </label>
    </div>
  );
}
