export const CATEGORIES = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    emoji: '🏥',
    audience: 'South African registered nurses',
    description: 'Nurses, caregivers, medical staff',
    destinations: ['UK', 'AUS', 'IRE', 'UAE'],
  },
  {
    id: 'it-tech',
    label: 'IT / Tech',
    emoji: '💻',
    audience: 'South African IT and tech professionals',
    description: 'Developers, engineers, IT support',
    destinations: ['IRE', 'UK', 'USA', 'AUS'],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    emoji: '⚙️',
    audience: 'South African engineers',
    description: 'Civil, mechanical, electrical',
    destinations: ['AUS', 'UK', 'IRE', 'CA', 'UAE'],
  },
  {
    id: 'teaching',
    label: 'Teaching',
    emoji: '📚',
    audience: 'South African teachers',
    description: 'Teachers, tutors, education staff',
    destinations: ['UK', 'AUS', 'UAE'],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    emoji: '📊',
    audience: 'South African accountants and finance professionals',
    description: 'Accountants, auditors, financial advisors',
    destinations: ['UK', 'AUS', 'IRE', 'CA', 'UAE'],
  },
  {
    id: 'farming',
    label: 'Farming',
    emoji: '🌾',
    audience: 'South African farm workers',
    description: 'Seasonal farm work',
    destinations: ['UK', 'USA', 'AUS', 'NZ'],
  },
  {
    id: 'seasonal',
    label: 'Carnival / Seasonal',
    emoji: '🎡',
    audience: 'South African students and workers exploring seasonal work-abroad options',
    description: 'J1 visa, amusement, events',
    destinations: ['USA'],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    emoji: '🍽️',
    audience: 'South African hospitality workers',
    description: 'Hotels, restaurants, tourism',
    destinations: ['UK', 'UAE', 'AUS', 'EU'],
  },
  {
    id: 'trades',
    label: 'Trades',
    emoji: '🔧',
    audience: 'South African qualified tradespeople',
    description: 'Plumbers, electricians, builders',
    destinations: ['UK', 'AUS', 'CA', 'UAE'],
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '✈️',
    audience: 'South African work-abroad applicants',
    description: 'Something else? Tell us',
    destinations: ['Worldwide'],
  },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export function buildWhatsAppLink(categoryLabel: string, source?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent(
    `Hi, I'm interested in ${categoryLabel} work abroad. Can you help me?`
  );
  const src = source ? `&utm_source=${encodeURIComponent(source)}` : '';
  return `https://wa.me/${phone}?text=${message}${src}`;
}
