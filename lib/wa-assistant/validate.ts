import type { RuleViolation } from './schema';

type DenylistEntry = {
  pattern: RegExp;
  rule: number;
  reason: string;
};

const DENYLIST: DenylistEntry[] = [
  { pattern: /\bR\s?495\b/i, rule: 3, reason: 'Mentions R495 (paid tier price)' },
  { pattern: /\bR\s?\d{2,}\b/i, rule: 3, reason: 'Mentions a specific Rand amount' },
  { pattern: /\$\s?\d+/, rule: 1, reason: 'Mentions a specific USD amount' },
  { pattern: /£\s?\d+/, rule: 1, reason: 'Mentions a specific GBP amount' },
  { pattern: /€\s?\d+/, rule: 1, reason: 'Mentions a specific EUR amount' },
  { pattern: /\bJohn\b/, rule: 5, reason: 'Mentions "John" — anonymous voice rule' },
  { pattern: /\bPaystack\b/i, rule: 3, reason: 'Mentions Paystack (payment provider)' },
  { pattern: /\bpaid tier\b/i, rule: 3, reason: 'References the paid tier upfront' },
  { pattern: /\bpremium\b/i, rule: 3, reason: 'References "premium" (sounds like pricing)' },
  { pattern: /\bCarnival\b/, rule: 1, reason: 'Mentions Carnival (cruise line)' },
  { pattern: /\bRoyal Caribbean\b/i, rule: 1, reason: 'Mentions Royal Caribbean (cruise line)' },
  { pattern: /\bHilton\b/i, rule: 1, reason: 'Mentions Hilton (hotel group)' },
  { pattern: /\bMarriott\b/i, rule: 1, reason: 'Mentions Marriott (hotel group)' },

  // Country / destination denylist. Hard Rule 1 says no country-by-country
  // requirements — naming a country directly almost always slides into
  // visa/pay/employer specifics, which are paywall content.
  { pattern: /\bUnited Kingdom\b/i, rule: 1, reason: 'Names the UK directly' },
  { pattern: /\bUK\b/, rule: 1, reason: 'Names the UK directly' },
  { pattern: /\bUnited States\b/i, rule: 1, reason: 'Names the USA directly' },
  { pattern: /\bUSA\b/, rule: 1, reason: 'Names the USA directly' },
  { pattern: /\bAustralia\b/i, rule: 1, reason: 'Names Australia directly' },
  { pattern: /\bNew Zealand\b/i, rule: 1, reason: 'Names New Zealand directly' },
  { pattern: /\bSouth Korea\b/i, rule: 1, reason: 'Names South Korea directly' },
  { pattern: /\bKorea\b/i, rule: 1, reason: 'Names Korea directly' },
  { pattern: /\bJapan\b/i, rule: 1, reason: 'Names Japan directly' },
  { pattern: /\bSaudi Arabia\b/i, rule: 1, reason: 'Names Saudi Arabia directly' },
  { pattern: /\bUAE\b/, rule: 1, reason: 'Names the UAE directly' },
  { pattern: /\bDubai\b/i, rule: 1, reason: 'Names Dubai directly' },
  { pattern: /\bGermany\b/i, rule: 1, reason: 'Names Germany directly' },
  { pattern: /\bNetherlands\b/i, rule: 1, reason: 'Names the Netherlands directly' },
  { pattern: /\bIreland\b/i, rule: 1, reason: 'Names Ireland directly' },
  { pattern: /\bCanada\b/i, rule: 1, reason: 'Names Canada directly' },
  { pattern: /\bChina\b/i, rule: 1, reason: 'Names China directly' },
  { pattern: /\bVietnam\b/i, rule: 1, reason: 'Names Vietnam directly' },
  { pattern: /\bThailand\b/i, rule: 1, reason: 'Names Thailand directly' },
];

export function validateDraft(draft: string): RuleViolation[] {
  const violations: RuleViolation[] = [];
  for (const entry of DENYLIST) {
    if (entry.pattern.test(draft)) {
      violations.push({
        rule: entry.rule,
        reason: entry.reason,
        source: 'regex',
      });
    }
  }
  return violations;
}
