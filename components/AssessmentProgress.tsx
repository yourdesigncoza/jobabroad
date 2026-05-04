interface Props {
  current: number; // 1-based
  total: number;
  label: string;
}

export default function AssessmentProgress({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-display font-bold uppercase tracking-wide text-xs" style={{ color: '#2C2C2C' }}>
          {label}
        </span>
        <span className="font-body text-xs" style={{ color: '#6B6B6B' }}>
          Step {current} of {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#EDE8E0' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: '#C9A84C' }}
        />
      </div>
    </div>
  );
}
