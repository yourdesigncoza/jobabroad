'use client';

import { useMemo, useState } from 'react';
import AnswerCard from './AnswerCard';
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

interface AnswerResponse {
  refused: boolean;
  answer?: string;
  citationIds?: number[];
}

interface Props {
  token: string;
  whatsappNumber: string;
  category: string;
}

type AnswerState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'answered'; text: string; citationIds: number[] }
  | { kind: 'refused' }
  | { kind: 'error' };

export default function PathwaySearch({ token, whatsappNumber, category }: Props) {
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openWiki, setOpenWiki] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>({ kind: 'idle' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setOpenWiki(null);
    setAnswerState({ kind: 'idle' });
    setSubmittedQuery(q);
    try {
      const r = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, query: q }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = (await r.json()) as { results: SearchResult[] };
      setResults(json.results);
      setLoading(false);

      if (json.results.length === 0) {
        return;
      }

      setAnswerState({ kind: 'loading' });
      try {
        const a = await fetch('/api/search/answer', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            token,
            query: q,
            chunks: json.results.map((x) => ({ id: x.id, similarity: x.similarity })),
          }),
        });
        if (!a.ok) {
          setAnswerState({ kind: 'error' });
          return;
        }
        const ans = (await a.json()) as AnswerResponse;
        if (ans.refused) {
          setAnswerState({ kind: 'refused' });
        } else if (ans.answer) {
          setAnswerState({
            kind: 'answered',
            text: ans.answer,
            citationIds: ans.citationIds ?? [],
          });
        } else {
          setAnswerState({ kind: 'error' });
        }
      } catch {
        setAnswerState({ kind: 'error' });
      }
    } catch (err) {
      setError((err as Error).message);
      setResults(null);
      setLoading(false);
    }
  };

  const queryForLink = submittedQuery || query;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `I searched "${categoryLabel}" for "${queryForLink}" but didn't find what I was looking for. Can you help?`,
  )}`;

  const resultsById = useMemo(() => {
    const map = new Map<
      number,
      { id: number; source_type: 'guide' | 'wiki'; heading: string; anchor: string | null }
    >();
    (results ?? []).forEach((r) =>
      map.set(r.id, {
        id: r.id,
        source_type: r.source_type,
        heading: r.heading,
        anchor: r.anchor,
      }),
    );
    return map;
  }, [results]);

  const handleCitationClick = (id: number) => {
    const target = resultsById.get(id);
    if (target?.source_type === 'wiki') {
      setOpenWiki(id);
      requestAnimationFrame(() => {
        const el = document.getElementById(`result-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

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

      <span
        className="font-display font-bold uppercase text-[0.65rem] tracking-wide px-3 py-1 rounded-full self-start"
        style={{ backgroundColor: '#ff751f', color: '#FFFFFF' }}
      >
        Tip: Search relevant content for best results
      </span>

      {error && (
        <p className="font-body text-sm" style={{ color: '#8C2A2A' }}>
          Search failed: {error}
        </p>
      )}

      {answerState.kind !== 'idle' && (
        <AnswerCard
          state={
            answerState.kind === 'loading'
              ? 'loading'
              : answerState.kind === 'answered'
                ? 'answered'
                : answerState.kind === 'refused'
                  ? 'refused'
                  : 'error'
          }
          answer={answerState.kind === 'answered' ? answerState.text : undefined}
          chunkOrder={results?.map((r) => r.id) ?? []}
          resultsById={resultsById}
          query={submittedQuery}
          whatsappLink={waLink}
          onCitationClick={handleCitationClick}
        />
      )}

      {results !== null && results.length === 0 && (
        <div className="font-body text-sm flex flex-col gap-2" style={{ color: '#6B6B6B' }}>
          <p>No matches for &ldquo;{submittedQuery}&rdquo;.</p>
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
            <li key={r.id} id={`result-${r.id}`} className="flex flex-col gap-2">
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
