'use client';

import { useState } from 'react';

interface Props {
  leadId: string;
  token: string;
  whatsappNumber: string;
}

type Status = 'idle' | 'uploading' | 'done' | 'error';

export default function CVSection({ leadId, token, whatsappNumber }: Props) {
  const [status, setStatus] = useState<Status>('idle');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading');
    const form = new FormData();
    form.append('file', file);
    form.append('leadId', leadId);
    form.append('token', token);
    const res = await fetch('/api/cv/upload', { method: 'POST', body: form });
    setStatus(res.ok ? 'done' : 'error');
  }

  const waFeedbackLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I've uploaded my CV. Could you take a look?")}`;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <div>
        <h2
          className="font-display font-bold uppercase tracking-wide text-base mb-1"
          style={{ color: '#2C2C2C' }}
        >
          Your CV
        </h2>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          We review every CV personally and send feedback via WhatsApp within 24 hours.
        </p>
      </div>

      {/* Download template */}
      <div className="flex flex-col gap-2">
        <p className="font-body text-sm font-semibold" style={{ color: '#2C2C2C' }}>
          No CV yet?
        </p>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          Download our free template, fill it in on your phone or computer, save it as a PDF, then upload it below.
        </p>
        <a
          href="/cv-template.docx"
          download
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display font-bold uppercase text-xs tracking-wide self-start"
          style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
        >
          Download CV Template
        </a>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #EDE8E0' }} />

      {/* Upload */}
      <div className="flex flex-col gap-2">
        <p className="font-body text-sm font-semibold" style={{ color: '#2C2C2C' }}>
          Already have a CV?
        </p>
        {status === 'idle' && (
          <label
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display font-bold uppercase text-xs tracking-wide cursor-pointer self-start"
            style={{ backgroundColor: '#EDE8E0', color: '#2C2C2C' }}
          >
            Choose File (PDF or Word)
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        )}
        {status === 'uploading' && (
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>Uploading...</p>
        )}
        {status === 'done' && (
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm" style={{ color: '#1B4D3E' }}>
              Uploaded. We will review it and WhatsApp you feedback within 24 hours.
            </p>
            <a
              href={waFeedbackLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display font-bold uppercase text-xs tracking-wide self-start"
              style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
            >
              Message us on WhatsApp
            </a>
          </div>
        )}
        {status === 'error' && (
          <p className="font-body text-sm" style={{ color: '#dc2626' }}>
            Upload failed. Please try again or WhatsApp us directly.
          </p>
        )}
      </div>
    </div>
  );
}
