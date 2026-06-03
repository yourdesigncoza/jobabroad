# SEO Indexing Log

Tracks Google Search Console indexing status for every URL in the sitemap, and
the manual *Request Indexing* submissions made via GSC's URL Inspection tool
(limit ~10/day).

**Why this exists:** the domain is young (launched ~May 2026) with near-zero
backlinks, so Google discovers pages via the sitemap but leaves most as
"Discovered / Crawled – currently not indexed". Manual submission + internal
linking (the homepage "Browse everything" section, shipped 03 Jun) + backlinks
are the levers to climb the index rate.

## Status legend

- ✅ **Indexed** — confirmed live in Google's index
- 🔄 **Requested** — manual Request Indexing submitted (date noted)
- ⬜ **Not submitted** — in sitemap, awaiting organic crawl or future submission

## Snapshot — 03 Jun 2026

- **Indexed:** 3 / 51
- **Requested (awaiting):** 10
- **Sitemap total:** 51 URLs

---

## Core & static

| URL | Status |
|---|---|
| `/` | ✅ Indexed |
| `/directory` | 🔄 Requested 03 Jun |
| `/blog` | ⬜ |
| `/recruiters` | ⬜ |
| `/scam-warnings` | ⬜ |

## Pathways (pillar pages)

| URL | Status |
|---|---|
| `/pathways/healthcare` | ✅ Indexed |
| `/pathways/teaching` | 🔄 Requested 03 Jun |
| `/pathways/tefl` | 🔄 Requested 03 Jun |
| `/pathways/seasonal` | 🔄 Requested 03 Jun |
| `/pathways/accounting` | ⬜ |
| `/pathways/au-pair` | ⬜ |
| `/pathways/engineering` | ⬜ |
| `/pathways/farming` | ⬜ |
| `/pathways/hospitality` | ⬜ |
| `/pathways/it-tech` | ⬜ |
| `/pathways/trades` | ⬜ |

## Blog

| URL | Status |
|---|---|
| `/blog/au-pair-in-america-from-south-africa` | ✅ Indexed |
| `/blog/best-countries-south-africans-work-abroad` | ⬜ |
| `/blog/document-checklist-working-abroad-south-africa` | ⬜ |
| `/blog/it-jobs-abroad-from-south-africa` | ⬜ |
| `/blog/nurse-salary-uk-vs-south-africa` | ⬜ |
| `/blog/nursing-jobs-uk-from-south-africa` | ⬜ |
| `/blog/teach-in-uk-from-south-africa` | ⬜ |
| `/blog/uk-ancestry-visa-vs-skilled-worker-visa` | ⬜ |
| `/blog/work-abroad-recruitment-scams-south-africa` | ⬜ |
| `/blog/work-abroad-without-a-degree-south-africa` | ⬜ |

## Compare

| URL | Status |
|---|---|
| `/compare/electrician-uk-vs-australia-south-africa` | 🔄 Requested 03 Jun |
| `/compare/nursing-uk-vs-ireland-south-africa` | 🔄 Requested 03 Jun |
| `/compare/software-developer-ireland-vs-germany-vs-canada-south-africa` | 🔄 Requested 03 Jun |

## Guides

| URL | Status |
|---|---|
| `/guides/apostille-dirco` | 🔄 Requested 03 Jun |
| `/guides/police-clearance` | 🔄 Requested 03 Jun |
| `/guides/saqa-evaluation` | 🔄 Requested 03 Jun |

## Routes (role × country)

Not individually submitted — these are now one click below `/directory`
(submitted indirectly once `/directory` is crawled).

| URL | Status |
|---|---|
| `/routes/accountant/canada` | ⬜ |
| `/routes/accountant/united-kingdom` | ⬜ |
| `/routes/au-pair/netherlands` | ⬜ |
| `/routes/carnival-worker/united-states` | ⬜ |
| `/routes/chef/uae` | ⬜ |
| `/routes/civil-engineer/australia` | ⬜ |
| `/routes/civil-engineer/canada` | ⬜ |
| `/routes/electrician/australia` | ⬜ |
| `/routes/electrician/united-kingdom` | ⬜ |
| `/routes/plumber/united-kingdom` | ⬜ |
| `/routes/registered-nurse/australia` | ⬜ |
| `/routes/registered-nurse/ireland` | ⬜ |
| `/routes/registered-nurse/new-zealand` | ⬜ |
| `/routes/seasonal-farm-worker/united-kingdom` | ⬜ |
| `/routes/software-developer/canada` | ⬜ |
| `/routes/software-developer/germany` | ⬜ |
| `/routes/software-developer/ireland` | ⬜ |
| `/routes/teacher/uae` | ⬜ |
| `/routes/tefl-teacher/south-korea` | ⬜ |

---

## Submission history

### 03 Jun 2026 (10 submitted)

- `/directory` — the hub; crawling it surfaces all 19 routes
- `/pathways/teaching`
- `/pathways/tefl`
- `/pathways/seasonal`
- `/compare/electrician-uk-vs-australia-south-africa`
- `/compare/nursing-uk-vs-ireland-south-africa`
- `/compare/software-developer-ireland-vs-germany-vs-canada-south-africa`
- `/guides/apostille-dirco`
- `/guides/police-clearance`
- `/guides/saqa-evaluation`

## Next to submit (priority order)

1. `/pathways/it-tech`, `/pathways/engineering` — strong pillars
2. Top blog posts: `/blog/nursing-jobs-uk-from-south-africa`, `/blog/teach-in-uk-from-south-africa`
3. Flagship routes: `/routes/registered-nurse/ireland`, `/routes/software-developer/germany`
4. Remaining pathways: `/pathways/accounting`, `/pathways/au-pair`, `/pathways/farming`, `/pathways/hospitality`, `/pathways/trades`
5. `/recruiters`, `/scam-warnings`, `/blog` index
