export const CATEGORIES = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    emoji: '🏥',
    description: 'Nurses, caregivers, medical staff',
    destinations: ['UK', 'AUS', 'IRE', 'UAE'],
  },
  {
    id: 'it-tech',
    label: 'IT / Tech',
    emoji: '💻',
    description: 'Developers, engineers, IT support',
    destinations: ['IRE', 'UK', 'USA', 'AUS'],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    emoji: '⚙️',
    description: 'Civil, mechanical, electrical',
    destinations: ['AUS', 'UK', 'IRE', 'CA', 'UAE'],
  },
  {
    id: 'teaching',
    label: 'Teaching',
    emoji: '📚',
    description: 'Teachers, tutors, education staff',
    destinations: ['UK', 'AUS', 'UAE'],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    emoji: '📊',
    description: 'Accountants, auditors, financial advisors',
    destinations: ['UK', 'AUS', 'IRE', 'CA', 'UAE'],
  },
  {
    id: 'farming',
    label: 'Farming',
    emoji: '🌾',
    description: 'Seasonal farm work',
    destinations: ['UK', 'USA', 'AUS', 'NZ'],
  },
  {
    id: 'seasonal',
    label: 'Carnival / Seasonal',
    emoji: '🎡',
    description: 'J1 visa, amusement, events',
    destinations: ['USA'],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    emoji: '🍽️',
    description: 'Hotels, restaurants, tourism',
    destinations: ['UK', 'UAE', 'AUS', 'EU'],
  },
  {
    id: 'trades',
    label: 'Trades',
    emoji: '🔧',
    description: 'Plumbers, electricians, builders',
    destinations: ['UK', 'AUS', 'CA', 'UAE'],
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '✈️',
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
