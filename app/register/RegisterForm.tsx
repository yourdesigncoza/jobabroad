'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import PasswordInput from '@/components/auth/PasswordInput';
import { register, type RegisterState } from './actions';

type CategoryOption = { id: string; label: string; emoji: string };

const initial: RegisterState = { ok: false, fieldErrors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-display uppercase tracking-wider text-sm font-semibold px-8 py-4 rounded-md transition-opacity disabled:opacity-60"
      style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
    >
      {pending ? 'Creating account…' : 'Create account'}
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

export default function RegisterForm({
  preselect,
  categories,
}: {
  preselect: string | null;
  categories: readonly CategoryOption[];
}) {
  const [state, action] = useActionState(register, initial);

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
        <label htmlFor="name" className={labelClass} style={labelStyle}>
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="px-4 py-3 rounded-md font-body"
          style={inputStyle}
        />
        <ErrorText>{state.fieldErrors.name}</ErrorText>
      </div>

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
        <label htmlFor="phone" className={labelClass} style={labelStyle}>
          SA mobile (e.g. 061 711 4715)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          className="px-4 py-3 rounded-md font-body"
          style={inputStyle}
        />
        <ErrorText>{state.fieldErrors.phone}</ErrorText>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass} style={labelStyle}>
          Password (at least 8 characters)
        </label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} />
        <ErrorText>{state.fieldErrors.password}</ErrorText>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={labelClass} style={labelStyle}>
          Which work-abroad pathway?
        </legend>
        <p className="text-xs font-body mb-1" style={{ color: '#6B6B6B' }}>
          You can only choose one — this locks your guide. We can change it later if you ask.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 px-3 py-3 rounded-md cursor-pointer font-body text-sm has-[:checked]:font-semibold"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EDE8E0',
                color: '#2C2C2C',
              }}
            >
              <input
                type="radio"
                name="category"
                value={c.id}
                defaultChecked={preselect === c.id}
                required
                className="accent-[#1B4D3E]"
              />
              <span aria-hidden>{c.emoji}</span>
              <span>{c.label}</span>
            </label>
          ))}
        </div>
        <ErrorText>{state.fieldErrors.category}</ErrorText>
      </fieldset>

      <ErrorText>{state.fieldErrors._form}</ErrorText>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <SubmitButton />
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          Already have an account?{' '}
          <Link href="/login" className="underline" style={{ color: '#1B4D3E' }}>
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}
