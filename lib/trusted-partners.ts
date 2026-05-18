// Hand-curated overlay of trusted partners — recruiters/agencies/service
// providers paying a monthly retainer to be surfaced as "Trusted partner" on
// /recruiters and inside R495 PDF reports. Names MUST match `Recruiter.name`
// in lib/outreach-data.ts exactly (case-sensitive).
//
// lib/outreach-data.ts is auto-regenerated from the wiki vaults, so we cannot
// mutate it directly without losing the metadata on the next regen. This
// overlay is the source of truth for trusted status until partner count grows
// past ~15 and we lift it to Supabase + a self-serve form.
//
// To mark a partner trusted: add an entry to TRUSTED_PARTNER_META with their
// exact `name` and a `serviceKind` so the report-matching logic can route
// them to the right buyers.

/**
 * What the partner sells. Drives whether they're filtered by buyer category:
 *
 *   recruiter        → category match AND destinations overlap
 *   everything else  → destinations overlap only (cross-category)
 */
export type ServiceKind =
  | 'documents'         // apostilles, notarisations, certifications (e.g. Apostil.co.za)
  | 'recruiter'         // category-specific placement agencies
  | 'english-test'      // IELTS, OET, TOEFL booking & prep
  | 'visa-consultant'   // immigration / visa lodgement
  | 'banking'           // SA-friendly offshore banking
  | 'currency';         // FX / remittance providers

export interface TrustedPartnerMeta {
  serviceKind: ServiceKind;
  /** Optional 1-3 short value bullets surfaced beneath the partner name in reports. */
  bullets?: string[];
}

export const TRUSTED_PARTNER_META: ReadonlyMap<string, TrustedPartnerMeta> = new Map([
  ['Apostil.co.za', {
    serviceKind: 'documents',
    bullets: [
      'DIRCO-registered agent — 1–2 week turnaround vs 3–4 week public courier wait',
      'Apostilles, notarisations, authentications for use abroad',
    ],
  } satisfies TrustedPartnerMeta],
]);

/** Backwards-compat helper for code that only needs to know "is X trusted?". */
export const TRUSTED_PARTNER_NAMES: ReadonlySet<string> = new Set(TRUSTED_PARTNER_META.keys());
