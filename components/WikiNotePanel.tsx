'use client';

import { useEffect, useState } from 'react';

interface Props {
  id: number;
  demoCategory?: string;
}

interface WikiResponse {
  id: number;
  heading: string;
  slug: string | null;
  html: string;
}

export default function WikiNotePanel({ id, demoCategory }: Props) {
  const [data, setData] = useState<WikiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setData(null);
    const qs = demoCategory ? `?demo=${encodeURIComponent(demoCategory)}` : '';
    fetch(`/api/wiki/${id}${qs}`)
      .then(async (r) => {
        if (r.status === 429) {
          throw new Error('Daily preview limit reached');
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: WikiResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, demoCategory]);

  if (error) {
    return (
      <div className="mt-3 p-4 rounded-lg font-body text-sm" style={{ backgroundColor: '#FBEFEF', color: '#8C2A2A' }}>
        Could not load this note ({error}).
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-3 p-4 rounded-lg font-body text-sm" style={{ backgroundColor: '#EDE8E0', color: '#6B6B6B' }}>
        Loading…
      </div>
    );
  }

  return (
    <div
      className="mt-3 p-5 rounded-lg
        prose prose-sm max-w-none
        prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide
        prose-h1:text-base prose-h2:text-sm prose-h3:text-xs
        prose-headings:text-[#2C2C2C]
        prose-p:text-[#2C2C2C] prose-p:font-body
        prose-li:text-[#2C2C2C] prose-li:font-body
        prose-a:text-[#1B4D3E] prose-a:no-underline hover:prose-a:underline
        prose-strong:text-[#2C2C2C]"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}
