'use client';

import { useMemo, useState } from 'react';
import { recruiters as ALL, type Recruiter } from '@/lib/outreach-data';

const FILTERS: { label: string; match: (r: Recruiter) => boolean }[] = [
  { label: 'All',                    match: () => true },
  { label: 'Healthcare',             match: r => r.categories.includes('Healthcare') },
  { label: 'Teaching',               match: r => r.categories.includes('Teaching') },
  { label: 'Trades',                 match: r => r.categories.includes('Trades') },
  { label: 'Hospitality',            match: r => r.categories.includes('Hospitality') },
  { label: 'TEFL',                   match: r => r.categories.includes('TEFL') },
  { label: 'Au Pair',                match: r => r.categories.includes('Au Pair') },
  { label: 'Engineering',            match: r => r.categories.includes('Engineering') },
  { label: 'IT/Tech',                match: r => r.categories.includes('IT/Tech') },
  { label: 'Accounting',             match: r => r.categories.includes('Accounting') },
  { label: 'Migration consultants',  match: r => r.categories.includes('Migration consultants') },
];

const TYPE_COLOUR: Record<string, string> = {
  Healthcare: '#1B4D3E',
  Teaching: '#C9A84C',
  Trades: '#2C2C2C',
  Hospitality: '#ff751f',
  TEFL: '#1B4D3E',
  'Au Pair': '#C9A84C',
  Engineering: '#1B4D3E',
  'IT/Tech': '#2C2C2C',
  Accounting: '#1B4D3E',
  'Migration consultants': '#6B6B6B',
};

function categoryColour(r: Recruiter): string {
  for (const cat of r.categories) {
    if (TYPE_COLOUR[cat]) return TYPE_COLOUR[cat];
  }
  return '#6B6B6B';
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function RecruitersTable() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const f = FILTERS.find(x => x.label === activeFilter) ?? FILTERS[0];
    const q = query.trim().toLowerCase();
    return ALL.filter(r => f.match(r)).filter(r => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q) ||
        r.destinations.some(d => d.toLowerCase().includes(q)) ||
        r.type.toLowerCase().includes(q)
      );
    });
  }, [activeFilter, query]);

  return (
    <div className="flex flex-col gap-8">

      {/* Filters + search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => {
            const count = ALL.filter(f.match).length;
            if (count === 0 && f.label !== 'All') return null;
            const active = f.label === activeFilter;
            return (
              <button
                key={f.label}
                onClick={() => setActiveFilter(f.label)}
                className="font-body text-sm px-4 py-2 rounded-full border transition-all"
                style={{
                  borderColor: active ? '#1B4D3E' : '#EDE8E0',
                  backgroundColor: active ? '#1B4D3E' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#2C2C2C',
                }}
              >
                {f.label} <span style={{ opacity: 0.6 }}>({count})</span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, country or service…"
          className="w-full font-body text-base px-5 py-3 rounded-full border outline-none"
          style={{ borderColor: '#EDE8E0', backgroundColor: '#FFFFFF', color: '#2C2C2C' }}
        />
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          Showing <strong>{filtered.length}</strong> of {ALL.length} organisations
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(r => {
          const colour = categoryColour(r);
          const isAlleged = r.evidence === 'alleged';
          return (
            <article
              key={r.name}
              className="flex flex-col gap-3 p-6 rounded-2xl border bg-white"
              style={{ borderColor: '#EDE8E0' }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="font-display text-[0.65rem] uppercase tracking-[0.15em] px-3 py-1 rounded-full"
                  style={{ backgroundColor: colour, color: '#FFFFFF' }}
                >
                  {r.categories[0] ?? r.type}
                </span>
                {r.type && r.type !== r.categories[0] && (
                  <span
                    className="font-body text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#EDE8E0', color: '#2C2C2C' }}
                  >
                    {r.type}
                  </span>
                )}
                {isAlleged && (
                  <span
                    className="font-body text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#fff4ec', color: '#ff751f', border: '1px solid #ff751f' }}
                    title="The wiki research could not fully verify this entity. Confirm directly before paying anything."
                  >
                    Verify before contacting
                  </span>
                )}
              </div>

              <h3 className="font-display text-xl font-semibold leading-tight" style={{ color: '#2C2C2C' }}>
                {r.name}
              </h3>

              {r.destinations.length > 0 && (
                <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
                  <strong style={{ color: '#2C2C2C' }}>Places candidates in:</strong>{' '}
                  {r.destinations.join(', ')}
                </p>
              )}

              {r.notes && (
                <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                  {r.notes}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
                {r.website && (
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm font-semibold px-4 py-2 rounded-full"
                    style={{ backgroundColor: '#1B4D3E', color: '#FFFFFF' }}
                  >
                    Visit {hostFromUrl(r.website)} →
                  </a>
                )}
                {r.email && (
                  <a
                    href={`mailto:${r.email}`}
                    className="font-body text-sm underline"
                    style={{ color: '#1B4D3E' }}
                  >
                    {r.email}
                  </a>
                )}
                {r.phone && (
                  <span className="font-body text-sm" style={{ color: '#6B6B6B' }}>
                    {r.phone}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="font-body text-base text-center py-10" style={{ color: '#6B6B6B' }}>
          Nothing matches that search. Try a different keyword.
        </p>
      )}
    </div>
  );
}
