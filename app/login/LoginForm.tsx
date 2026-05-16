'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import PasswordInput from '@/components/auth/PasswordInput';
import { login, type LoginState } from './actions';

const initial: LoginState = { ok: false, fieldErrors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-display uppercase tracking-wider text-sm font-semibold px-8 py-4 rounded-md transition-opacity disabled:opacity-60"
      style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
    >
      {pending ? 'Signing in…' : 'Sign in'}
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

export default function LoginForm() {
  const [state, action] = useActionState(login, initial);

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EDE8E0',
    color: '#2C2C2C',
  };
  const labelClass =
    'font-display uppercase tracking-wider text-xs font-semibold';
  const labelStyle: React.CSSProperties = { color: '#6B6B6B' };

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
        <ErrorText>{state.fieldErrors.email}</ErrorText>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={labelClass} style={labelStyle}>
            Password
          </label>
          <Link
            href="/forgot-password"
            className="font-body text-sm underline"
            style={{ color: '#1B4D3E' }}
          >
            Forgot?
          </Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" />
        <ErrorText>{state.fieldErrors.password}</ErrorText>
      </div>

      <ErrorText>{state.fieldErrors._form}</ErrorText>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <SubmitButton />
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          New here?{' '}
          <Link href="/register" className="underline" style={{ color: '#1B4D3E' }}>
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
