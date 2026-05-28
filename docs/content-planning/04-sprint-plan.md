# Sprint Plan — what to publish, in order

Sequenced for **intent diversity** and **de-duplication**, not raw priority rank (the raw
rank is ~20 identical trades pages first — see `01-route-plan.md`). Ship small, measure
in Search Console, expand what gets impressions.

---

## Sprint 0 — Foundations (build once; everything depends on it)

No route pages until these exist.

1. **`/routes/[role]/[country]` route handler** — mirror `/pathways` (see
   `lib/pathway-content.ts`, `app/pathways/[category]/page.tsx`). Drive it from
   `data/routes.csv` + the category map. Centralise the internal-link rules
   (`03-internal-linking.md`) and external-link `target="_blank"` handling.
2. **3 reusable document guides** — `/guides/police-clearance`, `/guides/saqa-evaluation`,
   `/guides/apostille-dirco`. Every route links to these instead of repeating them (DRY).
   Sources in `02-source-map.md §C`.
3. **GEO plumbing** — JSON-LD on the route template: `Article` + `BreadcrumbList` +
   `FAQPage` (use the `JsonLd` component + `seo-schema` skill). **`BreadcrumbList` is
   net-new** — blog/pathways don't emit it yet. Author stays `Organization` (Person
   deferred — decision 2026-05-28). Add `/llms.txt` (root) listing the 11 pillars, the
   published routes, and the trust pages; confirm route URLs land in `app/sitemap.ts` with
   real `lastmod`. AI crawlers are already allowed in `app/robots.ts` (no change needed);
   keep route pages server-rendered.

## Sprint 1 — One flagship route per category (≈9 pages)

Maximum keyword surface, tests which categories pull impressions. All net-new (no blog
duplicates), all `high`-confidence sources except where noted.

| # | Category | Route | Page |
|---|---|---|---|
| 1 | farming | Seasonal Farm Worker → UK | `/routes/seasonal-farm-worker/united-kingdom/` |
| 2 | healthcare | Registered Nurse → Ireland | `/routes/registered-nurse/ireland/` |
| 3 | it-tech | Software Developer → Ireland | `/routes/software-developer/ireland/` |
| 4 | trades | Electrician → Australia | `/routes/electrician/australia/` |
| 5 | tefl | TEFL Teacher → South Korea | `/routes/tefl-teacher/south-korea/` |
| 6 | engineering | Civil Engineer → Australia | `/routes/civil-engineer/australia/` |
| 7 | hospitality | Chef → UAE | `/routes/chef/uae/` |
| 8 | accounting | Accountant → Canada | `/routes/accountant/canada/` |
| 9 | seasonal | Carnival Worker → USA | `/routes/carnival-worker/united-states/` |

**Deliberately deferred from Sprint 1:**
- **au-pair** — its top route (Au Pair/US) is already the `au-pair-in-america` blog. When
  we cover au-pair as a route, use a *non-US* destination (Netherlands / Germany / France
  — `verify` the source first) so we don't cannibalise the blog.
- **teaching** — Teacher/UK is the `teach-in-uk` blog. First teaching *route* should be a
  non-UK destination (e.g. Teacher → UAE or Australia).

## Sprint 2 — Deepen the clusters that worked + add comparisons

After ~3–4 weeks of Search Console data on Sprint 1:

- For each category that got impressions, add its **next 2–3 countries** (e.g. if
  Electrician/Australia moved, add Electrician → Canada, NZ, UK as a trades→destination
  cluster).
- Build the highest-value **comparison pages** (huge GEO citation value). Priority set:
  - `/compare/nursing-uk-vs-ireland-south-africa`
  - `/compare/software-developer-ireland-vs-germany-vs-canada-south-africa`
  - `/compare/trades-australia-vs-canada-south-africa`
  - (Note: `uk-ancestry-visa-vs-skilled-worker-visa` and `nurse-salary-uk-vs-sa` already
    exist as blogs — extend, don't duplicate.)
- Fill the **non-US au-pair** and **non-UK teaching** routes deferred from Sprint 1.

## Sprint 3+ — Scale by evidence

Expand only the clusters earning impressions. The engineering block (33 routes) is the
big reserve — open it per discipline (civil → mechanical → electrical) once the Civil
Engineer/Australia pilot proves the research cost is worth it. Resolve all `verify`
sources before their pages ship.

## Existing blog inventory (canonical — do not duplicate)

`au-pair-in-america-from-south-africa` · `best-countries-south-africans-work-abroad` ·
`document-checklist-working-abroad-south-africa` · `it-jobs-abroad-from-south-africa` ·
`nurse-salary-uk-vs-south-africa` · `nursing-jobs-uk-from-south-africa` ·
`teach-in-uk-from-south-africa` · `uk-ancestry-visa-vs-skilled-worker-visa` ·
`work-abroad-recruitment-scams-south-africa` · `work-abroad-without-a-degree-south-africa`

Each of these should pick up 3–8 down-links to relevant new route pages as they publish
(`03-internal-linking.md`).

## Definition of done (per page)

A page is publishable only when it passes **`05-editorial-geo-standard.md`** in full:
verified official source, all template sections filled with real SA-specific data,
scam passage, schema, internal links, CTA, `last_verified` date. Then run
`npm run reindex -- --category=<cat>` if the route content feeds the RAG corpus.
