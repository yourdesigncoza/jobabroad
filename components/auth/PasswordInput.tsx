'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
  id: string;
  name: string;
  autoComplete?: 'new-password' | 'current-password';
  minLength?: number;
  required?: boolean;
};

const inputStyle: React.CSSProperties = {
  backgroundColor: '#F8F5F0',
  border: '1px solid #EDE8E0',
  color: '#2C2C2C',
};

export default function PasswordInput({
  id,
  name,
  autoComplete = 'current-password',
  minLength,
  required = true,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3 pr-12 rounded-md font-body"
        style={inputStyle}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center rounded-r-md cursor-pointer"
        style={{ color: '#6B6B6B' }}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
