'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ConfirmEmailClient({ email }: { email: string | null }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  }

  if (!email) {
    return (
      <div
        className="p-6 rounded-md font-body"
        style={{ backgroundColor: '#EDE8E0', color: '#2C2C2C' }}
      >
        <p className="mb-3">
          Check the inbox you used when registering. If you can&apos;t find the email,
          please log in and we&apos;ll resend it.
        </p>
        <Link href="/login" className="underline" style={{ color: '#1B4D3E' }}>
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="p-6 rounded-md font-body"
        style={{ backgroundColor: '#EDE8E0', color: '#2C2C2C' }}
      >
        <p className="mb-2">
          We&apos;ve sent a confirmation link to{' '}
          <strong style={{ color: '#1B4D3E' }}>{email}</strong>.
        </p>
        <p>Click the link in the email to unlock your guide. Don&apos;t forget to check spam.</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={status === 'sending'}
          className="font-display uppercase tracking-wider text-sm font-semibold px-8 py-4 rounded-md transition-opacity disabled:opacity-60 self-start cursor-pointer"
          style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
        >
          {status === 'sending' ? 'Sending…' : 'Resend confirmation email'}
        </button>

        {status === 'sent' && (
          <p className="font-body text-sm" style={{ color: '#1B4D3E' }}>
            Confirmation email sent — check your inbox.
          </p>
        )}
        {status === 'error' && (
          <p className="font-body text-sm" style={{ color: '#b00020' }}>
            {errorMsg}
          </p>
        )}
      </div>

      <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
        Wrong email or used another account?{' '}
        <Link href="/login" className="underline" style={{ color: '#1B4D3E' }}>
          Log in instead
        </Link>
        .
      </p>
    </div>
  );
}
