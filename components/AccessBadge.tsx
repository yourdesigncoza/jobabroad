import type { ReactNode } from 'react';

const issuedFormatter = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function AccessBadge({
  categoryLabel,
  createdAt,
  children,
}: {
  /**
   * Identifier kept in the prop signature for backwards compatibility with
   * existing callers; not rendered.
   */
  token?: string;
  categoryLabel: string;
  createdAt: string | null;
  children?: ReactNode;
}) {
  const issued = createdAt ? issuedFormatter.format(new Date(createdAt)) : '—';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
    >
      <div style={{ height: 3, backgroundColor: '#C9A84C' }} aria-hidden />

      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span
          className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1 font-display font-bold uppercase text-xs tracking-wide"
          style={{ backgroundColor: '#EDE8E0', color: '#1B4D3E' }}
        >
          <span aria-hidden>✓</span>
          Access active
        </span>

        <p className="font-body text-xs sm:text-right" style={{ color: '#6B6B6B' }}>
          {categoryLabel} guide · unlocked {issued}
        </p>
      </div>

      {children && (
        <>
          <div style={{ height: 1, backgroundColor: '#EDE8E0' }} aria-hidden />
          <div className="px-5 py-4">{children}</div>
        </>
      )}
    </div>
  );
}
