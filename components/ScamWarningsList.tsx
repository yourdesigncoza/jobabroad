'use client';

import { useMemo, useState } from 'react';
import { scamPatterns as ALL, type ScamPattern } from '@/lib/outreach-data';

const CATEGORIES = ['All', 'Healthcare', 'Teaching', 'TEFL', 'Au Pair', 'Engineering', 'Trades', 'Hospitality', 'Seasonal', 'Farming', 'General'] as const;

function prettyChannel(c: string): string {
  const map: Record<string, string> = {
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    telegram: 'Telegram',
    indeed: 'Indeed',
    gumtree: 'Gumtree',
    email: 'Email',
    phone: 'Phone calls',
    fax: 'Fax',
    in_person: 'In person',
    zoom_teams: 'Zoom / Teams',
    website: 'Fake websites',
    recruitment_agency: 'Fake recruitment agencies',
  };
  return map[c.toLowerCase()] ?? c.replace(/_/g, ' ');
}

function groupByCategory(items: ScamPattern[]) {
  const groups = new Map<string, ScamPattern[]>();
  for (const it of items) {
    const k = it.category;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }
  // sort within group
  for (const arr of groups.values()) arr.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}

export default function ScamWarningsList() {
  const [active, setActive] = useState<typeof CATEGORIES[number]>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL.filter(s => active === 'All' || s.category === active)
      .filter(s => {
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.channels.some(c => c.toLowerCase().includes(q)) ||
          s.destinations.some(d => d.toLowerCase().includes(q))
        );
      });
  }, [active, query]);

  const groups = groupByCategory(filtered);

  return (
    <div className="flex flex-col gap-8">

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => {
            const count = c === 'All' ? ALL.length : ALL.filter(s => s.category === c).length;
            if (count === 0 && c !== 'All') return null;
            const isActive = c === active;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className="font-body text-sm px-4 py-2 rounded-full border transition-all"
                style={{
                  borderColor: isActive ? '#7A1F1F' : '#EDE8E0',
                  backgroundColor: isActive ? '#7A1F1F' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#2C2C2C',
                }}
              >
                {c} <span style={{ opacity: 0.6 }}>({count})</span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by scam name, country or channel (WhatsApp, Facebook…)…"
          className="w-full font-body text-base px-5 py-3 rounded-full border outline-none"
          style={{ borderColor: '#EDE8E0', backgroundColor: '#FFFFFF', color: '#2C2C2C' }}
        />
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          Showing <strong>{filtered.length}</strong> of {ALL.length} scam patterns
        </p>
      </div>

      {[...groups.entries()].map(([group, items]) => (
        <section key={group} className="flex flex-col gap-5">
          <h2
            className="font-display text-2xl md:text-3xl font-bold uppercase"
            style={{ color: '#2C2C2C' }}
          >
            {group} scams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map(s => (
              <article
                key={s.name + s.vault}
                className="flex flex-col gap-4 rounded-2xl border bg-white overflow-hidden"
                style={{ borderColor: '#EDE8E0' }}
              >
                <div
                  className="px-5 py-3"
                  style={{ backgroundColor: '#7A1F1F' }}
                >
                  <h3 className="font-display text-base md:text-lg font-semibold leading-tight" style={{ color: '#FFFFFF' }}>
                    {s.name}
                  </h3>
                </div>

                <div className="flex flex-col gap-3 px-5 pb-5">
                  {s.summary && (
                    <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                      {s.summary}
                    </p>
                  )}

                  {s.channels.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <p className="font-display text-[0.65rem] uppercase tracking-[0.15em]" style={{ color: '#6B6B6B' }}>
                        How they reach you
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.channels.map(c => (
                          <span
                            key={c}
                            className="font-body text-xs px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: '#F8F5F0', color: '#2C2C2C', border: '1px solid #EDE8E0' }}
                          >
                            {prettyChannel(c)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.typicalFeeZar && (
                    <div className="flex flex-col gap-1">
                      <p className="font-display text-[0.65rem] uppercase tracking-[0.15em]" style={{ color: '#6B6B6B' }}>
                        Typical fee they ask for
                      </p>
                      <p className="font-body text-sm" style={{ color: '#2C2C2C' }}>
                        R{s.typicalFeeZar}
                      </p>
                    </div>
                  )}

                  {(s.reportSa || s.reportDestination) && (
                    <div
                      className="rounded-xl p-4 mt-2"
                      style={{ backgroundColor: '#F8F5F0', border: '1px dashed #EDE8E0' }}
                    >
                      {s.reportSa && (
                        <div className="flex flex-col gap-1 mb-2">
                          <p className="font-display text-[0.65rem] uppercase tracking-[0.15em]" style={{ color: '#1B4D3E' }}>
                            Report it (in South Africa)
                          </p>
                          <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                            {s.reportSa}
                          </p>
                        </div>
                      )}
                      {s.reportDestination && (
                        <div className="flex flex-col gap-1">
                          <p className="font-display text-[0.65rem] uppercase tracking-[0.15em]" style={{ color: '#1B4D3E' }}>
                            Report it (destination country)
                          </p>
                          <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                            {s.reportDestination}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="font-body text-base text-center py-10" style={{ color: '#6B6B6B' }}>
          Nothing matches that search.
        </p>
      )}
    </div>
  );
}
