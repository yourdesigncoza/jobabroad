const COUNTRIES = [
  {
    flag: '🇬🇧',
    name: 'United Kingdom',
    stat: '39,000+',
    label: 'NHS vacancies open right now',
    detail: 'SA nurse registrations have quadrupled in 4 years — £28K–£60K starting',
    roles: ['Nurses', 'Teachers', 'Seasonal', 'Trades'],
    source: 'NHS England / NMC',
    popular: true,
  },
  {
    flag: '🇮🇪',
    name: 'Ireland',
    stat: '1,631',
    label: 'SA critical skills permits in 2024',
    detail: 'SA is among the top source countries globally. IT, engineering and healthcare are in demand.',
    roles: ['IT & Tech', 'Engineering', 'Healthcare'],
    source: 'Dept. Enterprise Ireland',
    popular: true,
  },
  {
    flag: '🇩🇪',
    name: 'Germany',
    stat: '639,000',
    label: 'open job vacancies (Feb 2025)',
    detail: 'Opportunity Card launched — over 11,000 issued in its first year',
    roles: ['Engineering', 'IT', 'Healthcare', 'Trades'],
    source: 'German Economic Institute (IW)',
  },
  {
    flag: '🇦🇺',
    name: 'Australia',
    stat: '456 roles',
    label: 'on the Core Skills Occupation List',
    detail: 'Several routes are open to SA applicants in healthcare, engineering and trades.',
    roles: ['Healthcare', 'Engineering', 'Farming', 'IT'],
    source: 'Home Affairs Australia',
    popular: true,
  },
  {
    flag: '🇦🇪',
    name: 'UAE',
    stat: 'Year-round',
    label: 'expat demand in 5+ sectors',
    detail: 'Dubai & Abu Dhabi — healthcare, hospitality & trades hubs',
    roles: ['Hospitality', 'Healthcare', 'Trades'],
    source: 'UAE Ministry of HR',
  },
  {
    flag: '🇨🇦',
    name: 'Canada',
    stat: '48,000+',
    label: 'SAICA members eligible for CPA Canada',
    detail: 'Mutual recognition agreement — credential assessment varies by province',
    roles: ['Accounting', 'Engineering', 'IT', 'Healthcare'],
    source: 'SAICA / CPA Canada MRA',
  },
  {
    flag: '🇳🇿',
    name: 'New Zealand',
    stat: '70,000+',
    label: 'South Africans already living there',
    detail: 'Green List: nurses & engineers may qualify for faster residence — if requirements are met',
    roles: ['Nursing', 'Engineering', 'Farming', 'IT'],
    source: 'UN DESA / Immigration NZ',
  },
  {
    flag: '🇺🇸',
    name: 'United States',
    stat: 'J1 Visa',
    label: 'seasonal & exchange work every year',
    detail: 'Farm work, carnival, summer camps — legal route for eligible young South Africans',
    roles: ['Farm work', 'Carnival', 'Hospitality', 'Camps'],
    source: 'US State Department',
  },
] as const;

export default function CountryStats() {
  return (
    <section style={{ backgroundColor: '#FFFFFF' }} className="px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#C9A84C' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#C9A84C' }}
            >
              Real demand
            </span>
          </div>
          <h2
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#2C2C2C' }}
          >
            Where South Africans<br className="hidden sm:block" /> are finding work abroad.
          </h2>
          <p
            className="font-body text-sm max-w-lg mt-2"
            style={{ color: '#6B6B6B' }}
          >
            These countries have legal work or migration routes South Africans commonly explore. Always check official requirements before applying or paying anyone.
          </p>
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COUNTRIES.map((country) => (
            <div
              key={country.name}
              className="country-stat-card flex flex-col gap-3 p-5 rounded-2xl transition-all duration-200"
              style={{
                backgroundColor: '#F8F5F0',
                border: '1.5px solid #EDE8E0',
              }}
            >
              {/* Flag + country + popular badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-4xl leading-none select-none"
                    role="img"
                    aria-label={country.name}
                  >
                    {country.flag}
                  </span>
                  <span
                    className="font-display font-semibold uppercase text-xs tracking-wider leading-tight"
                    style={{ color: '#6B6B6B' }}
                  >
                    {country.name}
                  </span>
                </div>
                {country.popular && (
                  <span
                    className="font-display font-bold uppercase text-[0.55rem] tracking-wide px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: '#ff751f', color: '#FFFFFF' }}
                  >
                    Most Popular
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px w-full" style={{ backgroundColor: '#EDE8E0' }} />

              {/* Stat */}
              <div>
                <p
                  className="font-display font-bold leading-none"
                  style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#1B4D3E' }}
                >
                  {country.stat}
                </p>
                <p
                  className="font-body font-medium text-xs mt-1"
                  style={{ color: '#2C2C2C' }}
                >
                  {country.label}
                </p>
                <p
                  className="font-body text-xs mt-1 leading-snug"
                  style={{ color: '#6B6B6B' }}
                >
                  {country.detail}
                </p>
              </div>

              {/* Role tags */}
              <div className="flex flex-wrap gap-1 mt-auto pt-3" style={{ borderTop: '1px solid #EDE8E0', minHeight: '56px', alignItems: 'flex-start' }}>
                {country.roles.map((role) => (
                  <span
                    key={role}
                    className="font-body px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(27,77,62,0.08)',
                      color: '#1B4D3E',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>

              {/* Source */}
              <p
                className="font-body"
                style={{ fontSize: '11px', color: '#B0B0B0' }}
              >
                Source: {country.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
