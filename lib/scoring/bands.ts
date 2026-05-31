import type { Band } from './types';

/**
 * Canonical user-facing copy for each eligibility band. Single source of truth
 * shared by the dashboard "where you stand" summary and the PDF report template,
 * so the band wording stays identical wherever the buyer sees it.
 */
export const BAND_COPY: Record<Band, { label: string; tagline: string }> = {
  high_blockers: {
    label: 'High blockers',
    tagline: 'Significant gaps to close before applying.',
  },
  needs_prep: {
    label: 'Needs prep',
    tagline: 'Real potential, with clear gaps to address.',
  },
  strong_potential: {
    label: 'Strong potential',
    tagline: "You're application-ready in most respects.",
  },
};
