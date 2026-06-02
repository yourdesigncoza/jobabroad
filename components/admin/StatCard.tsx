/**
 * Shared admin metric tile. Big green number + uppercase label, optional hint
 * line underneath. Used by the members dashboard and the funnel dashboard.
 */
export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <span className="font-display font-bold text-3xl" style={{ color: '#1B4D3E' }}>
        {value}
      </span>
      <span
        className="font-display text-[0.65rem] font-semibold uppercase tracking-wider"
        style={{ color: '#6B6B6B' }}
      >
        {label}
      </span>
      {hint ? (
        <span className="font-body text-xs" style={{ color: '#6B6B6B' }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
