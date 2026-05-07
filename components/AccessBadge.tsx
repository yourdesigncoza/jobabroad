import { PAYSHAP } from '@/lib/payshap';

const issuedFormatter = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function AccessBadge({
  token,
  categoryLabel,
  createdAt,
}: {
  token: string;
  categoryLabel: string;
  createdAt: string | null;
}) {
  const issued = createdAt ? issuedFormatter.format(new Date(createdAt)) : '—';
  const tokenPreview = `${token.slice(0, 8)}…`;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <span
        className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1 font-display font-bold uppercase text-xs tracking-wide"
        style={{ backgroundColor: '#EDE8E0', color: '#1B4D3E' }}
      >
        <span aria-hidden>✓</span>
        Access active
      </span>

      <details className="font-body text-xs sm:text-right" style={{ color: '#6B6B6B' }}>
        <summary className="cursor-pointer select-none font-semibold" style={{ color: '#1B4D3E' }}>
          Access &amp; Payment Reference
        </summary>
        <dl
          className="mt-3 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-left"
          style={{ color: '#2C2C2C' }}
        >
          <dt className="font-semibold" style={{ color: '#6B6B6B' }}>PayShap proxy</dt>
          <dd>{PAYSHAP.proxy}</dd>

          <dt className="font-semibold" style={{ color: '#6B6B6B' }}>Receiver</dt>
          <dd>{PAYSHAP.name}</dd>

          <dt className="font-semibold" style={{ color: '#6B6B6B' }}>Amount</dt>
          <dd>{PAYSHAP.amount}</dd>

          <dt className="font-semibold" style={{ color: '#6B6B6B' }}>Reference format</dt>
          <dd>[Your name] — {categoryLabel}</dd>

          <dt className="font-semibold" style={{ color: '#6B6B6B' }}>Access link issued</dt>
          <dd>{issued}</dd>

          <dt className="font-semibold" style={{ color: '#6B6B6B' }}>Token</dt>
          <dd className="font-mono">{tokenPreview}</dd>
        </dl>
      </details>
    </div>
  );
}
