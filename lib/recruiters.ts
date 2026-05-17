import { recruiters as ALL, type Recruiter } from './outreach-data';
import { PREMIUM_PARTNER_NAMES } from './premium-partners';
import { CATEGORIES, type CategoryId } from './categories';

export type RecruiterWithFlags = Recruiter & { premium: boolean };

/**
 * Normalises a category string so "IT/Tech", "IT / Tech", and "it-tech" all
 * compare equal. Matches across the outreach-data labels and the kebab-case
 * CategoryId values used elsewhere in the app.
 */
function normaliseCategory(s: string): string {
  return s.toLowerCase().replace(/[\s/\-]+/g, '');
}

export function getAllRecruiters(): RecruiterWithFlags[] {
  return ALL.map((r) => ({ ...r, premium: PREMIUM_PARTNER_NAMES.has(r.name) }));
}

/**
 * Returns ONLY premium partners, optionally narrowed to a category. Pass a
 * CategoryId (kebab-case) — we resolve to the matching label and normalise
 * both sides so the outreach-data label format ("IT/Tech") matches.
 */
export function getPremiumRecruiters(category?: CategoryId): RecruiterWithFlags[] {
  const target = category ? normaliseCategory(category) : null;
  const labelTarget = category
    ? normaliseCategory(CATEGORIES.find((c) => c.id === category)?.label ?? category)
    : null;
  return getAllRecruiters().filter((r) => {
    if (!r.premium) return false;
    if (!target) return true;
    return r.categories.some((c) => {
      const n = normaliseCategory(c);
      return n === target || n === labelTarget;
    });
  });
}
