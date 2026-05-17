'use client';

import { useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

const CONSENT_TEXT =
  'I agree that this call may be recorded for the purpose of preparing or improving my work-abroad guidance.';

interface Props {
  calLink: string;
  userEmail: string;
}

export default function BookingClient({ calLink, userEmail }: Props) {
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!consented) return;
    (async () => {
      const api = await getCalApi({ namespace: '15min' });
      api('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, [consented]);

  async function onToggle(checked: boolean) {
    if (!checked) {
      setConsented(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/booking/consent', { method: 'POST' });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setError(j.error ?? 'consent_save_failed');
        return;
      }
      setConsented(true);
    } catch {
      setError('network_error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <label
        className="flex items-start gap-3 p-4 rounded-xl cursor-pointer"
        style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
      >
        <input
          type="checkbox"
          checked={consented}
          disabled={busy}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 accent-[#1B4D3E] w-4 h-4 shrink-0"
        />
        <span className="font-body text-sm" style={{ color: '#2C2C2C' }}>
          {CONSENT_TEXT}
        </span>
      </label>

      {error && (
        <p className="font-body text-sm" style={{ color: '#B53A2B' }}>
          Couldn&apos;t save consent: {error}. Please try again.
        </p>
      )}

      {consented ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', minHeight: '640px' }}
        >
          <Cal
            namespace="15min"
            calLink={calLink}
            style={{ width: '100%', height: '100%', minHeight: '640px', overflow: 'scroll' }}
            config={{
              layout: 'month_view',
              ...(userEmail ? { email: userEmail } : {}),
            }}
          />
        </div>
      ) : (
        <div
          className="rounded-xl flex items-center justify-center p-12"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #EDE8E0',
            minHeight: '640px',
          }}
        >
          <p
            className="font-display uppercase tracking-wider text-sm font-semibold text-center"
            style={{ color: '#1B4D3E' }}
          >
            Tick the consent checkbox above to unlock booking
          </p>
        </div>
      )}
    </div>
  );
}
