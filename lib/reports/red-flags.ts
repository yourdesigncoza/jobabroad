import type { CategoryId } from '@/lib/categories';

/**
 * Hand-maintained category-specific scam / fraud patterns surfaced inside the
 * paid PDF report so buyers see them without leaving the document. Source of
 * truth for now is this file — tracked in git, reviewed in PR. If/when
 * non-developers need to edit these, migrate to content/red-flags/*.json
 * (see GEMINI_REVIEW.md decision #10).
 *
 * Rules of thumb when curating:
 * - Each bullet is one specific pattern, not a vague warning.
 * - Phrase as the behaviour to AVOID, not the behaviour to do ("Don't pay
 *   placement fees" beats "Verify the recruiter").
 * - 4-6 bullets per category — more than that and readers skim past.
 * - Keep wording legally cautious (no naming specific bad actors here; the
 *   /scam-warnings page handles that surface separately).
 */
const RED_FLAGS: Partial<Record<CategoryId, string[]>> = {
  teaching: [
    'Upfront placement fees of any kind — legitimate UK/UAE/AUS schools pay the recruiter, not you',
    'Recruiters who don\'t help you register with SACE, NMC, AHPRA or the destination\'s equivalent regulator',
    'Contracts not provided in English, or with key clauses (salary, hours, notice period) left vague',
    'Employers who hold your passport "for safekeeping" once you arrive — this is illegal in most destinations',
    'Salary paid in cash with no payslip — you need a paper trail for visa renewals and tax compliance',
    'Pressure to sign or pay within 24-48 hours "before someone else takes the spot"',
  ],
};

export function getRedFlagsForCategory(category: CategoryId): string[] {
  return RED_FLAGS[category] ?? [];
}
