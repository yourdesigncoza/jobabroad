const COUNTRIES = [
  {
    flag: '🇬🇧',
    name: 'United Kingdom',
    stat: '39,000+',
    label: 'NHS vacancies open right now',
    detail: 'SA nurses up 4× in 4 years — £28K–£60K starting',
    roles: ['Nurses', 'Teachers', 'Seasonal', 'Trades'],
    source: 'NHS England / NMC',
  },
  {
    flag: '🇮🇪',
    name: 'Ireland',
    stat: '1,631',
    label: 'SA critical skills permits in 2024',
    detail: 'SA is 6th largest source globally — Google & Amazon both hiring',
    roles: ['IT & Tech', 'Engineering', 'Finance', 'Healthcare'],
    source: 'Dept. Enterprise Ireland',
  },
  {
    flag: '🇩🇪',
    name: 'Germany',
    stat: '639,000',
    label: 'open job vacancies (Feb 2025)',
    detail: 'Opportunity Card launched — 11,497 issued in first year',
    roles: ['Engineering', 'IT', 'Healthcare', 'Trades'],
    source: 'German Economic Institute (IW)',
  },
  {
    flag: '🇦🇺',
    name: 'Australia',
    stat: '456 roles',
    label: 'on the Core Skills Occupation List',
    detail: 'SA engineers fast-tracked via Sydney & Dublin Accord',
    roles: ['Healthcare', 'Engineering', 'Farming', 'IT'],
    source: 'Home Affairs Australia',
  },
  {
    flag: '🇦🇪',
    name: 'UAE',
    stat: 'Year-round',
    label: 'expat demand in 5+ sectors',
    detail: 'Dubai & Abu Dhabi — healthcare, hospitality & finance hubs',
    roles: ['Hospitality', 'Healthcare', 'Finance', 'Trades'],
    source: 'UAE Ministry of HR',
  },
  {
    flag: '🇨🇦',
    name: 'Canada',
    stat: '48,000+',
    label: 'SAICA members eligible for CPA Canada',
    detail: 'Mutual recognition agreement — no full re-qualification',
    roles: ['Accounting', 'Engineering', 'IT', 'Healthcare'],
    source: 'SAICA / CPA Canada MRA',
  },
  {
    flag: '🇳🇿',
    name: 'New Zealand',
    stat: '70,000+',
    label: 'South Africans already living there',
    detail: 'Green List: nurses & engineers go straight to residence',
    roles: ['Nursing', 'Engineering', 'Farming', 'IT'],
    source: 'UN DESA / Immigration NZ',
  },
  {
    flag: '🇺🇸',
    name: 'United States',
    stat: 'J1 Visa',
    label: 'seasonal & exchange work every year',
    detail: 'Farm work, carnival, summer camps — legal & structured',
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
              Verified demand
            </span>
          </div>
          <h2
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#2C2C2C' }}
          >
            Where South Africans<br className="hidden sm:block" /> are working right now.
          </h2>
          <p
            className="font-body text-sm max-w-lg mt-2"
            style={{ color: '#6B6B6B' }}
          >
            Real programmes. Real numbers. Every country below has an active, legal
            route available to South Africans today — backed by official sources.
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
              {/* Flag + country */}
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

              {/* Divider */}
              <div className="h-px w-full" style={{ backgroundColor: '#EDE8E0' }} />

              {/* Stat */}
              <div>
                <p
                  className="font-display font-bold leading-none"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    color: '#1B4D3E',
                  }}
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
              <div className="flex flex-wrap gap-1 mt-auto pt-3" style={{ borderTop: '1px solid #EDE8E0' }}>
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
                style={{ fontSize: '13px', color: '#B0B0B0' }}
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
