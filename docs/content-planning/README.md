# Content Planning — Jobabroad GEO/SEO

This folder is the operating plan for growing jobabroad.co.za's organic + AI-search
visibility. It takes the raw ChatGPT PSEO pack (route ideas + templates) as a starting
point, fixes its data, and turns it into a structure we can actually publish against.

Source of the raw ideas: `/home/laudes/zoot/Alt_Downloads/jobabroad_pseo_content_pack/`
(a 120-route spreadsheet + 5 markdown templates). We extracted, corrected, and
re-architected it here. Do **not** publish straight from the original pack — its source
URLs were buggy (see `02-source-map.md`).

## Read in this order

1. **`00-geo-strategy.md`** — the master plan: the 5-layer information architecture,
   the GEO principles every page must follow, and how route pages relate to the
   existing `/pathways` and `/blog` layers (incl. the de-duplication rule).
2. **`01-route-plan.md`** — the cleaned 120-route database, mapped to our 11 real
   category slugs, with priority and known data issues.
3. **`02-source-map.md`** — the canonical official-source URL per country + the
   profession regulators + SA-side document sources. 7 routes flagged "verify".
4. **`03-internal-linking.md`** — the link matrix between layers (the thing that makes
   PSEO work instead of bloating the index).
5. **`04-sprint-plan.md`** — the operating queue: exactly what to write next, in order,
   de-duped against the 10 existing blogs and balanced for intent diversity.
6. **`05-editorial-geo-standard.md`** — the non-negotiable quality bar + GEO/schema
   checklist a page must pass before publish.
7. **`06-category-flow-template.md`** — Teaching mapped as the gold-standard member/paid
   flow, with the per-category "definition of done" for finalising the other categories
   (the single gate is the scoring rubric; accounting also needs an assessment steps file).

## Assets

- `templates/route-page.md` — the production template for a `/routes/{role}/{country}/` page.
- `data/routes.csv` — machine-usable full dataset (120 rows, corrected sources). This is
  the spine: when we build the `/routes` route handler, it can read from this.

## Status

Planning only. No `/routes` pages built yet. The existing live content is:
`/pathways/[category]` (11 pillar guides) + `/blog` (10 SEO articles).
