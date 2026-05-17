// Hand-curated set of premium partners — recruiters/agencies paying a monthly
// retainer to be surfaced to R495 users. Names MUST match `Recruiter.name` in
// lib/outreach-data.ts exactly (case-sensitive).
//
// lib/outreach-data.ts is auto-regenerated from the wiki vaults, so we cannot
// mutate it directly without losing the flag on the next regen. This overlay
// is the source of truth for premium status until the data moves to Supabase.
//
// To mark a partner premium: add their exact `name` string to PREMIUM_PARTNER_NAMES.

export const PREMIUM_PARTNER_NAMES: ReadonlySet<string> = new Set<string>([
  // 'Engage Education',
  "Apostil.co.za",
]);
