'use client';

import { useState } from 'react';
import WikiNotePanel from './WikiNotePanel';

interface SearchResult {
  id: number;
  source_type: 'guide' | 'wiki';
  heading: string;
  anchor: string | null;
  slug: string | null;
  snippet: string;
  similarity: number;
}

interface Props {
  token: string;
  whatsappNumber: string;
  category: string;
}

export default function PathwaySearch({ token, whatsappNumber, category }: Props) {
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openWiki, setOpenWiki] = useState<number | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setOpenWiki(null);
    try {
      const r = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, query: q }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = (await r.json()) as { results: SearchResult[] };
      setResults(json.results);
    } catch (err) {
      setError((err as Error).message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `I searched "${categoryLabel}" for "${query}" but didn't find what I was looking for. Can you help?`,
  )}`;

  return (
    <section
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this guide — e.g. OSCE cost in NZ"
          className="flex-1 px-4 py-3 rounded-lg font-body text-sm outline-none"
          style={{ backgroundColor: '#F8F5F0', border: '1.5px solid #EDE8E0', color: '#2C2C2C' }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 rounded-lg font-display font-bold uppercase text-sm tracking-wide disabled:opacity-50"
          style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="font-body text-sm" style={{ color: '#8C2A2A' }}>
          Search failed: {error}
        </p>
      )}

      {results !== null && results.length === 0 && (
        <div className="font-body text-sm flex flex-col gap-2" style={{ color: '#6B6B6B' }}>
          <p>No matches for &ldquo;{query}&rdquo;.</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-bold uppercase text-xs tracking-wide self-start px-4 py-2 rounded-full"
            style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
          >
            WhatsApp us
          </a>
        </div>
      )}

      {results && results.length > 0 && (
        <ul className="flex flex-col gap-3">
          {results.map((r) => (
            <li key={r.id} className="flex flex-col gap-2">
              <ResultCard
                result={r}
                isOpen={openWiki === r.id}
                onToggleWiki={() => setOpenWiki((cur) => (cur === r.id ? null : r.id))}
              />
              {r.source_type === 'wiki' && openWiki === r.id && (
                <WikiNotePanel id={r.id} token={token} />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ResultCard({
  result,
  isOpen,
  onToggleWiki,
}: {
  result: SearchResult;
  isOpen: boolean;
  onToggleWiki: () => void;
}) {
  const badge =
    result.source_type === 'guide' ? 'In your guide' : 'Wiki note';
  const badgeColor = result.source_type === 'guide' ? '#1B4D3E' : '#C9A84C';

  if (result.source_type === 'guide') {
    return (
      <a
        href={result.anchor ? `#${result.anchor}` : '#'}
        className="flex flex-col gap-2 p-4 rounded-lg no-underline"
        style={{ backgroundColor: '#F8F5F0', border: '1.5px solid #EDE8E0' }}
      >
        <CardHeader heading={result.heading} badge={badge} badgeColor={badgeColor} />
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          {result.snippet}
        </p>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleWiki}
      className="flex flex-col gap-2 p-4 rounded-lg text-left"
      style={{ backgroundColor: '#F8F5F0', border: '1.5px solid #EDE8E0' }}
    >
      <CardHeader heading={result.heading} badge={badge} badgeColor={badgeColor} />
      <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
        {result.snippet}
      </p>
      <span
        className="font-display text-[0.65rem] font-semibold uppercase tracking-wide self-start"
        style={{ color: '#1B4D3E' }}
      >
        {isOpen ? '▾ Hide' : '▸ Read full note'}
      </span>
    </button>
  );
}

function CardHeader({
  heading,
  badge,
  badgeColor,
}: {
  heading: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="font-display text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
        style={{ backgroundColor: badgeColor, color: '#F8F5F0' }}
      >
        {badge}
      </span>
      <span className="font-display font-bold text-sm" style={{ color: '#2C2C2C' }}>
        {heading}
      </span>
    </div>
  );
}
