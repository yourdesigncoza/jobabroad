'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { requestReset, type ForgotState } from './actions';

const initial: ForgotState = { sent: false, fieldErrors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-display uppercase tracking-wider text-sm font-semibold px-8 py-4 rounded-md transition-opacity disabled:opacity-60"
      style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
    >
      {pending ? 'Sending…' : 'Send recovery link'}
    </button>
  );
}

export default function ForgotForm() {
  const [state, action] = useActionState(requestReset, initial);

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EDE8E0',
    color: '#2C2C2C',
  };
  const labelClass =
    'font-display uppercase tracking-wider text-xs font-semibold';
  const labelStyle: React.CSSProperties = { color: '#6B6B6B' };

  if (state.sent) {
    return (
      <div
        className="p-6 rounded-md font-body"
        style={{ backgroundColor: '#EDE8E0', color: '#2C2C2C' }}
      >
        <p className="mb-3">
          If that email is registered, we&apos;ve sent a recovery link. Check your inbox
          (and your spam folder).
        </p>
        <Link href="/login" className="underline" style={{ color: '#1B4D3E' }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass} style={labelStyle}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="px-4 py-3 rounded-md font-body"
          style={inputStyle}
        />
        {state.fieldErrors.email && (
          <p className="text-sm mt-1" style={{ color: '#b00020' }}>
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <SubmitButton />
        <Link href="/login" className="font-body text-sm underline" style={{ color: '#1B4D3E' }}>
          Back to login
        </Link>
      </div>
    </form>
  );
}
