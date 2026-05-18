import { recruiters as ALL, type Recruiter } from './outreach-data';
import {
  TRUSTED_PARTNER_META,
  TRUSTED_PARTNER_NAMES,
  type ServiceKind,
  type TrustedPartnerMeta,
} from './trusted-partners';
import { CATEGORIES, type CategoryId } from './categories';
import { destinationsMatch } from './countries';

export type RecruiterWithFlags = Recruiter & {
  trusted: boolean;
  serviceKind?: ServiceKind;
  trustedBullets?: string[];
};

/**
 * Normalises a category string so "IT/Tech", "IT / Tech", and "it-tech" all
 * compare equal. Matches across the outreach-data labels and the kebab-case
 * CategoryId values used elsewhere in the app.
 */
function normaliseCategory(s: string): string {
  return s.toLowerCase().replace(/[\s/\-]+/g, '');
}

function categoryMatches(r: Recruiter, target: CategoryId): boolean {
  const targetNorm = normaliseCategory(target);
  const labelNorm = normaliseCategory(
    CATEGORIES.find((c) => c.id === target)?.label ?? target,
  );
  return r.categories.some((c) => {
    const n = normaliseCategory(c);
    return n === targetNorm || n === labelNorm;
  });
}

function withMeta(r: Recruiter): RecruiterWithFlags {
  const meta: TrustedPartnerMeta | undefined = TRUSTED_PARTNER_META.get(r.name);
  return {
    ...r,
    trusted: TRUSTED_PARTNER_NAMES.has(r.name),
    serviceKind: meta?.serviceKind,
    trustedBullets: meta?.bullets,
  };
}

export function getAllRecruiters(): RecruiterWithFlags[] {
  return ALL.map(withMeta);
}

/**
 * Returns ONLY trusted partners, optionally narrowed to a category. Recruiters
 * are filtered by category; cross-cutting service providers (documents, banking,
 * etc.) are returned regardless of category.
 *
 * Use this on the public /recruiters page where the buyer's destinations are
 * unknown. For PDF report matching that knows the buyer's destinations, prefer
 * `getTrustedPartnersForBuyer`.
 */
export function getTrustedRecruiters(category?: CategoryId): RecruiterWithFlags[] {
  return getAllRecruiters().filter((r) => {
    if (!r.trusted) return false;
    if (!category) return true;
    // Recruiters honour the category filter; other service kinds bypass it.
    if (r.serviceKind === 'recruiter' || !r.serviceKind) {
      return categoryMatches(r, category);
    }
    return true;
  });
}

export interface BuyerSignals {
  category: CategoryId;
  /**
   * Raw assessment labels — e.g. ["UK", "Australia / NZ"]. Will be normalised
   * via lib/countries.ts before matching against partner destinations.
   */
  targetDestinations: string[];
}

/**
 * Buyer-aware trusted-partner match for PDF reports. Each partner must:
 *
 *   - be flagged trusted, AND
 *   - serve at least one of the buyer's target destinations
 *     (via canonical-country set intersection — wildcards on either side
 *      short-circuit), AND
 *   - if serviceKind === 'recruiter', also match the buyer's category.
 *     Cross-cutting kinds (documents, english-test, banking, etc.) are
 *     category-agnostic.
 */
export function getTrustedPartnersForBuyer(signals: BuyerSignals): RecruiterWithFlags[] {
  return getAllRecruiters().filter((r) => {
    if (!r.trusted) return false;
    if (!destinationsMatch(r.destinations, signals.targetDestinations)) return false;
    if (r.serviceKind === 'recruiter' || !r.serviceKind) {
      return categoryMatches(r, signals.category);
    }
    return true;
  });
}
