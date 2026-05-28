# Route Plan — the 120-route database

Full machine-usable data: **`data/routes.csv`** (120 rows). This doc is the human view:
what's in it, how it maps to our site, and the data issues we fixed or flagged.

## Category mapping (pack → our real slugs)

The pack used our 11 homepage tiles. All map cleanly to the live `content/pathways/` slugs:

| Pack category | Our slug | Routes | Pathway pillar |
|---|---|---:|---|
| Healthcare | `healthcare` | 11 | `/pathways/healthcare` |
| IT / Tech | `it-tech` | 8 | `/pathways/it-tech` |
| Engineering | `engineering` | 33 | `/pathways/engineering` |
| Teaching | `teaching` | 6 | `/pathways/teaching` |
| Accounting | `accounting` | 6 | `/pathways/accounting` |
| Farming | `farming` | 11 | `/pathways/farming` |
| Carnival / Seasonal | `seasonal` | 6 | `/pathways/seasonal` |
| Hospitality | `hospitality` | 6 | `/pathways/hospitality` |
| Trades | `trades` | 21 | `/pathways/trades` |
| TEFL | `tefl` | 6 | `/pathways/tefl` |
| Au Pair | `au-pair` | 6 | `/pathways/au-pair` |

URL pattern: `/routes/{role_slug}/{country_slug}/` — e.g.
`/routes/registered-nurse/united-kingdom/`. Every route page links up to its category
pillar above.

## Countries covered

UK (25), UAE (15), Australia (13), USA (12), Canada (12), Ireland (11), NZ (11),
Germany (10), South Korea (2), Japan (2), Netherlands (2), + single routes for Saudi
Arabia, Qatar, China, Vietnam, France.

## Data issues — fixed

**Root cause:** the pack's source-URL generator had a broken fallback. Whenever it
lacked a country mapping it defaulted to one of three wrong URLs — the UAE portal
(`u.ae`), a generic `gov.uk` work-visa page, or a US J-1 page. Result: **89 of 120**
official-source URLs were wrong or generic. Examples:

- Registered Nurse → **Saudi Arabia** cited the **UAE** government site.
- Software Developer → **Germany / Australia** cited **gov.uk** (UK).
- Routes in **Netherlands, China, Vietnam, France** cited UAE or US J-1 pages.

We rebuilt the source mapping per country × route family. See `02-source-map.md`.
`data/routes.csv` carries both `official_source_original` (the buggy value, for audit)
and `official_source_corrected` (use this), plus `source_confidence`.

## Data issues — flagged (verify before publish)

7 routes have `source_confidence = verify` because we could not confirm the exact
official deep-link without live search (Brave quota was exhausted during planning).
Countries: **Saudi Arabia, Qatar, China, Vietnam, France, Netherlands.** The canonical
domain is correct; the exact page path must be confirmed during page research. Per the
project's unresolved-claims rule, never publish an unverified official source — confirm
it first (a quick Google AI-Overview `email/site` check usually surfaces it).

## Known weakness in the priority scoring

The pack's `priority_score` does **not** differentiate within a role family — every
trades route (electrician/plumber/welder × 7 countries) is tied at **56.1**. So the raw
"top 30" is ~20 near-identical trades pages, which would mean publishing 20 trade fact
sheets before a single hospitality, accounting, or TEFL page.

**Do not publish by raw rank.** The sprint plan (`04-sprint-plan.md`) re-sequences for
*intent and category diversity* and clusters trades sensibly (lead with one destination,
e.g. trades → Australia, then expand) instead of 20 thin parallel pages.

## Engineering (33 routes) — the biggest block

A third of the database is engineering (civil/mechanical/electrical × ~7 countries).
High commercial value but also the highest research cost (skills assessment + licensing
vary by country and discipline). Treat engineering as its own later cluster, not part of
the first sprints — it needs careful per-discipline source work (Engineers Australia,
ECSA recognition, etc.).
