const STATS = [
  { value: '74', unit: 'per day', label: 'South Africans leaving SA', source: 'IOL / Remitly 2025' },
  { value: '914,000+', unit: '', label: 'SA citizens already working abroad', source: 'UN DESA 2020' },
  { value: '27%', unit: '', label: 'of SA adults considering emigration', source: 'Afrobarometer 2024' },
] as const;

export default function StatStrip() {
  return (
    <section style={{ backgroundColor: '#2C2C2C' }} className="px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x sm:divide-white/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 sm:px-8 first:pl-0 last:pr-0">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display font-bold leading-none"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#C9A84C' }}
                >
                  {stat.value}
                </span>
                {stat.unit && (
                  <span
                    className="font-display font-semibold uppercase text-xs tracking-wider"
                    style={{ color: '#C9A84C' }}
                  >
                    {stat.unit}
                  </span>
                )}
              </div>
              <p className="font-body text-sm leading-snug" style={{ color: '#F8F5F0' }}>
                {stat.label}
              </p>
              <p className="font-body" style={{ fontSize: '13px', color: 'rgba(248,245,240,0.4)' }}>
                Source: {stat.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
