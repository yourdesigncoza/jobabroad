'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import WhatsAppIcon from '@/components/WhatsAppIcon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);

  async function generate() {
    setStatus('loading');
    setLink('');
    const res = await fetch('/api/admin/generate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, phone, category }),
    });
    const data = await res.json();
    if (res.ok) {
      setLink(data.memberLink);
      setStatus('success');
    } else {
      setLink(data.error ?? 'Something went wrong');
      setStatus('error');
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waLink = link
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Here is your Jobabroad access link:\n${link}`)}`
    : '';

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#F8F5F0' }}>
      <div className="w-full max-w-md">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="/"
            className="font-display font-bold text-2xl uppercase tracking-widest"
            style={{ color: '#1B4D3E' }}
          >
            JOBABROAD
          </a>
          <a
            href="/"
            className="font-body text-sm font-semibold flex items-center gap-1"
            style={{ color: '#6B6B6B' }}
          >
            ← Home
          </a>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold uppercase text-lg tracking-wide" style={{ color: '#2C2C2C' }}>
            Generate Member Link
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: '#6B6B6B' }}>
            After PayShap payment confirmed — generate and send the access link.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: '#6B6B6B' }}>
              Admin Secret
            </label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none"
              style={{ border: '1.5px solid #EDE8E0', backgroundColor: '#FFFFFF', color: '#2C2C2C' }}
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: '#6B6B6B' }}>
              Customer WhatsApp Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="27821234567"
              className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none"
              style={{ border: '1.5px solid #EDE8E0', backgroundColor: '#FFFFFF', color: '#2C2C2C' }}
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: '#6B6B6B' }}>
              Pathway Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none appearance-none"
              style={{ border: '1.5px solid #EDE8E0', backgroundColor: '#FFFFFF', color: '#2C2C2C' }}
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={generate}
            disabled={status === 'loading' || !secret || !phone}
            className="w-full rounded-xl px-4 py-3 font-display font-bold uppercase text-sm tracking-wide transition-all"
            style={{
              backgroundColor: status === 'loading' ? '#6B6B6B' : '#1B4D3E',
              color: '#F8F5F0',
              opacity: !secret || !phone ? 0.5 : 1,
            }}
          >
            {status === 'loading' ? 'Generating...' : 'Generate Link'}
          </button>
        </div>

        {/* Result */}
        {status === 'success' && link && (
          <div className="mt-6 rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}>
            <p className="font-body text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
              Member Link
            </p>
            <p className="font-mono text-sm break-all" style={{ color: '#1B4D3E' }}>{link}</p>

            <div className="flex gap-2 mt-1">
              <button
                onClick={copyLink}
                className="flex-1 rounded-xl px-4 py-2.5 font-display font-bold uppercase text-xs tracking-wide transition-all"
                style={{ backgroundColor: copied ? '#1B4D3E' : '#EDE8E0', color: copied ? '#F8F5F0' : '#2C2C2C' }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-display font-bold uppercase text-xs tracking-wide"
                style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
              >
                <WhatsAppIcon size={14} color="#FFFFFF" />
                Send via WhatsApp
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <p className="font-body text-sm" style={{ color: '#dc2626' }}>{link}</p>
          </div>
        )}
      </div>
    </main>
  );
}
