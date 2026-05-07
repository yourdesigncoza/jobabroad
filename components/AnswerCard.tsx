'use client';

import { Fragment } from 'react';

interface CitationTarget {
  id: number;
  source_type: 'guide' | 'wiki';
  heading: string;
  anchor: string | null;
}

interface Props {
  state: 'loading' | 'answered' | 'refused' | 'error';
  answer?: string;
  chunkOrder?: number[];
  resultsById?: Map<number, CitationTarget>;
  query: string;
  whatsappLink: string;
  onCitationClick?: (id: number) => void;
}

export default function AnswerCard({
  state,
  answer,
  chunkOrder = [],
  resultsById,
  whatsappLink,
  onCitationClick,
}: Props) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#F8F5F0', border: '1.5px solid #EDE8E0' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="font-display text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
        >
          Answer
        </span>
        {state === 'loading' && (
          <span className="font-body text-xs" style={{ color: '#6B6B6B' }}>
            Generating answer…
          </span>
        )}
      </div>

      {state === 'loading' && (
        <div className="flex flex-col gap-2">
          <div className="h-3 rounded animate-pulse" style={{ backgroundColor: '#EDE8E0', width: '90%' }} />
          <div className="h-3 rounded animate-pulse" style={{ backgroundColor: '#EDE8E0', width: '75%' }} />
          <div className="h-3 rounded animate-pulse" style={{ backgroundColor: '#EDE8E0', width: '60%' }} />
        </div>
      )}

      {state === 'answered' && answer && (
        <AnswerBody
          answer={answer}
          chunkOrder={chunkOrder}
          resultsById={resultsById}
          onCitationClick={onCitationClick}
        />
      )}

      {state === 'refused' && (
        <div className="flex flex-col gap-2">
          <p className="font-body text-sm" style={{ color: '#2C2C2C' }}>
            We don&rsquo;t have a confident answer for that in your guide. Message us on WhatsApp and we&rsquo;ll get back to you directly.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-bold uppercase text-xs tracking-wide self-start px-4 py-2 rounded-full"
            style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
          >
            WhatsApp us
          </a>
        </div>
      )}

      {state === 'error' && (
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          We couldn&rsquo;t generate a summary right now — the search results below still contain the relevant sections.
        </p>
      )}
    </div>
  );
}

function AnswerBody({
  answer,
  chunkOrder,
  resultsById,
  onCitationClick,
}: {
  answer: string;
  chunkOrder: number[];
  resultsById?: Map<number, CitationTarget>;
  onCitationClick?: (id: number) => void;
}) {
  const normalised = answer.replace(/\](\s*)\[/g, '] [');
  const paragraphs = normalised.split(/\n\n+/);

  const renderParagraph = (paragraph: string, key: number) => {
    const parts = paragraph.split(/(\[\d+\])/g);
    return (
      <p key={key} className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
        {parts.map((part, i) => {
          const m = part.match(/^\[(\d+)\]$/);
          if (!m) return <Fragment key={i}>{part}</Fragment>;
          const n = parseInt(m[1], 10);
          const id = chunkOrder[n - 1];
          const target = id !== undefined ? resultsById?.get(id) : undefined;
          if (!target) {
            return (
              <span key={i} style={{ color: '#6B6B6B' }}>
                [{n}]
              </span>
            );
          }
          return (
            <CitationChip
              key={i}
              n={n}
              target={target}
              onClick={() => onCitationClick?.(target.id)}
            />
          );
        })}
      </p>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {paragraphs.map((p, i) => renderParagraph(p, i))}
    </div>
  );
}

function CitationChip({
  n,
  target,
  onClick,
}: {
  n: number;
  target: CitationTarget;
  onClick: () => void;
}) {
  if (target.source_type === 'guide' && target.anchor) {
    return (
      <a
        href={`#${target.anchor}`}
        title={target.heading}
        className="inline-flex items-center justify-center font-display text-[0.7rem] font-bold rounded-full mx-0.5 px-1.5 align-baseline no-underline"
        style={{
          backgroundColor: '#1B4D3E',
          color: '#F8F5F0',
          minWidth: '1.25rem',
          height: '1.25rem',
        }}
      >
        {n}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={target.heading}
      className="inline-flex items-center justify-center font-display text-[0.7rem] font-bold rounded-full mx-0.5 px-1.5 align-baseline"
      style={{
        backgroundColor: '#C9A84C',
        color: '#F8F5F0',
        minWidth: '1.25rem',
        height: '1.25rem',
      }}
    >
      {n}
    </button>
  );
}
