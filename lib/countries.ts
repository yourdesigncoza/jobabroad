/**
 * Canonical country names + alias map. Two-sided normaliser:
 *
 *   Assessment side uses labels like "UK", "Australia / NZ", "Qatar / Oman / Kuwait",
 *   "USA (J-1 Au Pair)". Partner/vault side uses "United Kingdom", "australia",
 *   "new_zealand", "UAE / Dubai", and broad tokens like "Global", "Middle East",
 *   "remote", "Open".
 *
 *   Both get normalised to a small set of canonical kebab-case names so partner
 *   ↔ buyer matching is a plain set intersection.
 *
 * Wildcards (Open / Global / international / Other) collapse to a special
 * "*" token; matching short-circuits if either side carries it.
 */

const WILDCARD = '*';

/** Canonical name → list of aliases (lowercased, trimmed before lookup). */
const ALIASES: Record<string, string[]> = {
  'australia': ['australia', 'aus', 'au'],
  'new-zealand': ['new zealand', 'new_zealand', 'nz', 'new zealand (unconfirmed)'],
  'united-kingdom': ['united kingdom', 'uk', 'britain', 'great britain'],
  'ireland': ['ireland'],
  'canada': ['canada', 'ca'],
  'usa': ['usa', 'united states', 'united states of america', 'us', 'america'],
  'germany': ['germany', 'deutschland'],
  'netherlands': ['netherlands', 'holland'],
  'france': ['france'],
  'belgium': ['belgium'],
  'denmark': ['denmark'],
  'spain': ['spain'],
  'uae': ['uae', 'united arab emirates', 'dubai', 'abu dhabi'],
  'saudi-arabia': ['saudi arabia', 'saudi', 'ksa'],
  'qatar': ['qatar'],
  'oman': ['oman'],
  'kuwait': ['kuwait'],
  'china': ['china', 'prc'],
  'hong-kong': ['hong kong', 'hk'],
  'vietnam': ['vietnam'],
  'thailand': ['thailand'],
  'south-korea': ['south korea', 'korea', 'republic of korea'],
  'japan': ['japan'],
  'cambodia': ['cambodia'],
  'laos': ['laos'],
  'myanmar': ['myanmar', 'burma'],
  'philippines': ['philippines'],
  'south-africa': ['south africa', 'south africa (inbound)', 'rsa'],
};

const WILDCARD_TOKENS: Set<string> = new Set([
  'global',
  'international',
  'open',
  'open to recommendations',
  'other',
  'other asia',
  'middle east',
  'remote',
  'cruise ship',
  'worldwide',
]);

/** Built once at module load: alias-string → canonical-name. */
const ALIAS_INDEX: Map<string, string> = new Map();
for (const [canonical, aliases] of Object.entries(ALIASES)) {
  ALIAS_INDEX.set(canonical, canonical);
  for (const alias of aliases) ALIAS_INDEX.set(alias.toLowerCase(), canonical);
}

/**
 * Strips parenthetical context, splits compound labels on " / ", and
 * canonicalises each fragment. Unknown fragments are silently dropped.
 *
 *   "UK"                      → ["united-kingdom"]
 *   "Australia / NZ"          → ["australia", "new-zealand"]
 *   "USA (J-1 Au Pair)"       → ["usa"]
 *   "Qatar / Oman / Kuwait"   → ["qatar", "oman", "kuwait"]
 *   "Global"                  → ["*"]
 *   "Atlantis"                → []
 */
export function toCanonicalCountries(label: string): string[] {
  if (!label) return [];
  const cleaned = label.replace(/\([^)]*\)/g, '').trim().toLowerCase();
  if (!cleaned) return [];
  const fragments = cleaned.split(/\s*\/\s*/).map((f) => f.trim()).filter(Boolean);
  const out = new Set<string>();
  for (const frag of fragments) {
    if (WILDCARD_TOKENS.has(frag)) {
      out.add(WILDCARD);
      continue;
    }
    const canonical = ALIAS_INDEX.get(frag);
    if (canonical) out.add(canonical);
  }
  return [...out];
}

/** Canonicalise a list, collapsing wildcards into a single "*". */
export function canonicaliseList(labels: string[]): Set<string> {
  const out = new Set<string>();
  for (const l of labels) for (const c of toCanonicalCountries(l)) out.add(c);
  return out;
}

/**
 * True if the partner can serve at least one of the buyer's chosen destinations.
 * Wildcards on either side short-circuit to true.
 */
export function destinationsMatch(partnerLabels: string[], buyerLabels: string[]): boolean {
  const partner = canonicaliseList(partnerLabels);
  const buyer = canonicaliseList(buyerLabels);
  if (partner.size === 0 || buyer.size === 0) return false;
  if (partner.has(WILDCARD) || buyer.has(WILDCARD)) return true;
  for (const c of partner) if (buyer.has(c)) return true;
  return false;
}
