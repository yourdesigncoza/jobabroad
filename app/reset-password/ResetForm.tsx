'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import PasswordInput from '@/components/auth/PasswordInput';
import { resetPassword, type ResetState } from './actions';

const initial: ResetState = { ok: false, fieldErrors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-display uppercase tracking-wider text-sm font-semibold px-8 py-4 rounded-md transition-opacity disabled:opacity-60"
      style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
    >
      {pending ? 'Saving…' : 'Set new password'}
    </button>
  );
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="text-sm mt-1" style={{ color: '#b00020' }}>
      {children}
    </p>
  );
}

export default function ResetForm() {
  const [state, action] = useActionState(resetPassword, initial);

  const labelClass =
    'font-display uppercase tracking-wider text-xs font-semibold';
  const labelStyle: React.CSSProperties = { color: '#6B6B6B' };

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass} style={labelStyle}>
          New password (at least 8 characters)
        </label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} />
        <ErrorText>{state.fieldErrors.password}</ErrorText>
      </div>

      <ErrorText>{state.fieldErrors._form}</ErrorText>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <SubmitButton />
        <Link href="/login" className="font-body text-sm underline" style={{ color: '#1B4D3E' }}>
          Back to login
        </Link>
      </div>
    </form>
  );
}
